// Bentuk baku hasil validasi + default tenant lintas-portal.
// DEFAULT_TENANT_ID sumber tunggal dari server/models/api-key.ts
// (dulu literal di server/utils/validate.ts validateApiKey).
// Semua file aksi api-keys mengimpor dari sini agar tidak divergen.
export { DEFAULT_TENANT_ID } from '../../../models/api-key'

export type Errs = Record<string, string>

export interface Hasil<T> {
  errs: Errs
  clean: T
}
