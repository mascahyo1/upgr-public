// Pecahan server/utils/validate.ts — IMPOR kredensial (bulk, per item).
// Controller lama (TIDAK diubah): server/api/credentials/bulk-import.post.ts
//   import { validateCredential } from '../../../../utils/validate'
// Peta: '../../../../utils/validate' -> '~/server/request/web/tenant/credentials/impor'
// Isi identik dengan tambah.ts (controller memanggil per item).
export interface CredentialInput {
  nama: unknown
  provider: unknown
  is_production: unknown
  merchant_id?: unknown
  key: unknown
  secret: unknown
  webhook_verify_token?: unknown
  deskripsi?: unknown
  status?: unknown
}

export function validateCredential(input: CredentialInput) {
  const errs: Record<string, string> = {}
  const nama = String(input.nama ?? '').trim()
  const provider = String(input.provider ?? '').trim().toLowerCase()
  const merchant = String(input.merchant_id ?? '').trim()
  const key = String(input.key ?? '').trim()
  const secret = String(input.secret ?? '')
  const token = String(input.webhook_verify_token ?? '').trim()
  const deskripsi = String(input.deskripsi ?? '').trim()
  const statusRaw = String(input.status ?? 'aktif').trim().toLowerCase()
  const status = statusRaw === 'nonaktif' ? 'nonaktif' : 'aktif'
  const isProd = input.is_production === true || input.is_production === 1 || input.is_production === '1'

  if (!nama) errs.nama = 'Nama wajib diisi.'
  else if (nama.length > 100) errs.nama = 'Nama maksimal 100 karakter.'
  if (!provider) errs.provider = 'Provider wajib diisi.'
  else if (!/^[a-z0-9][a-z0-9_-]{1,29}$/.test(provider)) errs.provider = 'Provider 2-30 karakter: huruf kecil, angka, dash, underscore.'
  if (merchant.length > 100) errs.merchant = 'Merchant ID maksimal 100 karakter.'
  if (!key) errs.key = 'Key wajib diisi.'
  else if (key.length < 4) errs.key = 'Key minimal 4 karakter.'
  else if (key.length > 200) errs.key = 'Key maksimal 200 karakter.'
  if (!secret) errs.secret = 'Secret wajib diisi.'
  else if (secret.length < 4) errs.secret = 'Secret minimal 4 karakter.'
  else if (secret.length > 200) errs.secret = 'Secret maksimal 200 karakter.'
  if (token.length > 200) errs.token = 'Token maksimal 200 karakter.'
  if (deskripsi.length > 500) errs.deskripsi = 'Deskripsi maksimal 500 karakter.'
  if (input.status !== undefined && statusRaw !== 'aktif' && statusRaw !== 'nonaktif') errs.status = 'Status tidak valid.'

  return {
    errs,
    clean: { nama, provider, is_production: isProd, merchant_id: merchant, key, secret, webhook_verify_token: token, deskripsi, status }
  }
}

export default validateCredential
