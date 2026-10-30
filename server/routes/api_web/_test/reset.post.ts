import { nowIso } from '../../../utils/db'
import { q } from '../../../utils/mysql'
import { hashPassword } from '../../../utils/password'

const SEEDS = [
  { id: '01a18296-88bf-7931-ba3d-b391e594d1a0', nama: 'Midtrans Sandbox', provider: 'midtrans', is_production: 0, merchant_id: 'M-001', key: 'SB-Mid-client-001', secret: 'SB-Mid-secret-001', webhook_verify_token: 'tok-sb-001', deskripsi: 'Akun sandbox pengembang', status: 'aktif' },
  { id: '01a18296-88bf-75af-b5a7-1eb6f2ded83e', nama: 'DOKU Production', provider: 'doku', is_production: 1, merchant_id: 'D-001', key: 'DK-client-001', secret: 'DK-secret-001', webhook_verify_token: 'tok-dk-001', deskripsi: '', status: 'nonaktif' }
]

export default defineEventHandler(async (event) => {
  if (process.env.ALLOW_TEST_API !== '1') {
    throw createError({ statusCode: 403, data: { error: 'Endpoint uji hanya tersedia di development.' } })
  }
  await q('DELETE FROM webhook_logs')
  await q('DELETE FROM webhooks')
  await q('DELETE FROM auth_attempts')
  await q('DELETE FROM provider_logs')
  await q('DELETE FROM api_logs')
  await q('DELETE FROM sessions')
  await q('DELETE FROM tenant_api_keys')
  await q('DELETE FROM tenants')
  await q('DELETE FROM konfigurasi')
  await q('DELETE FROM credentials')
  const t = nowIso()
  for (const s of SEEDS) {
    await q(`INSERT INTO credentials (id, nama, provider, is_production, merchant_id, \`key\`, secret, webhook_verify_token, deskripsi, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.nama, s.provider, s.is_production, s.merchant_id, s.key, s.secret, s.webhook_verify_token, s.deskripsi, s.status, t, t])
  }
  const apiSeeds = [
    { id: '01a18296-88bf-7755-8da0-78ccc9236f14', tenant_id: '01a18296-88bb-7cd3-888e-b69cb5214659', name: 'ERP Production', status: 'aktif', key: 'upgrk_erp_prod_001', secret: 'upgrs_erp_prod_001' },
    { id: '01a18296-88bf-7c94-b816-061dbdb5445d', tenant_id: '01a18296-88bb-7cd3-888e-b69cb5214659', name: 'BIS Staging', status: 'nonaktif', key: 'upgrk_bis_stg_001', secret: 'upgrs_bis_stg_001' }
  ]
  for (const a of apiSeeds) {
    await q(`INSERT INTO tenant_api_keys (id, tenant_id, name, status, \`key\`, secret, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.tenant_id, a.name, a.status, a.key, a.secret, t, t])
  }

  await q(`INSERT INTO tenants (id, nama, email, password_hash, deskripsi, status, created_by, created_at, updated_at)
    VALUES ('01a18296-88bb-7cd3-888e-b69cb5214659', 'PT Contoh Teknologi Indonesia', 'admin@example.com', ?, 'Tenant utama. Segera atur ulang kata sandi.', 'aktif', 'provider', ?, ?)`,
    [await hashPassword('sandi-tenant-123'), t, t])
  const konfigSeeds = [
    { id: '01a18296-88bf-7ff0-9911-9832653597ae', kode: 'midtrans-server-key', nama: 'Midtrans Server Key', type: 'kredensial', value: 'SB-Mid-test-123', deskripsi: 'Server key gateway Midtrans. Disensor di layar, enkripsi menyusul.' },
    { id: '01a18296-88bf-76f5-99d4-eee6e7a493b4', kode: 'webhook-erp', nama: 'Webhook ERP RT/RW Net', type: 'text', value: 'https://erp.contoh.id/w/midtrans', deskripsi: 'Penerus webhook ke ERP RT/RW Net.' },
    { id: '01a18296-88bf-7d9c-95a3-65c38bbac987', kode: 'retry-maksimal', nama: 'Retry Maksimal', type: 'number', value: '3', deskripsi: 'Jumlah percobaan ulang pengiriman webhook.' },
    { id: '01a18296-88bf-756f-b75a-edff0016b16d', kode: 'mode-pemeliharaan', nama: 'Mode Pemeliharaan', type: 'boolean', value: 'false', deskripsi: 'true = tahan penyaluran webhook sementara.' }
  ]
  for (const k of konfigSeeds) {
    await q('INSERT INTO konfigurasi (id, kode, nama, type, value, deskripsi, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [k.id, k.kode, k.nama, k.type, k.value, k.deskripsi, t, t])
  }
  return { data: { ok: true, seeds: SEEDS.length } }
})
