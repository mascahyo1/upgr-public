// E2E browser: halaman detail log API / provider / router + detail simulator
// menampilkan IP, User Agent, request/response header+body.
// Jalankan: E2E_PORT=3210 node tests/e2e/logdetail.e2e.cjs
// HEADED=1 untuk headed; default headless.
const { chromium } = require('playwright');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.E2E_PORT || 3200);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(__dirname, 'output');
fs.mkdirSync(OUT, { recursive: true });

let failures = 0;
function step(name) { console.log(`\n[STEP] ${name}`); }
function assert(cond, label) {
  if (cond) { console.log(`  PASS: ${label}`); }
  else { failures++; console.log(`  FAIL: ${label}`); }
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
  await waitForServer();

  step('1. reset + login tenant via API + siapkan data log');
  await fetch(`${BASE}/api_web/_test/reset`, { method: 'POST' });
  const login = await fetch(`${BASE}/api_web/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ area: 'tenant', email: 'admin@example.com', password: 'sandi-tenant-123', captcha: 'dummy' })
  });
  const cookie = (login.headers.get('set-cookie') || '').split(';')[0];
  assert(login.status === 200 && !!cookie, 'login dapat cookie sesi');
  const H = { 'Content-Type': 'application/json', Cookie: cookie };
  const SECRET = 'SB-Mid-secret-uji-logdetail';

  const mc = await (await fetch(`${BASE}/api_web/credentials`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ nama: 'Midtrans Logdetail Uji', provider: 'midtrans', is_production: false, merchant_id: 'M-LD', key: 'SB-Mid-client-uji-logdetail', secret: SECRET, deskripsi: 'uji detail log' })
  })).json().catch(() => ({}));
  const credId = (mc.data || {}).id || '';
  assert(!!credId, 'kredensial uji terbuat');

  await fetch(`${BASE}/api_web/credentials/${credId}/test`, { method: 'POST', headers: H, body: '{}' });
  const apiRows = ((await (await fetch(`${BASE}/api_web/credentials/${credId}/api-logs`, { headers: { Cookie: cookie } })).json().catch(() => ({}))).data) || [];
  assert(apiRows.length >= 1, 'baris log API tersedia');
  const apiId = (apiRows[0] || {}).id || '';

  await fetch(`${BASE}/api_web/credentials/${credId}/webhooks`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ nama: 'Penerus Logdetail', url: `${BASE}/api_web/_test/ping`, is_active: 'aktif', verify_token: 'tok', deskripsi: 'uji' })
  });
  const orderId = `ORD-LOGDETAIL-${Date.now()}`;
  const sigBody = {
    order_id: orderId, status_code: '200', gross_amount: '12000',
    transaction_status: 'settlement',
    signature_key: crypto.createHash('sha512').update(`${orderId}20012000${SECRET}`, 'utf8').digest('hex')
  };
  const n1 = await fetch(`${BASE}/api_external/publik/notify/midtrans/${credId}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'E2E-Logdetail/1.0' }, body: JSON.stringify(sigBody)
  });
  assert(n1.status === 200, 'notify valid 200');
  const provRows = ((await (await fetch(`${BASE}/api_web/credentials/${credId}/provider-logs`, { headers: { Cookie: cookie } })).json().catch(() => ({}))).data) || [];
  const routRows = ((await (await fetch(`${BASE}/api_web/credentials/${credId}/logs`, { headers: { Cookie: cookie } })).json().catch(() => ({}))).data) || [];
  assert(provRows.length >= 1, 'baris log provider tersedia');
  assert(routRows.length >= 1, 'baris log router tersedia');
  const provId = (provRows[0] || {}).id || '';
  const routId = (routRows[0] || {}).id || '';

  const milik = await (await fetch(`${BASE}/api_external/publik/simulator/milik`, { headers: { Cookie: cookie } })).json().catch(() => ({}));
  const tid = ((milik || {}).data || {}).tenant_id || '';
  const SCOPE = `/api_external/publik/simulator/terima/${tid}`;
  await fetch(BASE + SCOPE, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'E2E-Logdetail/1.0' },
    body: JSON.stringify({ event: 'simulasi', kode_trx: 'INV-LOGDETAIL-WEB' })
  });
  assert(!!tid, 'tenant_id milik tersedia untuk SCOPE simulator');
  const simList = ((await (await fetch(BASE + SCOPE, { headers: { Cookie: cookie } })).json().catch(() => ({}))).data) || [];
  assert(Array.isArray(simList), 'daftar simulator berupa array');
  const simRow = (Array.isArray(simList) ? simList : []).find((x) => String(x.request_body || '').indexOf('INV-LOGDETAIL-WEB') >= 0) || {};
  assert(!!simRow.id, 'tangkapan simulator tersedia');
  const simId = simRow.id || '';

  step('2. browser: detail log API memuat IP/UA + header/body');
  const browser = await chromium.launch({ headless: process.env.HEADED !== '1' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([{ name: cookie.split('=')[0], value: cookie.split('=').slice(1).join('='), domain: '127.0.0.1', path: '/' }]);
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e && e.message)));

  await page.goto(`${BASE}/tenant/payment-gateway-credential/${credId}/api-log/${apiId}`);
  await page.getByTestId('api-detail-card').waitFor({ state: 'visible', timeout: 15000 });
  assert(await page.getByTestId('api-detail-req-headers').isVisible(), 'detail log API: blok request headers tampil');
  assert(await page.getByTestId('api-detail-req-body').isVisible(), 'detail log API: blok request body tampil');
  assert(await page.getByTestId('api-detail-resp-headers').isVisible(), 'detail log API: blok response headers tampil');
  assert(await page.getByTestId('api-detail-resp-body').isVisible(), 'detail log API: blok response body tampil');
  const apiText = (await page.locator('body').textContent()) || '';
  assert(apiText.indexOf('User Agent') >= 0, 'detail log API: label User Agent tampil');
  assert(apiText.indexOf('UPGR/1.0') >= 0, 'detail log API: UA panggilan keluar UPGR/1.0 tampil');
  assert(apiText.indexOf('Request Headers') >= 0 && apiText.indexOf('Response Body') >= 0, 'detail log API: blok header/body tampil');
  await page.screenshot({ path: path.join(OUT, 'logdetail-api.png') });

  step('3. browser: detail log provider memuat IP/UA pengirim');
  await page.goto(`${BASE}/tenant/payment-gateway-credential/${credId}/provider-log/${provId}`);
  await page.getByTestId('api-pdetail-card').waitFor({ state: 'visible', timeout: 15000 });
  assert(await page.getByTestId('api-pdetail-req-headers').isVisible(), 'detail provider: blok request headers tampil');
  assert(await page.getByTestId('api-pdetail-req-body').isVisible(), 'detail provider: blok request body tampil');
  assert(await page.getByTestId('api-pdetail-resp-headers').isVisible(), 'detail provider: blok response headers tampil');
  assert(await page.getByTestId('api-pdetail-resp-body').isVisible(), 'detail provider: blok response body tampil');
  const provText = (await page.locator('body').textContent()) || '';
  assert(provText.indexOf('User Agent') >= 0, 'detail provider: label User Agent tampil');
  assert(provText.indexOf('127.0.0.1') >= 0, 'detail provider: IP pengirim tampil');
  assert(provText.indexOf('Request Body') >= 0 && provText.indexOf(orderId) >= 0, 'detail provider: body notifikasi tampil');
  await page.screenshot({ path: path.join(OUT, 'logdetail-provider.png') });

  step('4. browser: detail log router memuat IP/UA + header/body');
  await page.goto(`${BASE}/tenant/payment-gateway-credential/${credId}/webhook-log/${routId}`);
  await page.getByTestId('whlog-detail-card').waitFor({ state: 'visible', timeout: 15000 });
  assert(await page.getByTestId('whlog-detail-req-headers').isVisible(), 'detail router: blok request headers tampil');
  assert(await page.getByTestId('whlog-detail-req-body').isVisible(), 'detail router: blok request body tampil');
  assert(await page.getByTestId('whlog-detail-resp-headers').isVisible(), 'detail router: blok response headers tampil');
  assert(await page.getByTestId('whlog-detail-resp-body').isVisible(), 'detail router: blok response body tampil');
  const routText = (await page.locator('body').textContent()) || '';
  assert(routText.indexOf('User Agent') >= 0 && routText.indexOf('UPGR/1.0') >= 0, 'detail router: UA UPGR/1.0 tampil');
  await page.screenshot({ path: path.join(OUT, 'logdetail-router.png') });

  step('5. browser: daftar + detail simulator memuat IP/UA + header/body');
  await page.goto(`${BASE}/tenant/simulator-webhook`);
  await page.getByTestId('sim-filter-form').waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="sim-rows"]') || {}).textContent?.includes('127.0.0.1'), { timeout: 30000 });
  assert(((await page.getByTestId('sim-rows').textContent()) || '').indexOf('127.0.0.1') >= 0, 'daftar simulator: kolom IP tampil');
  await page.screenshot({ path: path.join(OUT, 'logdetail-sim-list.png') });
  await page.goto(`${BASE}/tenant/simulator-webhook/${simId}`);
  await page.getByTestId('sim-detail-card').waitFor({ state: 'visible', timeout: 30000 });
  assert(await page.getByTestId('sim-detail-req-headers').isVisible(), 'detail simulator: request headers tampil');
  assert(await page.getByTestId('sim-detail-req-body').isVisible(), 'detail simulator: request body tampil');
  assert(await page.getByTestId('sim-detail-resp-body').isVisible(), 'detail simulator: response body tampil');
  const simText = (await page.locator('body').textContent()) || '';
  assert(simText.indexOf('E2E-Logdetail/1.0') >= 0, 'detail simulator: UA pengirim tampil');
  assert(simText.indexOf('INV-LOGDETAIL-WEB') >= 0, 'detail simulator: body tangkapan tampil');
  await page.screenshot({ path: path.join(OUT, 'logdetail-sim.png') });

  const realErrs = errs.filter((e) => e.indexOf('404') < 0);
  assert(realErrs.length === 0, `tanpa pageerror (${realErrs.length})`);

  step('6. middleware: tanpa sesi redirect ke login portal');
  const anon = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const a = await anon.newPage();
  await a.goto(`${BASE}/tenant/simulator-webhook`);
  await a.waitForURL('**/tenant/login', { timeout: 15000 });
  assert(a.url().indexOf('/tenant/login') >= 0, 'tenant tanpa sesi -> /tenant/login');
  await a.goto(`${BASE}/tenant/profil`);
  await a.waitForURL('**/tenant/login', { timeout: 15000 });
  assert(a.url().indexOf('/tenant/login') >= 0, 'profil tanpa sesi -> /tenant/login');
  await a.goto(`${BASE}/provider/beranda`);
  await a.waitForURL('**/provider/login', { timeout: 15000 });
  assert(a.url().indexOf('/provider/login') >= 0, 'provider tanpa sesi -> /provider/login');
  await a.screenshot({ path: path.join(OUT, 'logdetail-redirect.png') });
  await anon.close();
  await browser.close();

  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => { console.error('FATAL:', err); process.exit(1); });
