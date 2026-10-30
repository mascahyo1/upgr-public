// E2E slice simulator webhook per tenant: tangkap publik, isolasi sesi,
// milik, kosongkan. Jalankan: E2E_PORT=3210 node tests/e2e/simulator.e2e.cjs
const PORT = Number(process.env.E2E_PORT || 3200);
const BASE = `http://127.0.0.1:${PORT}`;
const MILIK = '/api_external/publik/simulator/milik';

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
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE}/`);
      if (res.ok) return;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('server tidak siap');
}

(async () => {
  step('0. reset + seed user');
  await waitForServer();
  await (await fetch(`${BASE}/api_web/_test/reset`, { method: 'POST' })).json();
  await (await fetch(`${BASE}/api_web/_test/seed-user`, { method: 'POST' })).json();

  step('1. login tenant via API');
  const login = await fetch(`${BASE}/api_web/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ area: 'tenant', email: 'uji@example.com', password: 'sandi-uji-123', captcha: 'dummy' })
  });
  const cookie = (login.headers.get('set-cookie') || '').split(';')[0];
  assert(login.status === 200 && !!cookie, 'login dapat cookie sesi');

  step('2. URL simulator milik sendiri');
  const milik = await (await fetch(BASE + MILIK, { headers: { Cookie: cookie } })).json().catch(() => ({}));
  const tid = (milik.data || {}).tenant_id || '';
  assert(/^[0-9a-f-]{36}$/i.test(tid), 'milik mengembalikan tenant_id uuid');
  const SCOPE = `/api_external/publik/simulator/terima/${tid}`;

  step('3. tangkap POST publik per tenant');
  const kirim = await fetch(BASE + SCOPE, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Webhook-Token': 'tok-uji' },
    body: JSON.stringify({ event: 'simulasi', kode_trx: 'INV-SIM-WEB' })
  });
  const kj = await kirim.json().catch(() => ({}));
  assert(kirim.status === 201 && !!((kj.data || {}).id), 'POST tercatat 201 + id');
  const salah = await fetch(BASE + '/api_external/publik/simulator/terima/bukan-uuid', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
  });
  assert(salah.status === 404, 'tenant tak ada 404');

  step('4. isolasi: lihat + hapus milik sendiri saja');
  const anon = await fetch(BASE + SCOPE);
  assert(anon.status === 401, 'lihat tanpa sesi 401');
  const orang = await fetch(BASE + '/api_external/publik/simulator/terima/01a18296-88bb-7cd3-888e-b69cb5214659', { headers: { Cookie: cookie } });
  assert(orang.status === 403, 'lihat tenant lain 403');
  const lihat = await fetch(BASE + SCOPE, { headers: { Cookie: cookie } });
  const lj = await lihat.json().catch(() => ({}));
  const baris = ((lj.data || []).find((x) => String(x.request_body || '').indexOf('INV-SIM-WEB') >= 0)) || {};
  assert(lihat.status === 200 && !!baris.id && baris.tenant_id === tid, 'tangkapan tampil dengan tenant_id sendiri');
  assert(!!baris.ip && !!baris.user_agent, 'list mencatat ip + user agent pengirim');
  assert(!!baris.method && !!baris.url, 'list mencatat method + url penerima');
  assert(String(baris.request_body || '').indexOf('INV-SIM-WEB') >= 0, 'list memuat request body');

  step('4b. detail tangkapan: header/body req+res + ip/ua');
  const det = await (await fetch(`${BASE}${SCOPE}/${baris.id}`, { headers: { Cookie: cookie } })).json().catch(() => ({}));
  const d = det.data || {};
  assert(!!d.ip && !!d.user_agent, 'detail memuat ip + user agent');
  assert(String(d.request_header || '').toLowerCase().indexOf('x-webhook-token') >= 0, 'detail memuat request header pengirim');
  assert(String(d.request_body || '').indexOf('INV-SIM-WEB') >= 0, 'detail memuat request body');
  assert(!!d.response_header && !!d.response_body, 'detail memuat response header + body');
  assert(d.response_status === 201, 'detail memuat status respons 201');
  const orangDet = await fetch(`${BASE}/api_external/publik/simulator/terima/01a18296-88bb-7cd3-888e-b69cb5214659/${baris.id}`, { headers: { Cookie: cookie } });
  assert(orangDet.status === 403, 'detail tenant lain 403');

  step('5. kosongkan milik sendiri');
  const hapus = await fetch(BASE + SCOPE, { method: 'DELETE', headers: { Cookie: cookie } });
  assert(hapus.status === 200, 'kosongkan 200');
  const sesudah = await (await fetch(BASE + SCOPE, { headers: { Cookie: cookie } })).json().catch(() => ({}));
  assert(((sesudah.data || []).length) === 0, 'list kosong sesudah dibersihkan');

  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
