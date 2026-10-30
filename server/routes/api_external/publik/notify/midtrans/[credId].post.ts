// Notifikasi Midtrans masuk per kredensial (SLICE NOTIFY).
// POST /api_external/publik/notify/midtrans/[credId]
// - Baca raw body + headers, 404 bila kredensial tak ada.
// - Verifikasi signature Midtrans: SHA512(order_id+status_code+gross_amount+serverKey)
//   == signature_key, pakai node:crypto. serverKey dari DB (kolom secret, lalu key
//   sebagai cadangan); hanya di memori, TIDAK PERNAH ditulis ke log mana pun.
// - Tulis 1 baris provider_logs per panggilan (hasil ok/gagal).
// - Bila signature valid, teruskan body ke webhook AKTIF milik kredensial
//   (POST JSON + header X-Webhook-Token bila webhook punya verify_token) dan catat
//   tiap penerusan ke webhook_logs gaya test.post.ts (hasil terkirim/gagal).
// - Selain kredensial tak ada (404), selalu respons 200 JSON { ok }.
// Sumber pola: server/api_web/credentials/[id]/test.post.ts (uuidv7 + probe + tulis
// api_logs tanpa secret) + server/api_web/credentials/[id]/webhooks/[wid]/test.post.ts
// (POST ke URL webhook + catat webhook_logs + batas 200 log/kredensial).
import { createHash, timingSafeEqual } from 'node:crypto'
import { nowIso, uuidv7, safeHeaders } from '../../../../../utils/db'
import { q, qOne } from '../../../../../utils/mysql'
import { toWh } from '../../../../../models/webhook'
import { validateNotifyMidtrans } from '../../../../../request/api/publik/notify.midtrans.post'

// uuidv7/safeHeaders dari server/utils/db (satu-satunya salinan helper).
// Header sensitif tidak boleh tersimpan mentah di provider_logs.

const MAX_LOG_PER_CRED = 200
const MAX_PROVIDER_LOG_PER_CRED = 200

function sha512hex(s: string): string {
  return createHash('sha512').update(s, 'utf8').digest('hex')
}

function sigEqual(a: string, b: string): boolean {
  const x = String(a || '').trim().toLowerCase()
  const y = String(b || '').trim().toLowerCase()
  if (!x || !y || x.length !== y.length) return false
  try {
    return timingSafeEqual(Buffer.from(x, 'utf8'), Buffer.from(y, 'utf8'))
  } catch {
    return false
  }
}

// Tabel provider_logs dibuat + dimigrasi terpusat di server/utils/mysql.ts
// (ensureSchema via q()). Jangan buat DDL lokal agar FK + INDEX konsisten.

// Kolom request/response webhook_logs ditambah penulis lain di working copy
// (server/utils/mysql.ts); skema lama tidak memilikinya. Deteksi sekali per
// request agar INSERT cocok di kedua skema.
async function webhookLogExtraCols(): Promise<string[]> {
  try {
    const rows = await q<any>(
      `SELECT COLUMN_NAME AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'webhook_logs' AND COLUMN_NAME IN (?, ?, ?, ?)`,
      ['request_header', 'request_body', 'response_header', 'response_body'])
    const have = new Set((rows as any[]).map((r) => String(r.c)))
    return ['request_header', 'request_body', 'response_header', 'response_body'].filter((c) => have.has(c))
  } catch {
    return []
  }
}

