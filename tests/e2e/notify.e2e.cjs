// E2E slice notify Midtrans UPGR Nuxt (tanpa browser, murni API).
// Jalankan: node tests/e2e/notify.e2e.cjs  (server dev di BASE, default 3200)
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3200);
const BASE = process.env.BASE || `http://127.0.0.1:${PORT}`;

const SECRET = 'SB-Mid-secret-uji-notify-001';

let failures = 0;
function step(name) {
  console.log(`\n[STEP] ${name}`);
}
function assert(cond, label) {
  if (cond) {
    console.log(`  PASS: ${label}`);
  } else {
    failures++;
    console.log(`  FAIL: ${label}`);
  }
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${BASE}/`);
      if (res.ok) return;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('server tidak siap di ' + BASE);
}

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json };
}

function sig(orderId, statusCode, grossAmount, serverKey) {
  return crypto.createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`, 'utf8')
    .digest('hex');
}

// Endpoint baca provider_logs milik slice lain; coba kandidat sesuai konvensi
// repo (/api_web/credentials/[id]/api-logs dan /api_web/credentials/[id]/logs).
const PROVIDER_LOG_CANDIDATES = (credId) => [
  `/api_web/credentials/${credId}/provider-logs`,
  `/api_web/credentials/${credId}/provider_logs`,
  `/api_web/credentials/${credId}/notify-logs`
];

async function readProviderLogs(credId) {
  for (const p of PROVIDER_LOG_CANDIDATES(credId)) {
    const r = await api('GET', p);
    if (r.status === 200 && r.json && Array.isArray(r.json.data)) {
      return { path: p, rows: r.json.data };
    }
  }
  return { path: null, rows: null };
}

