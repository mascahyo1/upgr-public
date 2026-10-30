// Pecahan server/utils/validate.ts — UBAH webhook.
// Controller lama (TIDAK diubah): server/api/credentials/[id]/webhooks/[wid]/index.put.ts
//   import { validateWebhook } from '../../../../utils/validate'
// Peta: '../../../../utils/validate' -> '~/server/request/web/tenant/webhooks/ubah'
// Isi identik dengan tambah.ts.
import { isHttpUrl } from '../../_shared/http'

export interface WebhookInput {
  nama?: unknown
  url: unknown
  prefix?: unknown
  is_active?: unknown
  verify_token?: unknown
  deskripsi?: unknown
}

export function validateWebhook(input: WebhookInput) {
  const errs: Record<string, string> = {}
  const nama = String(input.nama ?? '').trim()
  const url = String(input.url ?? '').trim()
  const prefix = String(input.prefix ?? '').trim()
  const token = String(input.verify_token ?? '').trim()
  const deskripsi = String(input.deskripsi ?? '').trim()
  const rawActive = input.is_active
  const isActive = rawActive === true || rawActive === 1 || rawActive === '1' || rawActive === 'aktif'

  if (!url) errs.url = 'URL webhook wajib diisi.'
  else if (!isHttpUrl(url)) errs.url = 'URL harus diawali http(s):// dengan host valid.'
  else if (url.length > 500) errs.url = 'URL maksimal 500 karakter.'
  if (rawActive !== true && rawActive !== false && rawActive !== 1 && rawActive !== 0 && rawActive !== '1' && rawActive !== '0' && rawActive !== 'aktif' && rawActive !== 'nonaktif') errs.active = 'Status tidak valid.'
  if (token.length > 200) errs.token = 'Token maksimal 200 karakter.'
  if (nama.length > 100) errs.nama = 'Nama maksimal 100 karakter.'
  if (deskripsi.length > 500) errs.deskripsi = 'Deskripsi maksimal 500 karakter.'
  if (prefix.length > 20) errs.prefix = 'Prefix maksimal 20 karakter.'
  else if (/\s/.test(prefix)) errs.prefix = 'Prefix tidak boleh mengandung spasi.'

  return {
    errs,
    clean: { nama, url, prefix, is_active: isActive, verify_token: token, deskripsi }
  }
}

export default validateWebhook
