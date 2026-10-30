// E2E slice kredensial UPGR Nuxt: CRUD + validasi + filter/sort + export/import + bulk
// Jalankan: node tests/e2e/cred.e2e.cjs
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

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

function settled(ms) {
  return new Promise((r) => setTimeout(r, ms || 1500));
}

(async () => {
  step('0. reset via API');
  await waitForServer();
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

  const rowCount = () => page.locator('tbody[data-testid="cred-rows"] tr td:first-child input[data-testid="cred-select"]').count();

  step('1. daftar + seed tampil');
  await page.goto(`${BASE}/tenant/payment-gateway-credential`);
  await page.getByTestId('cred-rows').waitFor();
  await settled();
  assert((await rowCount()) === 2, 'mulai 2 baris seed');

  step('2. tambah invalid');
  await openModal('cred-add', 'cred-form');
  await page.getByTestId('cred-form-submit').click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('Gagal menyimpan') >= 0));
  assert(await page.getByTestId('cred-nama-error').isVisible(), 'error inline nama tampil');
  assert(((await page.getByTestId('cred-form-errors').textContent()) || '').indexOf('Periksa kembali') >= 0, 'ringkasan error tampil');

  step('3. tambah valid');
  await page.getByTestId('cred-nama').fill('Xendit Production');
  await page.getByTestId('cred-provider-input').selectOption('xendit');
  await page.getByTestId('cred-mode-input').selectOption('production');
  await page.getByTestId('cred-status-input').selectOption('nonaktif');
  await page.getByTestId('cred-merchant').fill('M-X1');
  await page.getByTestId('cred-key').fill('xnd-key-001');
  await page.getByTestId('cred-secret').fill('xnd-sec-001');
  await page.getByTestId('cred-deskripsi').fill('Akun xendit production');
  await page.getByTestId('cred-form-submit').click();
  await page.waitForFunction(() => !document.querySelector('[data-testid="cred-modal"]') || document.querySelector('[data-testid="cred-modal"]').classList.contains('hidden'));
  await settled();
  assert((await rowCount()) === 3, 'tambah valid jadi 3 baris');

  step('4. sortir + filter');
  await page.getByTestId('cred-sort-nama').click();
  await settled();
  assert((await page.getByTestId('cred-sort-nama-ind').textContent()) === '▲', 'sortir nama naik');
  await page.getByTestId('cred-q').fill('xendit');
  await page.getByTestId('cred-filter-apply').click();
  await settled();
  assert((await rowCount()) === 1, 'filter xendit 1 baris');
  await page.getByTestId('cred-filter-reset').click();
  await settled();
  assert((await rowCount()) === 3, 'reset kembali 3 baris');
  await page.getByTestId('cred-status').selectOption('nonaktif');
  await page.getByTestId('cred-filter-apply').click();
  await settled();
  assert((await rowCount()) === 2, 'filter nonaktif 2 baris');
  await page.getByTestId('cred-status').selectOption('aktif');
  await page.getByTestId('cred-filter-apply').click();
  await settled();
  assert((await rowCount()) === 1, 'filter aktif 1 baris');
  await page.getByTestId('cred-filter-reset').click();
  await settled();
  assert((await rowCount()) === 3, 'reset status kembali 3 baris');

  step('5. ubah + detail');
  await openModal('cred-edit', 'cred-form');
  await page.getByTestId('cred-nama').fill('DOKU Production 2');
  await page.getByTestId('cred-deskripsi').fill('Akun doku utama');
  await page.getByTestId('cred-status-input').selectOption('aktif');
  await page.getByTestId('cred-form-submit').click();
  await page.waitForFunction(() => !document.querySelector('[data-testid="cred-modal"]') || document.querySelector('[data-testid="cred-modal"]').classList.contains('hidden'));
  await page.waitForFunction(() => (document.querySelector('tbody[data-testid="cred-rows"]') || { textContent: '' }).textContent.indexOf('DOKU Production 2') >= 0, undefined, { timeout: 15000 });
  assert(((await page.locator('tbody[data-testid="cred-rows"]').textContent()) || '').indexOf('DOKU Production 2') >= 0, 'ubah tersimpan');
  assert(((await page.locator('tbody[data-testid="cred-rows"]').textContent()) || '').indexOf('Aktif') >= 0, 'badge status aktif tampil');
  await page.getByTestId('cred-detail').first().click();
  await page.getByTestId('cred-detail-body').waitFor({ state: 'visible', timeout: 15000 });
  assert(((await page.getByTestId('cred-detail-body').textContent()) || '').indexOf('Akun doku utama') >= 0, 'modal detail memuat deskripsi');
  assert(((await page.getByTestId('cred-detail-body').textContent()) || '').indexOf('Aktif') >= 0, 'modal detail memuat status');
  await page.keyboard.press('Escape');
  const href = await page.getByTestId('cred-detail-link').first().getAttribute('href');
  await page.goto(BASE + href);
  await page.getByTestId('cred-detail-list').waitFor();
  assert(((await page.getByTestId('cred-detail-list').textContent()) || '').indexOf('DOKU Production 2') >= 0, 'halaman detail memuat nama');
  assert(((await page.getByTestId('cred-detail-list').textContent()) || '').indexOf('Aktif') >= 0, 'halaman detail memuat status');
  assert(((await page.getByTestId('cred-detail-card').textContent()) || '').indexOf('DOKU Production 2') >= 0, 'header kartu memuat nama');
  assert(await page.getByTestId('cred-test-credential').isEnabled(), 'tombol test kredensial aktif di samping Ubah');
  await page.screenshot({ path: path.join(OUT, 'area-cred-detail.png') });
  await page.goto(`${BASE}/tenant/payment-gateway-credential`);
  await page.getByTestId('cred-rows').waitFor();
  await settled(3000);

  step('6. ekspor + template + impor');
  const [edl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('cred-export-btn').click(),
  ]);
  const edlPath = path.join(OUT, 'cred-export.xlsx');
  await edl.saveAs(edlPath);
  assert(fs.statSync(edlPath).size > 0, 'ekspor terunduh');
  const exp = XLSX.readFile(edlPath);
  const head = XLSX.utils.sheet_to_json(exp.Sheets[exp.SheetNames[0]], { header: 1, defval: '' })[0].map(String);
  assert(head.indexOf('Deskripsi') >= 0, 'ekspor memuat kolom Deskripsi');
  assert(head.indexOf('Status') >= 0, 'ekspor memuat kolom Status');
  const [tdl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('cred-template-btn').click(),
  ]);
  const tdlPath = path.join(OUT, 'cred-template.xlsx');
  await tdl.saveAs(tdlPath);
  assert(fs.statSync(tdlPath).size > 0, 'template terunduh');
  const iwb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(iwb, XLSX.utils.aoa_to_sheet([
    ['Nama', 'Provider', 'Mode', 'Merchant ID', 'Key', 'Secret', 'Verify Token', 'Deskripsi'],
    ['Stripe Test', 'stripe', 'sandbox', 'M-S1', 'sk-test-001', 'ss-test-001', 'tok-s1', 'Akun stripe'],
    ['Midtrans Sandbox', 'midtrans', 'sandbox', 'M-001', 'pendek', 'x', '']
  ]), 'Kredensial');
  const ibuf = XLSX.write(iwb, { type: 'buffer', bookType: 'xlsx' });
  const ipath = path.join(OUT, 'cred-import.xlsx');
  fs.writeFileSync(ipath, ibuf);
  await page.getByTestId('cred-import-file').setInputFiles(ipath);
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('Impor selesai') >= 0));
  await settled();
  assert((await rowCount()) === 4, 'impor 1 valid 1 dilewati');
  const apiRows = await (await fetch(`${BASE}/api_web/credentials`)).json();
  assert((apiRows.data.find((r) => r.nama === 'Stripe Test') || {}).deskripsi === 'Akun stripe', 'impor membawa deskripsi');
  assert((apiRows.data.find((r) => r.nama === 'Stripe Test') || {}).status === 'aktif', 'impor default status aktif');
  await page.screenshot({ path: path.join(OUT, 'area-cred.png') });

  step('6b. test kredensial provider tak didukung (deterministik, tanpa jaringan)');
  const cres = await (await fetch(`${BASE}/api_web/credentials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: 'Gerbang Contoh', provider: 'gerbang-contoh', is_production: false, key: 'kunci-contoh', secret: 'rahasia-contoh' }) })).json();
  const contoh = cres.data;
  assert(!!contoh && contoh.id, 'kredensial contoh terbuat via API');
  await page.goto(`${BASE}/tenant/payment-gateway-credential/${contoh.id}`);
  await page.getByTestId('cred-detail-card').waitFor({ state: 'visible', timeout: 15000 });
  await settled(2000);
  await page.getByTestId('cred-test-credential').click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('belum didukung') >= 0));
  assert(((await page.locator('body').textContent()) || '').indexOf('belum didukung') >= 0, 'provider tak didukung ditolak jelas');
  await (await fetch(`${BASE}/api_web/credentials/${contoh.id}`, { method: 'DELETE' })).json();
  await page.goto(`${BASE}/tenant/payment-gateway-credential`);
  await page.getByTestId('cred-rows').waitFor({ state: 'visible', timeout: 15000 });
  await settled();

  step('6c. test kredensial midtrans tercatat di Log API');
  const mc = await (await fetch(`${BASE}/api_web/credentials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: 'Midtrans Uji API', provider: 'midtrans', is_production: false, merchant_id: 'M-T1', key: 'SB-Mid-client-uji', secret: 'SB-Mid-secret-uji', deskripsi: 'Uji pencatatan log API' }) })).json();
  assert(mc.data && mc.data.id, 'kredensial midtrans terbuat via API');
  await page.goto(`${BASE}/tenant/payment-gateway-credential/${mc.data.id}`);
  await page.getByTestId('cred-detail-card').waitFor({ state: 'visible', timeout: 15000 });
  await settled(2000);
  await page.getByTestId('cred-test-credential').click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => /Kredensial valid|Kredensial bermasalah/.test(el.textContent || '')), undefined, { timeout: 60000 });
  assert(/Kredensial valid|Kredensial bermasalah/.test((await page.locator('[data-testid="toast"]:last-child').textContent()) || ''), 'hasil uji tampil (valid/bermasalah)');
  await page.getByTestId('api-tab-log').click();
  await page.getByTestId('api-panel-log').waitFor({ state: 'visible', timeout: 15000 });
  await settled();
  assert(((await page.getByTestId('api-rows').textContent()) || '').indexOf('midtrans') >= 0, 'entri log API muncul setelah Test kredensial');

  step('6d. halaman detail Log API');
  await page.getByTestId('api-detail').first().click();
  await page.getByTestId('api-detail-card').waitFor({ state: 'visible', timeout: 15000 });
  assert(((await page.getByTestId('api-detail-list').textContent()) || '').indexOf('midtrans') >= 0, 'halaman detail memuat provider');
  assert(await page.getByTestId('api-detail-request').isVisible(), 'blok request tampil');
  assert(await page.getByTestId('api-detail-response').isVisible(), 'blok response tampil');
  assert(await page.getByTestId('api-detail-req-headers').isVisible(), 'blok request headers tampil');
  assert(await page.getByTestId('api-detail-req-body').isVisible(), 'blok request body tampil');
  assert(await page.getByTestId('api-detail-resp-headers').isVisible(), 'blok response headers tampil');
  assert(await page.getByTestId('api-detail-resp-body').isVisible(), 'blok response body tampil');
  const body6d = (await page.locator('body').textContent()) || '';
  assert(body6d.indexOf('Basic ***') >= 0, 'header tersensor tampil sebagai Basic *** (bukti sensor)');
  assert(body6d.indexOf('SB-Mid-secret-uji') < 0, 'secret uji TIDAK MUNCUL di halaman detail (sensor)');
  assert(body6d.indexOf('SB-Mid-secret-001') < 0 && body6d.indexOf('DK-secret-001') < 0, 'secret seed TIDAK MUNCUL di halaman detail');
  assert(await page.getByTestId('page-cred-detail').isHidden(), 'halaman induk tersembunyi saat detail terbuka');
  await page.screenshot({ path: path.join(OUT, 'area-cred-api-log.png') });
  await (await fetch(`${BASE}/api_web/credentials/${mc.data.id}`, { method: 'DELETE' })).json();
  await page.goto(`${BASE}/tenant/payment-gateway-credential`);
  await page.getByTestId('cred-rows').waitFor({ state: 'visible', timeout: 15000 });
  await settled();

  step('7. bulk hapus');
  await page.getByTestId('cred-select-all').check();
  await settled();
  assert(((await page.getByTestId('cred-selected-count').textContent()) || '').indexOf('4 dipilih') >= 0, 'pilih semua 4');
  await page.getByTestId('cred-bulk-delete').click();
  await page.getByTestId('cred-delete-modal').waitFor({ state: 'visible', timeout: 15000 });
  await page.getByTestId('cred-delete-x').click();
  await page.getByTestId('cred-delete-modal').waitFor({ state: 'detached', timeout: 15000 });
  assert(await page.getByTestId('cred-modal-backdrop').isHidden(), 'X hapus ikut menutup backdrop');
  await page.getByTestId('cred-bulk-delete').click();
  await page.getByTestId('cred-delete-confirm').click();
  await settled();
  assert((await rowCount()) === 0, 'bulk hapus mengosongkan tabel');

  // 422 dari probe provider tak didukung (disengaja, seperti filter di wh/prov/login)
  const realErrors = consoleErrors.filter((e) => e.indexOf('422') < 0);
  console.log(`\nconsole errors: ${consoleErrors.length} (diabaikan 422 disengaja: ${consoleErrors.length - realErrors.length})`);
  consoleErrors.forEach((e) => console.log(`  [console] ${e}`));
  if (realErrors.length > 0) failures++;

  await browser.close();
  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
