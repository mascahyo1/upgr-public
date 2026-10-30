// Pecahan server/utils/validate.ts — UBAH profil tenant.
// Controller lama (TIDAK diubah): server/api/tenant/profil/index.put.ts
//   import { validateProfil } from '../../../../utils/validate'
// Peta: '../../../../utils/validate' -> '~/server/request/web/tenant/profil/ubah'
export interface ProfilInput {
  nama: unknown
  email: unknown
  deskripsi?: unknown
}

export function validateProfil(input: ProfilInput) {
  const errs: Record<string, string> = {}
  const nama = String(input.nama ?? '').trim()
  const email = String(input.email ?? '').trim()
  const deskripsi = String(input.deskripsi ?? '').trim()

  if (!nama) errs.nama = 'Nama tenant wajib diisi.'
  else if (nama.length > 100) errs.nama = 'Nama maksimal 100 karakter.'
  if (!email) errs.email = 'Email wajib diisi.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email tidak valid.'
  else if (email.length > 100) errs.email = 'Email maksimal 100 karakter.'
  if (deskripsi.length > 500) errs.deskripsi = 'Deskripsi maksimal 500 karakter.'

  return { errs, clean: { nama, email, deskripsi } }
}

export default validateProfil
