// Seed AWAL untuk database PROD — terima jadi, tanpa argumen.
// Pakai di server: set -a; source .env; set +a; node scripts/seed-prod-awal.cjs
// - Berhenti bila MYSQL_DB mengandung dev/test, atau users/tenants sudah ada isi.
// - Membuat 1 provider + 1 tenant default (bisa diubah lewat UI/DB setelahnya).
// - Password ACAK 16 karakter, HANYA ditulis ke file 600 (default
//   ./.seed-awal di folder app). TIDAK pernah dicetak ke layar/log/repo.
// - Setelah login pertama: segera atur ulang lewat UI dan HAPUS file password.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { scrypt, randomBytes } = require('node:crypto');
function uuidv7() { const b = new Uint8Array(16); require('node:crypto').getRandomValues(b); const ms = Date.now(); b[0] = Math.floor(ms / 2 ** 40) & 0xff; b[1] = Math.floor(ms / 2 ** 32) & 0xff; b[2] = Math.floor(ms / 2 ** 24) & 0xff; b[3] = Math.floor(ms / 2 ** 16) & 0xff; b[4] = Math.floor(ms / 2 ** 8) & 0xff; b[5] = ms & 0xff; b[6] = 0x70 | (b[6] & 0x0f); b[8] = 0x80 | (b[8] & 0x3f); const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')); return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20); }

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, buf) => {
      if (err) reject(err);
      else resolve(`scrypt$${salt}$${buf.toString('hex')}`);
    });
  });
}
const pass = () => randomBytes(12).toString('base64').replace(/[^A-Za-z0-9]/g, 'x').slice(0, 16);

(async () => {
  const db = String(process.env.MYSQL_DB || '');
  if (!db || /dev|test|localhost/i.test(db)) {
    console.error('BATAL: script ini hanya untuk DB prod, MYSQL_DB=' + db);
    process.exit(1);
  }
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: db
  });
  const [[u]] = await pool.query('SELECT COUNT(*) AS n FROM users');
  const [[tn]] = await pool.query('SELECT COUNT(*) AS n FROM tenants');
  if ((u && u.n > 0) || (tn && tn.n > 0)) {
    console.error(`BATAL: DB ${db} sudah berisi (users=${u && u.n}, tenants=${tn && tn.n}).`);
    await pool.end();
    process.exit(1);
  }
  const t = new Date().toISOString();
  const pp = pass();
  const tp = pass();
  const uid = uuidv7();
  const tid = uuidv7();
  await pool.query(
    'INSERT INTO users (id, area, email, password_hash, nama, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)',
    [uid, 'provider', 'admin@upgr.example.com', await hashPassword(pp), 'Administrator', t, t]);
  await pool.query(
    'INSERT INTO tenants (id, nama, email, password_hash, deskripsi, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [tid, 'Tenant Awal', 'tenant@upgr.example.com', await hashPassword(tp), 'Akun awal, segera ubah lewat menu Profil.', 'aktif', 'provider', t, t]);
  await pool.end();
  const credFile = process.env.SEED_CREDS_FILE || path.join(process.cwd(), '.seed-awal');
  fs.writeFileSync(credFile,
    `AKUN AWAL UPGR (jaga file ini, hapus setelah password diganti)\n` +
    `provider : admin@upgr.example.com / ${pp}\n` +
    `tenant   : tenant@upgr.example.com / ${tp}\n`, { mode: 0o600 });
  console.log(`seed prod awal OK di ${db}. Password HANYA di ${credFile} (mode 600).`);
})().catch((e) => { console.error('GAGAL: ' + (e && e.message)); process.exit(1); });
