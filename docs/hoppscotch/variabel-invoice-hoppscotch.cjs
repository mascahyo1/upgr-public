// Body invoice -> variabel <<credId>> / <<kodeTrx>> + tambah var kodeTrx ke env UPGR PROD.
const { Client } = require('/tmp/hoppupd/node_modules/pg');
const ENV_ID = process.env.HOPP_ENV_ID || '';
if (!ENV_ID) throw new Error('isi HOPP_ENV_ID dulu (id environment Hoppscotch)');
(async () => {
  const client = new Client({
    host: process.env.HOPPHOST || '127.0.0.1', port: 5432,
    user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database: process.env.POSTGRES_DB
  });
  await client.connect();
  const ids = ['c6599f385bfef19aada6bce84', 'cb38c211900e18eb4ee5c9c83'];
  for (const id of ids) {
    const { rows } = await client.query('SELECT request FROM "TeamRequest" WHERE id = $1', [id]);
    const req = rows[0].request;
    let body = req.body.body;
    body = body.split('"credential_id": "01a18296-88bf-7931-ba3d-b391e594d1a0"').join('"credential_id": "<<credId>>"');
    body = body.split('"kode_trx": "INV-2026-0001"').join('"kode_trx": "<<kodeTrx>>"');
    req.body.body = body;
    await client.query('UPDATE "TeamRequest" SET request = $1::jsonb WHERE id = $2', [JSON.stringify(req), id]);
    console.log('body variabel: ' + id);
  }
  const env = await client.query('SELECT variables FROM "TeamEnvironment" WHERE id = $1', ['ENV_ID']);
  const vars = env.rows[0].variables;
  if (!vars.some((v) => v.key === 'kodeTrx')) {
    vars.push({ key: 'kodeTrx', secret: false, currentValue: '', initialValue: 'INV-2026-0001' });
    await client.query('UPDATE "TeamEnvironment" SET variables = $1::jsonb WHERE id = $2', [JSON.stringify(vars), 'ENV_ID']);
    console.log('var kodeTrx ditambah ke env UPGR PROD');
  } else console.log('var kodeTrx sudah ada');
  const chk = await client.query("SELECT id, left(request->'body'->>'body', 160) FROM \"TeamRequest\" WHERE id = ANY($1)", [ids]);
  for (const c of chk.rows) console.log('verifikasi: ' + c.id + ' :: ' + c.left.replace(/\n/g, ' '));
  await client.end();
})().catch((e) => { console.error('FATAL: ' + e.message); process.exit(1); });
