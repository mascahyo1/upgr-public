const crypto = require('crypto');
const cuid = (p) => p + crypto.randomBytes(12).toString('hex').slice(0, 24 - p.length);
const CT = [{ key: 'content-type', value: 'application/json' }];
const errEnv = (url, code, data) => ({
  error: true, url: '<<baseUrl>>' + url, statusCode: code,
  statusMessage: 'Server Error', message: '', data
});
function req(name, endpoint, bodyText, desc) {
  return {
    v: '17', auth: { authType: 'none', authActive: true },
    body: { body: bodyText, contentType: 'application/json' },
    name, method: 'POST', params: [],
    headers: [{ key: 'Content-Type', value: 'application/json', active: true, description: '' }],
    endpoint, responses: {}, testScript: '', description: desc, preRequestScript: '', requestVariables: []
  };
}
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
const folderId = cuid('c');
const kirimBody = { event: 'Midtrans notify', order_id: 'INV-2026-0001', transaction_status: 'settlement' };
const kirim = req('Kirim simulasi (publik, tanpa auth)',
  '<<baseUrl>>/api_external/publik/simulator/terima/<<tenantId>>', JSON.stringify(kirimBody, null, 2),
  'Kirim apa pun ke penampung simulasi (pengganti webhook.site, gratis, milik sendiri). PUBLIK tanpa auth; cocok untuk dijadikan URL webhook saat uji penerusan notify. Body apa pun diterima (dipotong 8000 char), dibalas 201 { data: { ok, id, diterima_at } }. Lihat hasilnya di "Lihat tangkapan" / halaman Tenant > Simulator Webhook. Batas 60x/menit per IP, maks 200 baris.');
kirim.responses = {};
for (const e of [
  { name: 'Tertampung', code: 201, status: 'Created', reqBody: kirimBody, body: { data: { ok: true, id: '01a1878c-0000-7000-8000-000000000001', diterima_at: '2026-10-29T10:00:00.000Z' } } },
  { name: 'Throttled (60x/menit)', code: 429, status: 'Too Many Requests', headers: CT.concat([{ key: 'retry-after', value: '59' }]), body: { data: { error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa saat.' } } }
]) kirim.responses[e.name] = ex(kirim, e);

const lihat = req('Lihat tangkapan (butuh login)', '<<baseUrl>>/api_external/publik/simulator/terima/<<tenantId>>', '', 'Lihat 200 tangkapan terakhir (butuh cookie sesi tenant). Method asli GET; contoh ini POST agar mudah dicoba? TIDAK — pakai GET di Hoppscotch (ganti method). Tanpa sesi -> 401.');
lihat.method = 'GET';
lihat.responses = {};
for (const e of [
  { name: 'Berhasil', code: 200, status: 'OK', body: { data: [{ id: '01a1878c-0000-7000-8000-000000000001', tenant_id: '01a1829d-c307-72a2-876e-27fb91aba7ac', ip: '127.0.0.1', user_agent: 'MidtransNotify/1.0', method: 'POST', url: '/api_external/publik/simulator/terima/01a1829d-c307-72a2-876e-27fb91aba7ac', request_header: '{"content-type":"application/json"}', request_body: '{"event":"Midtrans notify","order_id":"INV-2026-0001"}', response_status: 201, response_header: '{"content-type":"application/json"}', response_body: '{"data":{"ok":true}}', created_at: '2026-10-29T10:00:00.000Z' }] } },
  { name: 'Belum login', code: 401, status: 'Unauthorized', body: errEnv('/api_external/publik/simulator/terima/<<tenantId>>', 401, { error: 'Sesi berakhir, silakan login kembali.' }) }
]) lihat.responses[e.name] = ex(lihat, e);

const detail = req('Detail tangkapan (butuh login)',
  '<<baseUrl>>/api_external/publik/simulator/terima/<<tenantId>>/<<simId>>', '',
  'Satu tangkapan lengkap: IP + User Agent pengirim, method + URL penerima, request header/body, response header/body + status. Butuh cookie sesi tenant pemilik; tenant lain -> 403.');
detail.method = 'GET';
detail.responses = {};
const detailBody = { data: { id: '01a1878c-0000-7000-8000-000000000001', tenant_id: '01a1829d-c307-72a2-876e-27fb91aba7ac', ip: '127.0.0.1', user_agent: 'MidtransNotify/1.0', method: 'POST', url: '/api_external/publik/simulator/terima/01a1829d-c307-72a2-876e-27fb91aba7ac', request_header: '{"content-type":"application/json","x-signature":"..."}', request_body: '{"event":"Midtrans notify","order_id":"INV-2026-0001"}', response_status: 201, response_header: '{"content-type":"application/json"}', response_body: '{"data":{"ok":true,"id":"01a1878c-0000-7000-8000-000000000001"}}', created_at: '2026-10-29T10:00:00.000Z' } };
for (const e of [
  { name: 'Berhasil', code: 200, status: 'OK', body: detailBody },
  { name: 'Milik tenant lain', code: 403, status: 'Forbidden', body: errEnv('/api_external/publik/simulator/terima/<<tenantId>>/<<simId>>', 403, { error: 'Akses ditolak.' }) },
  { name: 'Belum login', code: 401, status: 'Unauthorized', body: errEnv('/api_external/publik/simulator/terima/<<tenantId>>/<<simId>>', 401, { error: 'Sesi berakhir, silakan login kembali.' }) },
  { name: 'Tak ada', code: 404, status: 'Not Found', body: errEnv('/api_external/publik/simulator/terima/<<tenantId>>/<<simId>>', 404, { error: 'Tangkapan tidak ditemukan.' }) }
]) detail.responses[e.name] = ex(detail, e);

module.exports = {
  folder: { id: folderId, title: 'Simulator', orderIndex: 4 },
  rows: [
    { id: cuid('c'), title: 'Kirim simulasi (publik, tanpa auth)', orderIndex: 0, request: kirim },
    { id: cuid('c'), title: 'Lihat tangkapan (butuh login)', orderIndex: 1, request: lihat },
    { id: cuid('c'), title: 'Detail tangkapan (butuh login)', orderIndex: 3, request: detail }
  ]
};
