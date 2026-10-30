// Terapkan dokumentasi + contoh respons ke TeamRequest (tim Hoppscotch saja).
// Backup dulu ke /tmp/hopp_backup_<ts>.json, lalu UPDATE per id.
const fs = require('fs');
const { Client } = require('/tmp/hoppupd/node_modules/pg');
const TEAM = process.env.HOPP_TEAM_ID || '';
if (!TEAM) throw new Error('isi HOPP_TEAM_ID dulu (id tim Hoppscotch kamu)');
const content = require('./hopp-content.cjs');

const pretty = (o) => JSON.stringify(o, null, 2);

function toStoredExample(cur, ex) {
  const r = cur.request || {};
  const bodyText = ex.reqBody !== undefined ? pretty(ex.reqBody)
    : (r.body && typeof r.body.body === 'string' ? r.body.body : '');
  return {
    body: pretty(ex.body),
    code: ex.code,
    name: ex.name,
    status: ex.status,
    headers: ex.headers || [{ key: 'content-type', value: 'application/json' }],
    originalRequest: {
      v: '6',
      auth: r.auth || { authType: 'none', authActive: true },
      body: { body: bodyText, contentType: (r.body && r.body.contentType) || 'application/json' },
      name: r.name || ex.name,
      method: r.method,
      params: r.params || [],
      headers: r.headers || [],
      endpoint: r.endpoint,
      requestVariables: r.requestVariables || []
    }
  };
}

(async () => {
  const client = new Client({
    host: process.env.HOPPHOST || '127.0.0.1',
    port: 5432,
    user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database: process.env.POSTGRES_DB
  });
  await client.connect();
  const ids = Object.keys(content);
  const { rows } = await client.query(
    'SELECT r.id, r.request FROM "TeamRequest" r JOIN "TeamCollection" c ON c.id = r."collectionID" WHERE r.id = ANY($1) AND c."teamID" = $2',
    [ids, 'TEAM']);
  if (rows.length !== ids.length) {
    const got = new Set(rows.map((x) => x.id));
    throw new Error('id tak cocok: ' + ids.filter((i) => !got.has(i)).join(','));
  }
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync('/tmp/hopp_backup_' + ts + '.json', JSON.stringify(rows));
  console.log('backup: /tmp/hopp_backup_' + ts + '.json (' + rows.length + ' baris)');
  let nDesc = 0, nEx = 0;
  for (const row of rows) {
    const patch = content[row.id];
    const req = row.request || {};
    req.description = patch.description;
    if (patch.reqBody !== undefined) {
      req.body = req.body || {};
      req.body.body = pretty(patch.reqBody);
      req.body.contentType = (req.body && req.body.contentType) || 'application/json';
    }
    req.responses = req.responses || {};
    for (const ex of patch.examples) {
      req.responses[ex.name] = toStoredExample({ request: req }, ex);
      nEx++;
    }
    nDesc++;
    await client.query('UPDATE "TeamRequest" SET request = $1::jsonb WHERE id = $2', [JSON.stringify(req), row.id]);
  }
  // verifikasi
  const chk = await client.query('SELECT id, request->>\'description\' AS d, (SELECT count(*) FROM jsonb_object_keys(request->\'responses\')) AS r FROM "TeamRequest" WHERE id = ANY($1)', [ids]);
  const bad = chk.rows.filter((x) => !x.d || Number(x.r) === 0);
  console.log('terapkan: ' + nDesc + ' deskripsi, ' + nEx + ' contoh respons');
  if (bad.length) throw new Error('gagal pada: ' + bad.map((x) => x.id).join(','));
  console.log('verifikasi: 58/58 OK');
  await client.end();
})().catch((e) => { console.error('FATAL: ' + e.message); process.exit(1); });
