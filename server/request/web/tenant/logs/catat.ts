// Pecahan server/utils/validate.ts — CATAT log uji kirim.
// Controller lama (TIDAK diubah): server/api/credentials/[id]/logs/index.post.ts
//   import { validateLog } from '../../../../utils/validate'
// Peta: '../../../../utils/validate' -> '~/server/request/web/tenant/logs/catat'
export interface LogInput {
  webhook_id?: unknown
  nama?: unknown
  url?: unknown
  event?: unknown
  hasil: unknown
  http?: unknown
  pesan?: unknown
  request_header?: unknown
  request_body?: unknown
  response_header?: unknown
  response_body?: unknown
}

export function validateLog(input: LogInput) {
  const errs: Record<string, string> = {}
  const hasil = String(input.hasil ?? '').trim()
  const httpRaw = input.http
  let http: number | null = null
  if (hasil !== 'terkirim' && hasil !== 'gagal') errs.hasil = 'Hasil harus terkirim atau gagal.'
  if (httpRaw !== undefined && httpRaw !== null && httpRaw !== '') {
    const n = Number(httpRaw)
    if (!Number.isInteger(n) || n < 100 || n > 599) errs.http = 'HTTP harus 100-599.'
    else http = n
  }
  const nama = String(input.nama ?? '').slice(0, 100)
  const url = String(input.url ?? '').slice(0, 500)
  const event = String(input.event ?? 'Uji kirim').trim().slice(0, 100) || 'Uji kirim'
  const pesan = String(input.pesan ?? '').slice(0, 2000)
  const webhookId = String(input.webhook_id ?? '').slice(0, 60)

  const request_header = String(input.request_header ?? '').slice(0, 8000)
  const request_body = String(input.request_body ?? '').slice(0, 8000)
  const response_header = String(input.response_header ?? '').slice(0, 8000)
  const response_body = String(input.response_body ?? '').slice(0, 8000)
  return {
    errs,

    clean: { webhook_id: webhookId, nama, url, event, hasil, http, pesan, request_header, request_body, response_header, response_body }
  }
}

export default validateLog
