// Seed DUMMY untuk database DEV saja. JANGAN jalankan ke production.
// Pakai: set -a; source .env; set +a; node scripts/seed-dev-dummy.cjs
// Isi: 2 kredensial contoh, 2 API key, 1 tenant dummy, 4 konfigurasi.
const mysql = require('mysql2/promise');
const { scrypt, randomBytes } = require('node:crypto');

function nowIso() { return new Date().toISOString(); }
function newId(p) { return p + '-' + randomBytes(6).toString('hex'); }
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, buf) => {
      if (err) reject(err);
      else resolve(`scrypt$${salt}$${buf.toString('hex')}`);
    });
  });
}

(async () => {
  const db = (process.env.MYSQL_DB || '');
  if (!db.toLowerCase().includes('dev')) {
    console.error('BATAL: script dummy hanya untuk DB dev, MYSQL_DB=' + db);
    process.exit(1);
  }
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: db
  });
  const t = nowIso();
  for (const tbl of ['webhook_logs', 'webhooks', 'auth_attempts', 'sessions', 'tenant_api_keys', 'tenants', 'konfigurasi', 'credentials']) {
    await pool.query(`DELETE FROM ${tbl}`);
  }
  await pool.query(`INSERT INTO credentials (id, nama, provider, is_production, merchant_id, \`key\`, secret, webhook_verify_token, deskripsi, created_at, updated_at) VALUES
    ('01a18296-88bf-7931-ba3d-b391e594d1a0', 'Midtrans Sandbox', 'midtrans', 0, 'M-001', 'SB-Mid-client-001', 'SB-Mid-secret-001', 'tok-sb-001', 'Akun sandbox pengembang (DUMMY DEV)', ?, ?),
    ('01a18296-88bf-75af-b5a7-1eb6f2ded83e', 'DOKU Production', 'doku', 1, 'D-001', 'DK-client-001', 'DK-secret-001', 'tok-dk-001', 'Contoh produksi (DUMMY DEV)', ?, ?)`, [t, t, t, t]);
  await pool.query(`INSERT INTO tenant_api_keys (id, tenant_id, name, status, \`key\`, secret, created_at, updated_at) VALUES
    ('01a18296-88bf-7755-8da0-78ccc9236f14', '01a18296-88bb-7cd3-888e-b69cb5214659', 'ERP Production', 'aktif', 'upgrk_erp_prod_001', 'upgrs_erp_prod_001', ?, ?),
    ('01a18296-88bf-7c94-b816-061dbdb5445d', '01a18296-88bb-7cd3-888e-b69cb5214659', 'BIS Staging', 'nonaktif', 'upgrk_bis_stg_001', 'upgrs_bis_stg_001', ?, ?)`, [t, t, t, t]);
  await pool.query(`INSERT INTO tenants (id, nama, email, password_hash, deskripsi, status, created_by, created_at, updated_at)
    VALUES ('01a18296-88bb-7cd3-888e-b69cb5214659', 'PT Contoh Teknologi Indonesia', 'admin@example.com', ?, 'Tenant contoh (DUMMY DEV)', 'aktif', 'provider', ?, ?)`,
    [await hashPassword('sandi-tenant-123'), t, t]);
  await pool.query(`INSERT INTO konfigurasi (id, kode, nama, type, value, deskripsi, created_at, updated_at) VALUES
    ('01a18296-88bf-7ff0-9911-9832653597ae', 'midtrans-server-key', 'Midtrans Server Key', 'kredensial', 'SB-Mid-test-123', 'Server key gateway Midtrans (DUMMY DEV)', ?, ?),
    ('01a18296-88bf-76f5-99d4-eee6e7a493b4', 'webhook-erp', 'Webhook ERP RT/RW Net', 'text', 'https://erp.contoh.id/w/midtrans', 'Penerus webhook (DUMMY DEV)', ?, ?),
    ('01a18296-88bf-7d9c-95a3-65c38bbac987', 'retry-maksimal', 'Retry Maksimal', 'number', '3', 'Percobaan ulang pengiriman webhook', ?, ?),
    ('01a18296-88bf-756f-b75a-edff0016b16d', 'mode-pemeliharaan', 'Mode Pemeliharaan', 'boolean', 'false', 'true = tahan penyaluran webhook sementara', ?, ?)`, [t, t, t, t, t, t, t, t]);
  await pool.end();
  console.log('seed dev dummy OK di ' + db);
})().catch((e) => { console.error('GAGAL: ' + (e && e.message)); process.exit(1); });
