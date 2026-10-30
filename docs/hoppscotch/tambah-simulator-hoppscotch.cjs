// Tambah folder Simulator + 2 request ke tim Hoppscotch.
const { Client } = require('/tmp/hoppupd/node_modules/pg');
const TEAM = process.env.HOPP_TEAM_ID || '';
if (!TEAM) throw new Error('isi HOPP_TEAM_ID dulu (id tim Hoppscotch kamu)');
const PARENT = process.env.HOPP_PARENT_ID || '';
if (!PARENT) throw new Error('isi HOPP_PARENT_ID dulu (id folder induk koleksi)');
const pack = require('./upgr-simulator.cjs');
(async () => {
  const client = new Client({
    host: process.env.HOPPHOST || '127.0.0.1', port: 5432,
    user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database: process.env.POSTGRES_DB
  });
  await client.connect();
  const now = new Date().toISOString();
  await client.query(
    'INSERT INTO "TeamCollection" (id, title, "teamID", "parentID", "orderIndex", "createdOn", "updatedOn") VALUES ($1, $2, $3, $4, $5, $6, $6)',
    [pack.folder.id, pack.folder.title, 'TEAM', 'PARENT', pack.folder.orderIndex, now]);
  console.log('folder: ' + pack.folder.id + ' :: Simulator');
  for (const r of pack.rows) {
    await client.query(
      'INSERT INTO "TeamRequest" (id, "collectionID", "teamID", title, request, "orderIndex", "createdOn", "updatedOn") VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $7)',
      [r.id, pack.folder.id, 'TEAM', r.title, JSON.stringify(r.request), r.orderIndex, now]);
    console.log('tambah: ' + r.id + ' :: ' + r.title);
  }
  const chk = await client.query('SELECT id, title, (SELECT count(*) FROM jsonb_object_keys(request->\'responses\')) AS r FROM "TeamRequest" WHERE id = ANY($1)', [pack.rows.map((x) => x.id)]);
  for (const c of chk.rows) console.log('verifikasi: ' + c.id + ' :: ' + c.title + ' :: contoh=' + c.r);
  await client.end();
})().catch((e) => { console.error('FATAL: ' + e.message); process.exit(1); });
