// Sumber pola: server/api_web/credentials/[id]/logs/index.post.ts (bentuk baris log +
// batas 200 log/kredensial) + server/api_web/credentials/[id]/webhooks/[wid]/index.get.ts
// (pengambilan webhook). DIMODIFIKASI: endpoint ini benar-benar POST payload uji
// ke URL webhook lalu mencatat hasilnya sebagai log. Pengiriman: POST JSON dengan
// header Content-Type + X-UPGR-Test dan body {event, credential_id, webhook_id,
// nama, prefix, sent_at} (tanpa secret). Hasil kirim dicatat ke webhook_logs
// TANPA secret: 4 kolom detail request_header/response_header (JSON, nilai
// Authorization dan verify-token disensor jadi '***', kunci lain apa adanya),
// request_body (body JSON yang dikirim), response_body (body respons app tujuan),
// tiap nilainya dipotong 8000 char.
import { nowIso, uuidv7, cut8, headersJsonCensored, bodyJson } from '../../../../../../utils/db'
import { q, qOne, tx } from '../../../../../../utils/mysql'
import { toWh } from '../../../../../../models/webhook'
import { toLog } from '../../../../../../models/log'
import { requireCred } from '../../../../../../utils/wh'

const MAX_LOG_PER_CRED = 200

// uuidv7/cut8/headersJsonCensored/bodyJson dari server/utils/db
// (satu-satunya salinan helper sensor).

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const wid = getRouterParam(event, 'wid') as string
  await requireCred(id)
  const w = await qOne<any>('SELECT * FROM webhooks WHERE id = ? AND credential_id = ?', [wid, id])
  if (!w) {
    throw createError({ statusCode: 404, data: { error: 'Webhook tidak ditemukan.' } })
  }
  const wh = toWh(w)
  if (!wh.is_active) {
    throw createError({ statusCode: 422, data: { errors: { webhook: 'Webhook nonaktif. Aktifkan dulu untuk uji kirim.' } } })
  }
  const t = nowIso()
  const payload = {
    event: 'Uji coba',
    credential_id: id,
    webhook_id: wh.id,
    nama: wh.nama,
    prefix: wh.prefix,
    sent_at: t
  }
  const reqHeaders = { 'Content-Type': 'application/json', 'User-Agent': 'UPGR/1.0', 'X-UPGR-Test': '1' }
  const reqHead = cut8(headersJsonCensored(reqHeaders))
  const reqBody = cut8(bodyJson(payload))
  let hasil = 'gagal'
  let http: number | null = null
  let pesan = ''
  let resHead = ''
  let resBody = ''
  try {
    const res = await $fetch.raw(wh.url, {
      method: 'POST',
      headers: reqHeaders,
      body: payload,
      timeout: 10000,
      ignoreResponseError: true
    })
    http = res.status
    resHead = cut8(headersJsonCensored((res as any).headers))
    resBody = cut8(bodyJson((res as any)._data))
    if (res.status >= 200 && res.status < 300) hasil = 'terkirim'
    else pesan = `HTTP ${res.status}`
  } catch (err: any) {
    pesan = String(err?.message || 'tidak terjangkau').slice(0, 2000)
  }
  const row = {
    id: uuidv7(), credential_id: id, webhook_id: wh.id,
    nama: wh.nama || wh.url, url: wh.url, event: 'Uji coba',
    hasil, http, pesan, ip: '', user_agent: 'UPGR/1.0', created_at: t,
    request_header: reqHead, request_body: reqBody,
    response_header: resHead, response_body: resBody
  }
  await tx(async (conn) => {
    await conn.query(`INSERT INTO webhook_logs (id, credential_id, webhook_id, nama, url, event, hasil, http, pesan, ip, user_agent, request_header, request_body, response_header, response_body, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.credential_id, row.webhook_id, row.nama, row.url, row.event, row.hasil, row.http, row.pesan, row.ip, row.user_agent, row.request_header, row.request_body, row.response_header, row.response_body, row.created_at])
    const overRows: any = await conn.query('SELECT COUNT(*) AS n FROM webhook_logs WHERE credential_id = ?', [id])
    const over = (overRows[0][0]?.n ?? 0) - MAX_LOG_PER_CRED
    if (over > 0) {
      const oldRows: any = await conn.query('SELECT id FROM webhook_logs WHERE credential_id = ? ORDER BY created_at ASC, id ASC LIMIT ?', [id, over])
      const ids = (oldRows[0] as any[]).map(r => r.id)
      if (ids.length) await conn.query(`DELETE FROM webhook_logs WHERE id IN (${ids.map(() => '?').join(',')})`, ids as any[])
    }
  })
  return { data: toLog(row) }
})
