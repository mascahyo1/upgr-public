// Pecahan server/utils/validate.ts — TAMBAH api-key.
// Controller lama (TIDAK diubah): server/api/tenant/api-keys/index.post.ts
//   import { validateApiKey } from '../../../../utils/validate'
// Peta: '../../../../utils/validate' -> '~/server/request/web/tenant/api-keys/tambah'
// Default tenant_id dari _shared/bentuk (sumber tunggal models/api-key.ts),
// menggantikan literal '01a18296-88bb-7cd3-888e-b69cb5214659' di validate.ts.
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
