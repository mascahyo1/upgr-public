export interface CredentialInput {
  nama: unknown
  provider: unknown
  is_production: unknown
  merchant_id?: unknown
  key: unknown
  secret: unknown
  webhook_verify_token?: unknown
  deskripsi?: unknown
}

export function isHttpUrl(u: string) {
  const m = /^https?:\/\/([^/\s]+)(\/\S*)?$/.exec(u)
  if (!m) return false
  const host = (m[1] ?? '').split(':')[0]?.toLowerCase() ?? ''
  if (host === 'localhost') return true
  return host.indexOf('.') >= 0
}

export interface WebhookInput {
  nama?: unknown
  url: unknown
  prefix?: unknown
  is_active?: unknown
  verify_token?: unknown
  deskripsi?: unknown
}

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
  const tenantId = String(input.tenant_id ?? '01a18296-88bb-7cd3-888e-b69cb5214659').trim() || '01a18296-88bb-7cd3-888e-b69cb5214659'

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

export function validateCredential(input: CredentialInput) {
  const errs: Record<string, string> = {}
  const nama = String(input.nama ?? '').trim()
  const provider = String(input.provider ?? '').trim().toLowerCase()
  const merchant = String(input.merchant_id ?? '').trim()
  const key = String(input.key ?? '').trim()
  const secret = String(input.secret ?? '')
  const token = String(input.webhook_verify_token ?? '').trim()
  const deskripsi = String(input.deskripsi ?? '').trim()
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

  return {
    errs,
    clean: { nama, provider, is_production: isProd, merchant_id: merchant, key, secret, webhook_verify_token: token, deskripsi }
  }
}