(async () => {
  await waitForServer();

  step('0. reset via API');
  const rst = await api('POST', '/api_web/_test/reset');
  assert(rst.json && rst.json.data && rst.json.data.seeds === 2, 'reset: 2 seed');

  step('1. buat kredensial midtrans via API');
  const mc = await api('POST', '/api_web/credentials', {
    nama: 'Midtrans Notify Uji',
    provider: 'midtrans',
    is_production: false,
    merchant_id: 'M-N1',
    key: 'SB-Mid-client-uji-notify',
    secret: SECRET,
    deskripsi: 'Kredensial uji notify'
  });
  assert(mc.status === 201 && mc.json && mc.json.data && mc.json.data.id, 'kredensial midtrans terbuat via API');
  const credId = mc.json.data.id;

  step('2. buat webhook aktif ke /api_web/_test/ping via API');
  const pingUrl = `${BASE}/api_web/_test/ping`;
  const wh = await api('POST', `/api_web/credentials/${credId}/webhooks`, {
    nama: 'Penerus Notify Uji',
    url: pingUrl,
    is_active: 'aktif',
    verify_token: 'tok-notify-uji',
    deskripsi: 'Hook uji notify'
  });
  assert(wh.status === 201 && wh.json && wh.json.data && wh.json.data.id, 'webhook aktif terbuat via API');

  step('3. POST notifikasi palsu signature valid');
  const orderId = `ORD-NOTIFY-${Date.now()}`;
  const statusCode = '200';
  const grossAmount = '15000';
  const validBody = {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    transaction_status: 'settlement',
    signature_key: sig(orderId, statusCode, grossAmount, SECRET)
  };
  const n1 = await api('POST', `/api_external/publik/notify/midtrans/${credId}`, validBody);
  assert(n1.status === 200 && n1.json && (n1.json.ok === true || (n1.json.data && n1.json.data.ok === true)), 'notify valid -> 200 {ok}');

  step('4. entri provider_logs hasil ok via endpoint');
  const pl1 = await readProviderLogs(credId);
  assert(pl1.rows !== null, `endpoint baca provider_logs ada (${pl1.path || 'tidak ditemukan'})`);
  if (pl1.rows) {
    const hit = pl1.rows.find((r) => String(r.request_body || '').indexOf(orderId) >= 0);
    assert(!!hit, 'provider_logs memuat order_id notifikasi');
    assert(hit && hit.hasil === 'ok', 'provider_logs hasil ok untuk signature valid');
    assert(hit && typeof hit.durasi_ms === 'number', 'provider_logs memuat durasi_ms');
  }

  step('5. entri router log (webhook_logs) terkirim');
  const wl1 = await api('GET', `/api_web/credentials/${credId}/logs`);
  assert(wl1.status === 200 && wl1.json && Array.isArray(wl1.json.data), 'endpoint log webhook 200');
  const fwd = (wl1.json.data || []).find((r) => r.event === 'Midtrans notify');
  assert(!!fwd, 'router log memuat penerusan Midtrans notify');
  assert(fwd && fwd.hasil === 'terkirim', 'router log hasil terkirim ke /api_web/_test/ping');
  const fwdCount = (wl1.json.data || []).filter((r) => r.event === 'Midtrans notify').length;

  step('6. signature salah -> hasil gagal tapi tetap 200');
  const badBody = { ...validBody, order_id: `${orderId}-BAD`, signature_key: '0'.repeat(128) };
  const n2 = await api('POST', `/api_external/publik/notify/midtrans/${credId}`, badBody);
  assert(n2.status === 200 && n2.json && (n2.json.ok === true || (n2.json.data && n2.json.data.ok === true)), 'notify signature salah tetap 200 {ok}');
  const pl2 = await readProviderLogs(credId);
  if (pl2.rows) {
    const hit = pl2.rows.find((r) => String(r.request_body || '').indexOf(`${orderId}-BAD`) >= 0);
    assert(!!hit, 'provider_logs memuat notifikasi kedua');
    assert(hit && hit.hasil === 'gagal', 'provider_logs hasil gagal untuk signature salah');
  } else {
    assert(false, 'endpoint baca provider_logs ada (cek ulang)');
  }
  const wl2 = await api('GET', `/api_web/credentials/${credId}/logs`);
  const fwdCount2 = ((wl2.json && wl2.json.data) || []).filter((r) => r.event === 'Midtrans notify').length;
  assert(fwdCount2 === fwdCount, 'signature salah tidak menambah penerusan webhook');

  step('7. kredensial tak ada -> 404');
  const n3 = await api('POST', '/api_external/publik/notify/midtrans/c-tidak-ada', validBody);
  assert(n3.status === 404, 'notify kredensial tak ada -> 404');

  step('8. filter prefix case-sensitive (kosong = semua)');
  const whPx = await api('POST', `/api_web/credentials/${credId}/webhooks`, {
    nama: 'Prefix INV Uji', url: `${pingUrl}?app=inv`, is_active: 'aktif', prefix: 'INV', verify_token: 'tok', deskripsi: 'uji prefix'
  });
  assert(whPx.status === 201, 'webhook prefix INV terbuat');
  async function routerRowsFor(order) {
    const wl = await api('GET', `/api_web/credentials/${credId}/logs`);
    return ((wl.json && wl.json.data) || []).filter((r) => String(r.request_body || '').indexOf(order) >= 0);
  }
  async function sendValid(order) {
    const b = {
      order_id: order, status_code: '200', gross_amount: '12000',
      transaction_status: 'settlement',
      signature_key: sig(order, '200', '12000', SECRET)
    };
    const n = await api('POST', `/api_external/publik/notify/midtrans/${credId}`, b);
    assert(n.status === 200, `notify ${order} -> 200`);
  }
  await sendValid('INV-PREFIX-1');
  const m1 = await routerRowsFor('INV-PREFIX-1');
  assert(m1.length === 2, `order cocok prefix diteruskan ke 2 webhook (dapat ${m1.length})`);
  await sendValid('ORD-NOMATCH-1');
  const m2 = await routerRowsFor('ORD-NOMATCH-1');
  assert(m2.length === 1, `order tak cocok prefix hanya ke webhook tanpa prefix (dapat ${m2.length})`);
  await sendValid('inv-kecil-1');
  const m3 = await routerRowsFor('inv-kecil-1');
  assert(m3.length === 1, `prefix case-sensitive: inv kecil tak cocok INV (dapat ${m3.length})`);

  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
