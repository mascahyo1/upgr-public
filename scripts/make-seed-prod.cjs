// Cetak SQL seed AWAL untuk PROD ke stdout. Password dibaca dari environment,
// TIDAK disimpan di repo/chat/Notion. Jalankan LOKAL lalu eksekusi manual di server:
//
//   $env:PROD_PROVIDER_EMAIL='provider@sekolah.id'; $env:PROD_PROVIDER_NAMA='Admin UPGR';
//   $env:PROD_PROVIDER_PASSWORD='isi-rahasia-min-8'; $env:PROD_TENANT_NAMA='Nama Sekolah';
//   $env:PROD_TENANT_EMAIL='admin@sekolah.id'; $env:PROD_TENANT_PASSWORD='isi-rahasia-min-8';
//   node scripts/make-seed-prod.cjs > seed-prod.sql
//
// Lalu di server: mysql NAMA_DB_PROD < seed-prod.sql   (lalu HAPUS file seed-prod.sql)
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
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";

(async () => {
  const pe = String(process.env.PROD_PROVIDER_EMAIL || '').trim().toLowerCase();
  const pn = String(process.env.PROD_PROVIDER_NAMA || 'Administrator UPGR').trim();
  const pp = String(process.env.PROD_PROVIDER_PASSWORD || '');
  const te = String(process.env.PROD_TENANT_EMAIL || '').trim().toLowerCase();
  const tn = String(process.env.PROD_TENANT_NAMA || '').trim();
  const tp = String(process.env.PROD_TENANT_PASSWORD || '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(pe) || pp.length < 8) {
    console.error('BATAL: PROD_PROVIDER_EMAIL valid + PROD_PROVIDER_PASSWORD min 8 wajib diisi.');
    process.exit(1);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(te) || !tn || tp.length < 8) {
    console.error('BATAL: PROD_TENANT_NAMA/EMAIL valid + PROD_TENANT_PASSWORD min 8 wajib diisi.');
    process.exit(1);
  }
  const t = new Date().toISOString();
  const ph = await hashPassword(pp);
  const th = await hashPassword(tp);
  const uid = uuidv7();
  const tid = uuidv7();
  console.log('-- Seed awal UPGR PROD. Jalankan sekali, lalu HAPUS file ini.');
  console.log(`INSERT INTO users (id, area, email, password_hash, nama, is_active, created_at, updated_at) VALUES (${q(uid)}, 'provider', ${q(pe)}, ${q(ph)}, ${q(pn)}, 1, ${q(t)}, ${q(t)});`);
  console.log(`INSERT INTO tenants (id, nama, email, password_hash, deskripsi, status, created_by, created_at, updated_at) VALUES (${q(tid)}, ${q(tn)}, ${q(te)}, ${q(th)}, '', 'aktif', 'provider', ${q(t)}, ${q(t)});`);
})().catch((e) => { console.error('GAGAL: ' + (e && e.message)); process.exit(1); });
