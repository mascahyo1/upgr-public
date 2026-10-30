// Pecahan server/utils/validate.ts — TAMBAH konfigurasi (provider).
// Controller lama (TIDAK diubah): server/api/provider/konfigurasi/index.post.ts
//   import { validateKonfigurasi } from '../../../../utils/validate'
// Peta: '../../../../utils/validate' -> '~/server/request/web/provider/konfigurasi/tambah'
export interface KonfigInput {
  kode: unknown
  nama: unknown
  type?: unknown
  value?: unknown
  deskripsi?: unknown
}

const KONFIG_TYPES = ['kredensial', 'text', 'number', 'boolean']

export function validateKonfigurasi(input: KonfigInput) {
  const errs: Record<string, string> = {}
  const kode = String(input.kode ?? '').trim().toLowerCase()
  const nama = String(input.nama ?? '').trim()
  const type = String(input.type ?? 'text')
  const value = String(input.value ?? '')
  const deskripsi = String(input.deskripsi ?? '').trim()

  if (!kode) errs.kode = 'Kode wajib diisi.'
  else if (!/^[a-z0-9][a-z0-9_-]{1,49}$/.test(kode)) errs.kode = 'Kode 2-50 karakter: huruf kecil, angka, dash, underscore.'
  if (!nama) errs.nama = 'Nama wajib diisi.'
  else if (nama.length > 100) errs.nama = 'Nama maksimal 100 karakter.'
  if (KONFIG_TYPES.indexOf(type) < 0) errs.type = 'Tipe tidak valid.'
  else if (type === 'kredensial') {
    if (value.length < 4) errs.value = 'Kredensial minimal 4 karakter.'
    else if (value.length > 500) errs.value = 'Nilai maksimal 500 karakter.'
  } else if (type === 'number') {
    if (value.trim() === '' || !isFinite(Number(value))) errs.value = 'Nilai harus angka.'
    else if (value.length > 500) errs.value = 'Nilai maksimal 500 karakter.'
  } else if (type === 'boolean') {
    if (value !== 'true' && value !== 'false') errs.value = 'Nilai harus true atau false.'
  } else if (value.length > 500) errs.value = 'Nilai maksimal 500 karakter.'
  if (deskripsi.length > 500) errs.deskripsi = 'Deskripsi maksimal 500 karakter.'

  return { errs, clean: { kode, nama, type, value, deskripsi } }
}

export default validateKonfigurasi
