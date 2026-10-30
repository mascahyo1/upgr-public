// Update contoh Lihat (tambah ip/ua/method/url/respons) + tambah Detail tangkapan.
// Idempoten: cek judul/id dulu. Kredensial PG dibaca dari /var/www/hoppscotch/.env.
const fs = require('fs');
const { Client } = require('/tmp/hoppupd/node_modules/pg');
const TEAM = process.env.HOPP_TEAM_ID || '';
if (!TEAM) throw new Error('isi HOPP_TEAM_ID dulu (id tim Hoppscotch kamu)');
const COL_SIM = process.env.HOPP_COL_SIM || '';
if (!COL_SIM) throw new Error('isi HOPP_COL_SIM dulu');
const env = {};
fs.readFileSync('/var/www/hoppscotch/.env', 'utf8').split('\n').forEach((l) => {
  const m = l.match(/^([A-Za-z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
});
const CT = [{ key: 'content-type', value: 'application/json' }];
const errEnv = (url, code, data) => ({
  error: true, url: '<<baseUrl>>' + url, statusCode: code,
  statusMessage: 'Server Error', message: '', data
});
function ex(cur, e) {
  return {
    body: JSON.stringify(e.body, null, 2),
    code: e.code, name: e.name, status: e.status, headers: e.headers || CT,
    originalRequest: {
      v: '6', auth: cur.auth,
      body: { body: e.reqBody !== undefined ? JSON.stringify(e.reqBody, null, 2) : cur.body.body, contentType: 'application/json' },
      name: cur.name, method: cur.method, params: [], headers: cur.headers,
      endpoint: cur.endpoint, requestVariables: []
    }
  };
}
(async () => {
  const client = new Client({ host: process.env.HOPPHOST || '127.0.0.1', port: 5432, user: env.POSTGRES_USER, password: env.POSTGRES_PASSWORD, database: env.POSTGRES_DB });
  await client.connect();
  // 1. Perkaya contoh Berhasil pada "Lihat tangkapan".
  const lr = await client.query('SELECT id, request FROM "TeamRequest" WHERE title = $1 AND "teamID" = $2', ['Lihat tangkapan (butuh login)', 'TEAM']);
  if (lr.rows.length) {
    const req = lr.rows[0].request;
    const rich = { data: [{ id: '01a1878c-0000-7000-8000-000000000001', tenant_id: '01a1829d-c307-72a2-876e-27fb91aba7ac', ip: '127.0.0.1', user_agent: 'MidtransNotify/1.0', method: 'POST', url: '/api_external/publik/simulator/terima/01a1829d-c307-72a2-876e-27fb91aba7ac', request_header: '{"content-type":"application/json"}', request_body: '{"event":"Midtrans notify","order_id":"INV-2026-0001"}', response_status: 201, response_header: '{"content-type":"application/json"}', response_body: '{"data":{"ok":true}}', created_at: '2026-10-29T10:00:00.000Z' }] };
    req.responses = req.responses || {};
    req.responses['Berhasil'] = ex(req, { name: 'Berhasil', code: 200, status: 'OK', body: rich });
    await client.query('UPDATE "TeamRequest" SET request = $1::jsonb WHERE id = $2', [JSON.stringify(req), lr.rows[0].id]);
    console.log('update contoh Lihat: ' + lr.rows[0].id);
  } else console.log('Lihat tidak ketemu, dilewati');
  // 2. Tambah "Detail tangkapan" bila belum ada.
  const dr = await client.query('SELECT id FROM "TeamRequest" WHERE title = $1 AND "teamID" = $2', ['Detail tangkapan (butuh login)', 'TEAM']);
  if (!dr.rows.length) {
    const detail = {
      v: '17', auth: { authType: 'none', authActive: true },
      body: { body: '', contentType: 'application/json' },
      name: 'Detail tangkapan (butuh login)', method: 'GET', params: [],
      headers: [], endpoint: '<<baseUrl>>/api_external/publik/simulator/terima/<<tenantId>>/<<simId>>',
      responses: {}, testScript: '',
      description: 'Satu tangkapan lengkap: IP + User Agent pengirim, method + URL penerima, request header/body, response header/body + status. Butuh cookie sesi tenant pemilik; tenant lain -> 403.',
      preRequestScript: '', requestVariables: []
    };
    const full = { data: { id: '01a1878c-0000-7000-8000-000000000001', tenant_id: '01a1829d-c307-72a2-876e-27fb91aba7ac', ip: '127.0.0.1', user_agent: 'MidtransNotify/1.0', method: 'POST', url: '/api_external/publik/simulator/terima/01a1829d-c307-72a2-876e-27fb91aba7ac', request_header: '{"content-type":"application/json","x-signature":"..."}', request_body: '{"event":"Midtrans notify","order_id":"INV-2026-0001"}', response_status: 201, response_header: '{"content-type":"application/json"}', response_body: '{"data":{"ok":true,"id":"01a1878c-0000-7000-8000-000000000001"}}', created_at: '2026-10-29T10:00:00.000Z' } };
    for (const e of [
      { name: 'Berhasil', code: 200, status: 'OK', body: full },
      { name: 'Milik tenant lain', code: 403, status: 'Forbidden', body: errEnv('/api_external/publik/simulator/terima/<<tenantId>>/<<simId>>', 403, { error: 'Akses ditolak.' }) },
      { name: 'Belum login', code: 401, status: 'Unauthorized', body: errEnv('/api_external/publik/simulator/terima/<<tenantId>>/<<simId>>', 401, { error: 'Sesi berakhir, silakan login kembali.' }) },
      { name: 'Tak ada', code: 404, status: 'Not Found', body: errEnv('/api_external/publik/simulator/terima/<<tenantId>>/<<simId>>', 404, { error: 'Tangkapan tidak ditemukan.' }) }
    ]) detail.responses[e.name] = ex(detail, e);
    const now = new Date().toISOString();
    await client.query(
      'INSERT INTO "TeamRequest" (id, "collectionID", "teamID", title, request, "orderIndex", "createdOn", "updatedOn") VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $7)',
      ['c9d4e5f6a7b848d9a0b1c2d3e4', 'COL_SIM', 'TEAM', 'Detail tangkapan (butuh login)', JSON.stringify(detail), 3, now]);
    console.log('tambah: Detail tangkapan');
  } else console.log('Detail sudah ada: ' + dr.rows[0].id);
  const chk = await client.query('SELECT title, (SELECT count(*) FROM jsonb_object_keys(request->\'responses\')) AS r FROM "TeamRequest" WHERE "teamID" = $1 AND title LIKE $2 ORDER BY title', ['TEAM', '%tangkapan%']);
  for (const c of chk.rows) console.log('verifikasi: ' + c.title + ' :: contoh=' + c.r);
  await client.end();
})().catch((e) => { console.error('FATAL: ' + e.message); process.exit(1); });
