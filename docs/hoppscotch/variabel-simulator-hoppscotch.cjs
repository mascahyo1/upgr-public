// Update request simulator -> path per tenant + tambah milik + var tenantId.
const { Client } = require('/tmp/hoppupd/node_modules/pg');
const TEAM = process.env.HOPP_TEAM_ID || '';
if (!TEAM) throw new Error('isi HOPP_TEAM_ID dulu (id tim Hoppscotch kamu)');
const COL_SIM = process.env.HOPP_COL_SIM || '';
const ENV_ID = process.env.HOPP_ENV_ID || '';
if (!COL_SIM || !ENV_ID) throw new Error('isi HOPP_COL_SIM dan HOPP_ENV_ID dulu');
const NEWURL = '<<baseUrl>>/api_external/publik/simulator/terima/<<tenantId>>';
(async () => {
  const client = new Client({
    host: process.env.HOPPHOST || '127.0.0.1', port: 5432,
    user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database: process.env.POSTGRES_DB
  });
  await client.connect();
  const ids = ['c1703cc382de70b00953a431', 'c2e1e8637e9384010b8ed3be'];
  for (const id of ids) {
    const { rows } = await client.query('SELECT request FROM "TeamRequest" WHERE id = $1', [id]);
    const req = rows[0].request;
    req.endpoint = NEWURL;
    for (const k of Object.keys(req.responses || {})) {
      req.responses[k].originalRequest.endpoint = NEWURL;
    }
    req.description = (req.description || '') + '\n\nURL terisolasi per tenant: .../terima/<<tenantId>> (pakai "URL simulator saya" untuk tahu id tenant sendiri). Tenant tak ada -> 404; lihat/hapus tenant lain -> 403.';
    await client.query('UPDATE "TeamRequest" SET request = $1::jsonb WHERE id = $2', [JSON.stringify(req), id]);
    console.log('update: ' + id);
  }
  await client.query('UPDATE "TeamRequest" SET "orderIndex" = 2 WHERE id = $1', ['c2e1e8637e9384010b8ed3be']);
  const now = new Date().toISOString();
  const milik = {
    v: '17', auth: { authType: 'none', authActive: true },
    body: { body: '', contentType: 'application/json' },
    name: 'URL simulator saya (butuh login)', method: 'GET', params: [],
    headers: [], endpoint: '<<baseUrl>>/api_external/publik/simulator/milik',
    responses: {}, testScript: '',
    description: 'Kembalikan tenant_id + URL penampung milik tenant yang sedang login (cookie sesi).',
    preRequestScript: '', requestVariables: []
  };
  await client.query(
    'INSERT INTO "TeamRequest" (id, "collectionID", "teamID", title, request, "orderIndex", "createdOn", "updatedOn") VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $7)',
    ['c7aa19f3e2b148d9a0c3f5e6d7', 'COL_SIM', 'TEAM', 'URL simulator saya (butuh login)', JSON.stringify(milik), 1, now]);
  console.log('tambah: milik');
  const env = await client.query('SELECT variables FROM "TeamEnvironment" WHERE id = $1', ['ENV_ID']);
  const vars = env.rows[0].variables;
  if (!vars.some((v) => v.key === 'tenantId')) {
    vars.push({ key: 'tenantId', secret: false, currentValue: '', initialValue: '01a1829d-c307-72a2-876e-27fb91aba7ac' });
    await client.query('UPDATE "TeamEnvironment" SET variables = $1::jsonb WHERE id = $2', [JSON.stringify(vars), 'ENV_ID']);
    console.log('var tenantId ditambah');
  } else console.log('var tenantId sudah ada');
  await client.end();
})().catch((e) => { console.error('FATAL: ' + e.message); process.exit(1); });
