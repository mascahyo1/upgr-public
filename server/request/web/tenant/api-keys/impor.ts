// Pecahan server/utils/validate.ts — IMPOR api-key (bulk, per item).
// Controller lama (TIDAK diubah): server/api/tenant/api-keys/bulk-import.post.ts
//   import { validateApiKey } from '../../../../utils/validate'
// Peta: '../../../../utils/validate' -> '~/server/request/web/tenant/api-keys/impor'
// Isi identik dengan tambah.ts (controller memanggil per item).
import { DEFAULT_TENANT_ID } from '../../_shared/bentuk'

export interface ApiKeyInput {
  name: unknown
  status?: unknown
  key: unknown
  secret: unknown
  tenant_id?: unknown
}

export function validateApiKey(input: ApiKeyInput) {
  const errs: Record<string, string> = {}
  const name = String(input.name ?? '').trim()
  const statusRaw = input.status
  const status = statusRaw === 'nonaktif' ? 'nonaktif' : 'aktif'
  const key = String(input.key ?? '').trim()
  const secret = String(input.secret ?? '')
  const tenantId = String(input.tenant_id ?? DEFAULT_TENANT_ID).trim() || DEFAULT_TENANT_ID

  if (!name) errs.name = 'Nama wajib diisi.'
  else if (name.length > 100) errs.name = 'Nama maksimal 100 karakter.'
  if (statusRaw !== undefined && statusRaw !== 'aktif' && statusRaw !== 'nonaktif') errs.status = 'Status tidak valid.'
  if (!key) errs.key = 'Key wajib diisi.'
  else if (key.length < 4) errs.key = 'Key minimal 4 karakter.'
  else if (key.length > 200) errs.key = 'Key maksimal 200 karakter.'
  if (!secret) errs.secret = 'Secret wajib diisi.'
  else if (secret.length < 4) errs.secret = 'Secret minimal 4 karakter.'
  else if (secret.length > 200) errs.secret = 'Secret maksimal 200 karakter.'
  if (tenantId.length > 64) errs.tenant = 'Tenant ID maksimal 64 karakter.'

  return { errs, clean: { name, status, key, secret, tenant_id: tenantId } }
}

export default validateApiKey
