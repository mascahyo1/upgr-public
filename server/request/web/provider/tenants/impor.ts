// Pecahan server/utils/validate.ts — IMPOR tenant (bulk, per item, provider).
// Controller lama (TIDAK diubah): server/api/provider/tenants/bulk-import.post.ts
//   import { validateTenant } from '../../../../utils/validate'
// Peta: '../../../../utils/validate' -> '~/server/request/web/provider/tenants/impor'
// (controller memanggil dengan isEdit: false; isi validator identik tambah.ts).
export interface TenantInput {
  nama: unknown
  email: unknown
  password?: unknown
  deskripsi?: unknown
  status?: unknown
  isEdit?: boolean
}

export function validateTenant(input: TenantInput) {
  const errs: Record<string, string> = {}
  const nama = String(input.nama ?? '').trim()
  const email = String(input.email ?? '').trim()
  const password = String(input.password ?? '')
  const deskripsi = String(input.deskripsi ?? '').trim()
  const statusRaw = input.status
  const status = statusRaw === 'nonaktif' ? 'nonaktif' : 'aktif'

  if (!nama) errs.nama = 'Nama wajib diisi.'
  else if (nama.length > 100) errs.nama = 'Nama maksimal 100 karakter.'
  if (!email) errs.email = 'Email wajib diisi.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email tidak valid.'
  else if (email.length > 100) errs.email = 'Email maksimal 100 karakter.'
  if (!input.isEdit || password) {
    if (!password) errs.password = 'Kata sandi wajib diisi.'
    else if (password.length < 8) errs.password = 'Kata sandi minimal 8 karakter.'
  }
  if (deskripsi.length > 500) errs.deskripsi = 'Deskripsi maksimal 500 karakter.'
  if (statusRaw !== undefined && statusRaw !== 'aktif' && statusRaw !== 'nonaktif') errs.status = 'Status tidak valid.'

  return { errs, clean: { nama, email, password, deskripsi, status } }
}

export default validateTenant
