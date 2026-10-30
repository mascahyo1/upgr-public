// Ganti 2 request tagihan lama -> 2 request invoice baru (folder Publik).
const { Client } = require('/tmp/hoppupd/node_modules/pg');
const TEAM = process.env.HOPP_TEAM_ID || '';
if (!TEAM) throw new Error('isi HOPP_TEAM_ID dulu (id tim Hoppscotch kamu)');
const COL_PUBLIK = process.env.HOPP_COL_PUBLIK || '';
if (!COL_PUBLIK) throw new Error('isi HOPP_COL_PUBLIK dulu');
const rows = require('./hopp-invoice.cjs');
(async () => {
  const client = new Client({
    host: process.env.HOPPHOST || '127.0.0.1', port: 5432,
    user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database: process.env.POSTGRES_DB
  });
  await client.connect();
  const hapus = await client.query('DELETE FROM "TeamRequest" WHERE id = ANY($1) RETURNING id, title',
    [['cbeabf8b27b82cf4866290284', 'c1138c3225e462ca5fe7b9339']]);
  console.log('hapus: ' + hapus.rows.map((x) => x.id + ' :: ' + x.title).join(' | '));
  const now = new Date().toISOString();
  for (const r of rows) {
    await client.query(
      'INSERT INTO "TeamRequest" (id, "collectionID", "teamID", title, request, "orderIndex", "createdOn", "updatedOn") VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $7)',
      [r.id, 'COL_PUBLIK', 'TEAM', r.title, JSON.stringify(r.request), r.orderIndex, now]);
    console.log('tambah: ' + r.id + ' :: ' + r.title);
  }
  const chk = await client.query('SELECT id, title, request->>\'description\' IS NOT NULL AS d, (SELECT count(*) FROM jsonb_object_keys(request->\'responses\')) AS r FROM "TeamRequest" WHERE id = ANY($1)', [rows.map((x) => x.id)]);
  for (const c of chk.rows) console.log('verifikasi: ' + c.id + ' :: ' + c.title + ' :: deskripsi=' + c.d + ' contoh=' + c.r);
  await client.end();
})().catch((e) => { console.error('FATAL: ' + e.message); process.exit(1); });
