// E2E slice webhook + log UPGR Nuxt (di halaman detail kredensial)
// Jalankan: node tests/e2e/wh.e2e.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const http = require('http');

const PORT = 3200;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(__dirname, 'output');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

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

function settled(ms) {
  return new Promise((r) => setTimeout(r, ms || 1500));
}

(async () => {
  const hookServer = http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); });
  await new Promise((r) => hookServer.listen(0, '127.0.0.1', r));
  const HOOK2 = `http://127.0.0.1:${hookServer.address().port}/hook`;
  step('0. reset via API');
  const rst = await (await fetch(`${BASE}/api_web/_test/reset`, { method: 'POST' })).json();
  assert(rst.data && rst.data.seeds === 2, 'reset: 2 seed');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  page.on('dialog', (d) => d.accept().catch(() => {}));
  async function openModal(btnId, formId) {
    for (let i = 0; i < 8; i++) {
      await page.getByTestId(btnId).first().click();
      try { await page.getByTestId(formId).waitFor({ state: 'visible', timeout: 2000 }); return; }
      catch {}
    }
    throw new Error('modal tidak terbuka: ' + btnId);
  }

  const wRowCount = () => page.getByTestId('wh-select').count();

  step('1. seksi webhook tampil, mulai kosong');
  await page.goto(`${BASE}/tenant/payment-gateway-credential/01a18296-88bf-7931-ba3d-b391e594d1a0`);
  await page.getByTestId('page-wh').waitFor();
  await settled(3000);
  assert(await page.getByTestId('page-wh').isVisible(), 'seksi webhook tampil');
  assert((await wRowCount()) === 0, 'mulai 0 webhook');

  step('2. tab log');
  await page.getByTestId('wh-tab-log').click();
  await page.getByTestId('wh-panel-log').waitFor({ state: 'visible', timeout: 15000 });
  assert(!(await page.getByTestId('wh-panel-daftar').isVisible()), 'tab log menyembunyikan daftar');
  assert(!(await page.getByTestId('wh-wrap').isVisible()), 'tab log menyembunyikan tabel daftar');
  assert(((await page.getByTestId('whlog-rows').textContent()) || '').indexOf('Belum ada log') >= 0, 'log mulai kosong');
  await page.getByTestId('wh-tab-daftar').click();
  await page.getByTestId('wh-panel-daftar').waitFor({ state: 'visible', timeout: 15000 });

  step('3. tambah invalid');
  await openModal('wh-add', 'wh-form');
  await page.getByTestId('wh-form-submit').click();
  await page.getByTestId('toast').last().waitFor({ state: 'visible', timeout: 15000 });
  assert(await page.getByTestId('wh-form-errors').isVisible(), 'ringkasan error tampil');
  assert(await page.getByTestId('wh-url-error').isVisible(), 'error inline url tampil');
  await page.getByTestId('wh-prefix').fill('AB C');
  await page.getByTestId('wh-form-submit').click();
  assert(await page.getByTestId('wh-prefix-error').isVisible(), 'error inline prefix tampil');

  async function createWh(url, status, token, nama, deskripsi, prefix) {
    if (!(await page.getByTestId('wh-modal').isVisible())) {
      await openModal('wh-add', 'wh-form');
    }
    await page.getByTestId('wh-nama').fill(nama || '');
    await page.getByTestId('wh-url').fill(url);
    await page.getByTestId('wh-active').selectOption(status);
    await page.getByTestId('wh-prefix').fill(prefix || '');
    await page.getByTestId('wh-token').fill(token);
    await page.getByTestId('wh-deskripsi').fill(deskripsi || '');
    await page.getByTestId('wh-form-submit').click();
    await page.getByTestId('wh-modal').waitFor({ state: 'detached', timeout: 15000 });
  }

  step('4. tambah 2 webhook');
  await createWh('https://erp.contoh.id/hook', 'aktif', 'tok-erp', 'Penerusan ERP', 'Hook ERP', 'ERP-');
  assert((await wRowCount()) === 1, 'tambah valid jadi 1 baris');
  await createWh('https://bis.contoh.id/hook', 'nonaktif', '', 'Penerusan BIS', '', '');
  assert((await wRowCount()) === 2, 'tambah kedua jadi 2 baris');
  assert(await page.locator('tbody[data-testid="wh-rows"]').getByText('Penerusan ERP').count() >= 1, 'nama tampil di tabel');

  step('5. reload bertahan (MySQL)');
  await page.reload();
  await page.getByTestId('wh-rows').waitFor();
  await settled(3000);
  assert((await wRowCount()) === 2, 'data bertahan setelah reload');

  step('6. filter + sortir');
  await page.getByTestId('wh-status').selectOption('nonaktif');
  await page.getByTestId('wh-filter-apply').click();
  await settled();
  assert((await wRowCount()) === 1, 'filter nonaktif jadi 1 baris');
  await page.getByTestId('wh-filter-reset').click();
  await settled();
  assert((await wRowCount()) === 2, 'reset kembali 2 baris');
  await page.getByTestId('wh-sort-url').click();
  await settled();
  assert((await page.getByTestId('wh-sort-url-ind').textContent()) === '▲', 'sortir url naik');
  await page.getByTestId('wh-sort-nama').click();
  await settled();
  assert((await page.getByTestId('wh-sort-nama-ind').textContent()) === '▲', 'sortir nama naik');

  step('7. ubah + detail');
  await openModal('wh-edit', 'wh-form');
  await page.getByTestId('wh-nama').fill('Penerusan BIS 2');
  await page.getByTestId('wh-url').fill('https://bis2.contoh.id/hook');
  await page.getByTestId('wh-prefix').fill('BIS-');
  await page.getByTestId('wh-deskripsi').fill('Hook BIS 2');
  await page.getByTestId('wh-form-submit').click();
  await page.getByTestId('wh-modal').waitFor({ state: 'detached', timeout: 15000 });
  assert(await page.locator('tbody[data-testid="wh-rows"]').getByText('https://bis2.contoh.id/hook').count() >= 1, 'ubah url tersimpan');
  await page.getByTestId('wh-detail').first().click();
  await page.getByTestId('wh-detail-body').waitFor({ state: 'visible', timeout: 15000 });
  const wdt = await page.getByTestId('wh-detail-body').textContent();
  assert(wdt.indexOf('https://bis2.contoh.id/hook') >= 0, 'modal detail tampil');
  assert(wdt.indexOf('Penerusan BIS 2') >= 0, 'detail memuat nama');
  assert(wdt.indexOf('BIS-') >= 0, 'detail memuat prefix');
  assert(wdt.indexOf('Hook BIS 2') >= 0, 'detail memuat deskripsi');
  await page.keyboard.press('Escape');
  await page.screenshot({ path: path.join(OUT, 'area-wh-invalid.png') });

  step('8. ekspor + template + impor');
  const [wdl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('wh-export-btn').click(),
  ]);
  const wdlPath = path.join(OUT, 'wh-export.xlsx');
  await wdl.saveAs(wdlPath);
  assert(fs.statSync(wdlPath).size > 0, 'ekspor excel terunduh');
  const wexp = XLSX.readFile(wdlPath);
  const whead = XLSX.utils.sheet_to_json(wexp.Sheets[wexp.SheetNames[0]], { header: 1, defval: '' })[0].map(String);
  assert(whead.indexOf('Nama') >= 0 && whead.indexOf('Prefix') >= 0, 'ekspor memuat kolom Nama dan Prefix');
  const wwb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wwb, XLSX.utils.aoa_to_sheet([['Nama', 'URL', 'Prefix', 'Status', 'Token', 'Deskripsi'], ['Hook DCVS', 'https://dcvs.contoh.id/hook', 'DCVS-', 'aktif', 'tok-dcvs', 'Hook DCVS'], ['Duplikat', 'https://erp.contoh.id/hook', '', 'aktif', 'duplikat ditolak', '']]), 'Webhook');
  const wbuf = XLSX.write(wwb, { type: 'buffer', bookType: 'xlsx' });
  const [wtpl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('wh-template-btn').click(),
  ]);
  const wtplPath = path.join(OUT, 'template-webhook.xlsx');
  await wtpl.saveAs(wtplPath);
  assert(fs.statSync(wtplPath).size > 0, 'template terunduh');
  await page.getByTestId('wh-import-file').setInputFiles({ name: 'whimpor.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: wbuf });
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('Impor selesai') >= 0));
  await settled();
  assert((await wRowCount()) === 3, 'impor 1 valid 1 dilewati');
  assert(await page.locator('tbody[data-testid="wh-rows"]').getByText('Hook DCVS').count() >= 1, 'impor membawa nama');

  step('9. bulk hapus 1');
  await page.getByTestId('wh-select').first().check();
  await settled();
  await page.getByTestId('wh-bulk-delete').click();
  await page.getByTestId('wh-delete-modal').waitFor({ state: 'visible', timeout: 15000 });
  await page.getByTestId('wh-delete-confirm').click();
  await settled();
  assert((await wRowCount()) === 2, 'bulk hapus 1 tersisa 2');

  step('10. uji kirim ditolak saat nonaktif, lalu terkirim');
  await page.getByTestId('wh-test').first().click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('nonaktif') >= 0));
  assert(((await page.locator('[data-testid="toast"]:last-child').textContent()) || '').indexOf('nonaktif') >= 0, 'webhook nonaktif ditolak');
  await openModal('wh-edit', 'wh-form');
  await page.getByTestId('wh-active').selectOption('aktif');
  await page.getByTestId('wh-url').fill(`${BASE}/api_web/_test/ping`);
  await page.getByTestId('wh-form-submit').click();
  await page.getByTestId('wh-modal').waitFor({ state: 'detached', timeout: 15000 });
  await settled();
  await page.getByTestId('wh-test').first().click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('terkirim') >= 0));
  await page.getByTestId('wh-tab-log').click();
  await page.getByTestId('whlog-rows').waitFor({ state: 'visible', timeout: 15000 });
  await settled();
  assert(((await page.getByTestId('whlog-rows').textContent()) || '').indexOf('Terkirim') >= 0, 'log uji tercatat');

  step('10b. uji semua webhook aktif');
  await page.getByTestId('wh-tab-daftar').click();
  await settled();
  await page.getByTestId('wh-edit').nth(1).click();
  await page.getByTestId('wh-form').waitFor({ state: 'visible', timeout: 15000 });
  await page.getByTestId('wh-url').fill(HOOK2);
  await page.getByTestId('wh-form-submit').click();
  await page.getByTestId('wh-modal').waitFor({ state: 'detached', timeout: 15000 });
  await settled();
  assert((await wRowCount()) === 2, 'tabel memuat 2 webhook');
  await page.getByTestId('wh-test').nth(1).click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('Uji kirim terkirim') >= 0));
  await page.getByTestId('wh-tab-log').click();
  await settled();
  assert(((await page.getByTestId('whlog-rows').textContent()) || '').indexOf('Uji coba') >= 0, 'log uji kedua tercatat');

  step('11. filter log hasil + tanggal');
  await page.getByTestId('whlog-hasil').selectOption('gagal');
  await page.getByTestId('whlog-filter-apply').click();
  await settled();
  assert(((await page.getByTestId('whlog-rows').textContent()) || '').indexOf('Tidak ada hasil') >= 0, 'filter log gagal kosong');
  await page.getByTestId('whlog-filter-reset').click();
  await settled();
  await page.getByTestId('whlog-dari').fill('2999-01-01');
  await page.getByTestId('whlog-filter-apply').click();
  await settled();
  assert(((await page.getByTestId('whlog-rows').textContent()) || '').indexOf('Tidak ada hasil') >= 0, 'filter log dari-kosong');
  await page.getByTestId('whlog-filter-reset').click();
  await settled();
  assert(((await page.getByTestId('whlog-rows').textContent()) || '').indexOf('Terkirim') >= 0, 'reset tanggal kembali ada log');
  await page.getByTestId('whlog-sampai').fill('2000-01-01');
  await page.getByTestId('whlog-filter-apply').click();
  await settled();
  assert(((await page.getByTestId('whlog-rows').textContent()) || '').indexOf('Tidak ada hasil') >= 0, 'filter log sampai-kosong');
  await page.getByTestId('whlog-filter-reset').click();
  await settled();

  step('12. ekspor log');
  const [ldl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('whlog-export-btn').click(),
  ]);
  const ldlPath = path.join(OUT, 'log-webhook.xlsx');
  await ldl.saveAs(ldlPath);
  assert(fs.statSync(ldlPath).size > 0, 'ekspor log terunduh');
  await page.screenshot({ path: path.join(OUT, 'area-wh-log.png') });

  step('13. test kredensial tercatat di Log API');
  await page.getByTestId('cred-test-credential').click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => /Kredensial valid|Kredensial bermasalah/.test(el.textContent || '')), undefined, { timeout: 60000 });
  assert(/Kredensial valid|Kredensial bermasalah/.test((await page.locator('[data-testid="toast"]:last-child').textContent()) || ''), 'hasil uji tampil (valid/bermasalah)');
  await page.getByTestId('api-tab-log').click();
  await page.getByTestId('api-panel-log').waitFor({ state: 'visible', timeout: 15000 });
  await settled();
  assert(((await page.getByTestId('api-rows').textContent()) || '').indexOf('midtrans') >= 0, 'entri log API muncul setelah Test kredensial');

  step('14. halaman detail Log API');
  await page.getByTestId('api-detail').first().click();
  await page.getByTestId('api-detail-card').waitFor({ state: 'visible', timeout: 15000 });
  assert(((await page.getByTestId('api-detail-list').textContent()) || '').indexOf('midtrans') >= 0, 'halaman detail memuat provider');
  assert(await page.getByTestId('api-detail-request').isVisible(), 'blok request tampil');
  assert(await page.getByTestId('api-detail-response').isVisible(), 'blok response tampil');
  assert(await page.getByTestId('api-detail-req-headers').isVisible(), 'blok request headers tampil');
  assert(await page.getByTestId('api-detail-req-body').isVisible(), 'blok request body tampil');
  assert(await page.getByTestId('api-detail-resp-headers').isVisible(), 'blok response headers tampil');
  assert(await page.getByTestId('api-detail-resp-body').isVisible(), 'blok response body tampil');
  const body14 = (await page.locator('body').textContent()) || '';
  assert(body14.indexOf('Basic ***') >= 0, 'header tersensor tampil sebagai Basic *** (bukti sensor)');
  assert(body14.indexOf('SB-Mid-secret-001') < 0, 'secret seed TIDAK MUNCUL di halaman detail (sensor)');
  assert(body14.indexOf('DK-secret-001') < 0, 'secret seed doku TIDAK MUNCUL di halaman detail');
  assert(await page.getByTestId('page-cred-detail').isHidden(), 'halaman induk tersembunyi saat detail terbuka');
  await page.screenshot({ path: path.join(OUT, 'area-api-log.png') });

  step('14b. tab Log Provider + halaman detail');
  await (await fetch(`${BASE}/api_external/publik/notify/midtrans/01a18296-88bf-7931-ba3d-b391e594d1a0`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: 'UPGR-E2E-14B', status_code: '200', gross_amount: '1000', signature_key: 'salah' }) })).json();
  await page.goto(`${BASE}/tenant/payment-gateway-credential/01a18296-88bf-7931-ba3d-b391e594d1a0`);
  await page.getByTestId('page-cred-detail').waitFor({ state: 'visible', timeout: 15000 });
  await settled();
  await page.getByTestId('api-tab-plog').click();
  await page.getByTestId('api-panel-plog').waitFor({ state: 'visible', timeout: 15000 });
  await settled();
  assert(((await page.getByTestId('api-prow-rows').textContent()) || '').indexOf('midtrans') >= 0, 'log provider tercatat via notify');
  await page.getByTestId('api-prow-detail').first().click();
  await page.getByTestId('api-pdetail-card').waitFor({ state: 'visible', timeout: 15000 });
  assert(((await page.getByTestId('api-pdetail-list').textContent()) || '').indexOf('midtrans') >= 0, 'halaman detail provider memuat provider');
  assert(await page.getByTestId('api-pdetail-req-headers').isVisible(), 'halaman provider: blok request headers tampil');
  assert(await page.getByTestId('api-pdetail-req-body').isVisible(), 'halaman provider: blok request body tampil');
  assert(await page.getByTestId('api-pdetail-resp-headers').isVisible(), 'halaman provider: blok response headers tampil');
  assert(await page.getByTestId('api-pdetail-resp-body').isVisible(), 'halaman provider: blok response body tampil');
  assert(await page.getByTestId('page-cred-detail').isHidden(), 'halaman induk tersembunyi saat detail provider terbuka');
  await page.screenshot({ path: path.join(OUT, 'area-prov-log.png') });
  await page.getByTestId('api-pdetail-back').click();
  await page.getByTestId('page-cred-detail').waitFor({ state: 'visible', timeout: 15000 });

  step('14c. halaman detail Log Router');
  await page.getByTestId('wh-tab-log').click();
  await page.getByTestId('wh-panel-log').waitFor({ state: 'visible', timeout: 15000 });
  await settled();
  await page.getByTestId('whlog-detail').first().click();
  await page.getByTestId('whlog-detail-card').waitFor({ state: 'visible', timeout: 15000 });
  assert(await page.getByTestId('whlog-detail-req-headers').isVisible(), 'halaman router: blok request headers tampil');
  assert(await page.getByTestId('whlog-detail-req-body').isVisible(), 'halaman router: blok request body tampil');
  assert(await page.getByTestId('whlog-detail-resp-headers').isVisible(), 'halaman router: blok response headers tampil');
  assert(await page.getByTestId('whlog-detail-resp-body').isVisible(), 'halaman router: blok response body tampil');
  assert(await page.getByTestId('page-cred-detail').isHidden(), 'halaman induk tersembunyi saat detail router terbuka');
  await page.screenshot({ path: path.join(OUT, 'area-router-log.png') });
  await page.getByTestId('whlog-detail-back').click();
  await page.getByTestId('page-cred-detail').waitFor({ state: 'visible', timeout: 15000 });

  const realErrors = consoleErrors.filter((e) => e.indexOf('422') < 0);
  console.log(`\nconsole errors: ${consoleErrors.length} (diabaikan 422 disengaja: ${consoleErrors.length - realErrors.length})`);
  consoleErrors.forEach((e) => console.log(`  [console] ${e}`));
  if (realErrors.length > 0) failures++;

  await new Promise((r) => hookServer.close(r));
  await browser.close();
  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