export default defineEventHandler(async (event) => {
  const started = Date.now()
  const credId = getRouterParam(event, 'credId') as string
  const raw = (await readRawBody(event)) ?? ''
  const reqHead = safeHeaders(getRequestHeaders(event) as Record<string, string | string[] | undefined>)
  const reqHeadJson = JSON.stringify(reqHead).slice(0, 8000)
  const reqBodyRaw = String(raw).slice(0, 8000)
  const senderIp = String(getRequestIP(event, { xForwardedFor: true }) || 'unknown').slice(0, 64)
  const senderUa = String(reqHead['user-agent'] || '').slice(0, 500)

  const cred = await qOne<any>('SELECT * FROM credentials WHERE id = ?', [credId])
  if (!cred) {
    throw createError({ statusCode: 404, data: { error: 'Kredensial tidak ditemukan.' } })
  }
  const provider = String(cred.provider || '').trim().toLowerCase() || 'midtrans'

  let body: any = null
  let parseError = ''
  try {
    body = raw ? JSON.parse(String(raw)) : null
  } catch (err: any) {
    parseError = String(err?.message || 'body bukan JSON').slice(0, 200)
  }

  const orderId = body ? String(body.order_id ?? '') : ''
  const statusCode = body ? String(body.status_code ?? '') : ''
  const grossAmount = body ? String(body.gross_amount ?? '') : ''
  const signatureKey = body ? String(body.signature_key ?? '') : ''

  // serverKey dari DB, hanya di memori: secret dulu, key sebagai cadangan.
  const candidates = [String(cred.secret || ''), String(cred.key || '')]
    .map((s) => s.trim()).filter((s, i, a) => s && a.indexOf(s) === i)

  let valid = false
  let pesan = ''
  if (!body || parseError) {
    pesan = 'Body notifikasi bukan JSON yang valid.'
  } else if (Object.keys(validateNotifyMidtrans(body ?? {}).errs).length) {
    pesan = 'Field order_id/status_code/gross_amount/signature_key tidak lengkap.'
  } else if (!candidates.length) {
    pesan = 'Kunci kredensial kosong, signature tidak dapat diverifikasi.'
  } else {
    const expect = candidates.map((k) => sha512hex(`${orderId}${statusCode}${grossAmount}${k}`))
    valid = expect.some((e) => sigEqual(e, signatureKey))
    pesan = valid
      ? `Signature valid (order ${orderId}).`
      : `Signature tidak valid (order ${orderId || '-'}).`
  }

  // Teruskan ke webhook AKTIF bila signature valid. Filter prefix:
  // prefix kosong = terima semua order; prefix terisi = order_id wajib
  // diawali prefix tersebut, case-sensitive (mis. prefix INV cocok
  // dengan INV-1, tapi tidak dengan inv-1).
  const forwards: Array<{ id: string, url: string, hasil: string, http: number | null }> = []
  if (valid) {
    const rows = await q<any>(
      'SELECT * FROM webhooks WHERE credential_id = ? AND is_active = 1 ORDER BY created_at DESC, id DESC',
      [credId]) as any[]
    const targets = rows.filter((r) => {
      const p = String(toWh(r).prefix ?? '')
      if (!p) return true
      return orderId.startsWith(p)
    })
    const skipped = rows.length - targets.length
    if (skipped > 0) pesan += ` ${skipped} webhook dilewati (prefix tak cocok dengan order ${orderId}).`
    const extra = await webhookLogExtraCols()
    const t = nowIso()
    for (const r of targets) {
      const wh = toWh(r)
      const fwdBody = JSON.stringify(body)
      const sendHeaders: Record<string, string> = { 'Content-Type': 'application/json', 'User-Agent': 'UPGR/1.0' }
      if (wh.verify_token) sendHeaders['X-Webhook-Token'] = wh.verify_token
      let hasil = 'gagal'
      let http: number | null = null
      let msg = ''
      let fwdResHead = ''
      let fwdResBody = ''
      try {
        const res = await $fetch.raw(wh.url, {
          method: 'POST',
          headers: sendHeaders,
          body,
          timeout: 10000,
          ignoreResponseError: true
        })
        http = res.status
        try { fwdResHead = JSON.stringify(Object.fromEntries(new Headers(res.headers as any).entries())).slice(0, 8000) } catch { fwdResHead = '' }
        try { fwdResBody = JSON.stringify(res._data ?? null).slice(0, 8000) } catch { fwdResBody = '' }
        if (res.status >= 200 && res.status < 300) hasil = 'terkirim'
        else msg = `HTTP ${res.status}`
      } catch (err: any) {
        msg = String(err?.message || 'tidak terjangkau').slice(0, 2000)
      }
      // Gaya test.post.ts: simpan tanpa token/secret; token disensor.
      const logHeaders: Record<string, string> = { 'Content-Type': 'application/json', 'User-Agent': 'UPGR/1.0' }
      if (wh.verify_token) logHeaders['X-Webhook-Token'] = '[REDACTED]'
      const row: Record<string, any> = {
        id: uuidv7(),
        credential_id: credId,
        webhook_id: wh.id,
        nama: wh.nama || wh.url,
        url: wh.url,
        event: 'Midtrans notify',
        hasil,
        http,
        pesan: msg,
        ip: '',
        user_agent: 'UPGR/1.0',
        created_at: t
      }
      if (extra.length) {
        const vals: Record<string, string> = {
          request_header: JSON.stringify(logHeaders).slice(0, 8000),
          request_body: fwdBody.slice(0, 8000),
          response_header: fwdResHead,
          response_body: fwdResBody || (msg || (http === null ? 'tanpa respons' : `HTTP ${http}`)).slice(0, 8000)
        }
        for (const c of extra) row[c] = vals[c]
      }
      const cols = ['id', 'credential_id', 'webhook_id', 'nama', 'url', 'event', 'hasil', 'http', 'pesan', 'ip', 'user_agent', 'created_at', ...extra]
      await q(`INSERT INTO webhook_logs (${cols.join(', ')})
        VALUES (${cols.map(() => '?').join(', ')})`, cols.map((c) => row[c]))
      forwards.push({ id: wh.id, url: wh.url, hasil, http })
    }
    if (forwards.length) {
      const overRows: any = await q('SELECT COUNT(*) AS n FROM webhook_logs WHERE credential_id = ?', [credId])
      const over = Number(overRows?.[0]?.n ?? 0) - MAX_LOG_PER_CRED
      if (over > 0) {
        const oldRows: any = await q('SELECT id FROM webhook_logs WHERE credential_id = ? ORDER BY created_at ASC, id ASC LIMIT ?', [credId, over])
        const ids = ((oldRows ?? []) as any[]).map((x) => x.id)
        if (ids.length) await q(`DELETE FROM webhook_logs WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
      }
    }
  }

  const resBody = JSON.stringify({ ok: true })
  const resHeadJson = JSON.stringify({ 'content-type': 'application/json' })
  await q(`INSERT INTO provider_logs (id, credential_id, provider, method, url, http, durasi_ms, hasil, pesan, ip, user_agent, request_header, request_body, response_header, response_body, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [uuidv7(), credId, provider, String(event.method || 'POST').slice(0, 10), String(event.path || '').slice(0, 500),
      200, Date.now() - started, valid ? 'ok' : 'gagal', pesan.slice(0, 2000), senderIp, senderUa,
      reqHeadJson, reqBodyRaw, resHeadJson, resBody, nowIso()])
  const pCount: any = await q('SELECT COUNT(*) AS n FROM provider_logs WHERE credential_id = ?', [credId])
  const pOver = Number(pCount?.[0]?.n ?? 0) - MAX_PROVIDER_LOG_PER_CRED
  if (pOver > 0) {
    const pOld: any = await q('SELECT id FROM provider_logs WHERE credential_id = ? ORDER BY created_at ASC, id ASC LIMIT ?', [credId, pOver])
    const pIds = ((pOld ?? []) as any[]).map((x) => x.id)
    if (pIds.length) await q(`DELETE FROM provider_logs WHERE id IN (${pIds.map(() => '?').join(',')})`, pIds)
  }

  return { ok: true }
})
