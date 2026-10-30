// E2E slice tenant API keys + profil + dashboard (Nuxt + MySQL)
// Jalankan: node tests/e2e/tenant.e2e.cjs
const { chromium } = require('playwright');
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

function settled(ms) {
  return new Promise((r) => setTimeout(r, ms || 1500));
}

(async () => {
  step('0. reset via API');
  const rst = await (await fetch(`${BASE}/api_web/_test/reset`, { method: 'POST' })).json();
  assert(rst.data && rst.data.seeds === 2, 'reset: 2 seed kredensial');

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
  const rowCount = () => page.getByTestId('api-select').count();

  step('1. daftar + seed tampil');
  await page.goto(`${BASE}/tenant/api`);
  await page.getByTestId('api-rows').waitFor();
  await settled(3000);
  assert((await rowCount()) === 2, 'mulai 2 baris seed');
  assert(await page.getByTestId('admin-menu-api').isVisible(), 'menu API tampil');

  step('2. tambah invalid');
  await openModal('api-add', 'api-form');
  await page.getByTestId('api-key').fill('');
  await page.getByTestId('api-secret').fill('');
  await page.getByTestId('api-form-submit').click();
  await page.getByTestId('api-form-errors').waitFor({ state: 'visible', timeout: 15000 });
  assert(await page.getByTestId('api-form-errors').isVisible(), 'ringkasan error tampil');
  assert(await page.getByTestId('api-name-error').isVisible(), 'error inline nama tampil');
  assert(await page.getByTestId('api-key-error').isVisible(), 'error inline key tampil');

  step('3. tambah valid + generate + show');
  await page.getByTestId('api-name').fill('DCVS Production');
  await page.getByTestId('api-key-generate').click();
  await page.getByTestId('api-secret-generate').click();
  const genKey = await page.getByTestId('api-key').inputValue();
  assert(genKey.length === 32, 'generate key 32 hex');
  assert((await page.getByTestId('api-secret').getAttribute('type')) === 'password', 'secret tersensor');
  await page.getByTestId('api-show').click();
  assert((await page.getByTestId('api-secret').getAttribute('type')) === 'text', 'show secret tampil');
  await page.getByTestId('api-form-submit').click();
  await page.getByTestId('api-modal').waitFor({ state: 'detached', timeout: 15000 });
  await settled();
  assert((await rowCount()) === 3, 'tambah valid jadi 3 baris');

  step('4. sortir + filter');
  await page.getByTestId('api-sort-name').click();
  await settled();
  assert((await page.getByTestId('api-sort-name-ind').textContent()) === '▲', 'sortir nama naik');
  await page.getByTestId('api-status').selectOption('nonaktif');
  await page.getByTestId('api-filter-apply').click();
  await settled();
  assert((await rowCount()) === 1, 'filter nonaktif 1 baris');
  await page.getByTestId('api-filter-reset').click();
  await settled();
  assert((await rowCount()) === 3, 'reset kembali 3 baris');

  step('5. ubah + detail');
  await page.getByTestId('api-sort-reset').click();
  await settled();
  await openModal('api-edit', 'api-form');
  await page.getByTestId('api-name').fill('ERP Production 2');
  await page.getByTestId('api-form-submit').click();
  await page.getByTestId('api-modal').waitFor({ state: 'detached', timeout: 15000 });
  await settled();
  assert(await page.locator('tbody[data-testid="api-rows"]').getByText('ERP Production 2').count() >= 1, 'ubah tersimpan');
  await page.getByTestId('api-detail').first().click();
  await page.getByTestId('api-detail-body').waitFor({ state: 'visible', timeout: 15000 });
  const dt = await page.getByTestId('api-detail-body').textContent();
  assert(dt.indexOf('ERP Production 2') >= 0, 'detail memuat nama baru');
  assert(dt.indexOf('••••••••') >= 0, 'secret disensor di detail');
  await page.keyboard.press('Escape');
  await settled(500);

  step('6. ekspor + template + impor');
  const [wdl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('api-export-btn').click(),
  ]);
  const wdlPath = path.join(OUT, 'api-export.xlsx');
  await wdl.saveAs(wdlPath);
  assert(fs.statSync(wdlPath).size > 0, 'ekspor terunduh');
  const wexp = XLSX.readFile(wdlPath);
  const whead = XLSX.utils.sheet_to_json(wexp.Sheets[wexp.SheetNames[0]], { header: 1, defval: '' })[0].map(String);
  assert(whead.indexOf('Tenant ID') >= 0 && whead.indexOf('Secret') >= 0, 'ekspor memuat kolom');
  const [wtpl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('api-template-btn').click(),
  ]);
  const wtplPath = path.join(OUT, 'template-api.xlsx');
  await wtpl.saveAs(wtplPath);
  assert(fs.statSync(wtplPath).size > 0, 'template terunduh');
  const wwb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wwb, XLSX.utils.aoa_to_sheet([['Nama', 'Tenant ID', 'Status', 'Key', 'Secret'], ['API Baru', '01a18296-88bb-7cd3-888e-b69cb5214659', 'aktif', 'upgrk_baru_001', 'upgrs_baru_001'], ['Duplikat', '01a18296-88bb-7cd3-888e-b69cb5214659', 'aktif', 'upgrk_erp_prod_001', 'upgrs_x']]), 'API');
  const wbuf = XLSX.write(wwb, { type: 'buffer', bookType: 'xlsx' });
  await page.getByTestId('api-import-file').setInputFiles({ name: 'apiimpor.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: wbuf });
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('Impor selesai') >= 0));
  await settled();
  assert((await rowCount()) === 4, 'impor 1 valid 1 dilewati');

  step('7. bulk hapus');
  await page.getByTestId('api-select').first().check();
  await settled();
  assert(((await page.getByTestId('api-selected-count').textContent()) || '').trim() === '1', 'pilih 1');
  await page.getByTestId('api-bulk-delete').click();
  await page.getByTestId('api-delete-modal').waitFor({ state: 'visible', timeout: 15000 });
  await page.getByTestId('api-delete-confirm').click();
  await settled();
  assert((await rowCount()) === 3, 'bulk hapus tersisa 3');

  step('8. profil simpan + bertahan');
  await page.goto(`${BASE}/tenant/login`);
  await page.getByTestId('login-form').waitFor({ state: 'visible', timeout: 15000 });
  await settled(3000);
  await page.getByTestId('login-email').fill('admin@example.com');
  await page.getByTestId('login-password').fill('sandi-tenant-123');
  await page.waitForFunction(() => (document.querySelector('[data-testid="login-captcha-token"]') || {}).value, { timeout: 30000 }).catch(() => {});
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/tenant/beranda', { timeout: 30000 });
  assert(page.url().indexOf('/tenant/beranda') >= 0, 'login admin berhasil');
  await page.goto(`${BASE}/tenant/profil`);
  await page.getByTestId('profil-form').waitFor();
  await settled(3000);
  assert(((await page.getByTestId('profil-nama').inputValue()) || '').length > 0, 'nama default terisi');
  assert((await page.getByTestId('profil-email').inputValue()) === 'admin@example.com', 'email akun login terisi');
  await page.getByTestId('profil-nama').fill('');
  await page.getByTestId('profil-submit').click();
  await settled();
  assert(await page.getByTestId('profil-nama-error').isVisible(), 'error nama tampil');
  await page.getByTestId('profil-nama').fill('PT Uji Coba');
  await page.getByTestId('profil-email').fill('bukan-email');
  await page.getByTestId('profil-submit').click();
  await settled();
  assert(await page.getByTestId('profil-email-error').isVisible(), 'error email tampil');
  await page.getByTestId('profil-email').fill('admin@example.com');
  await page.getByTestId('profil-submit').click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('tersimpan') >= 0));
  await page.reload();
  await page.getByTestId('profil-form').waitFor();
  await settled(3000);
  assert((await page.getByTestId('profil-nama').inputValue()) === 'PT Uji Coba', 'profil bertahan di MySQL');
  assert((await page.getByTestId('profil-email').inputValue()) === 'admin@example.com', 'email bertahan di MySQL');

  step('8b. ganti kata sandi lalu kembalikan');
  await (await fetch(`${BASE}/api_web/_test/seed-user`, { method: 'POST' })).json();
  await page.goto(`${BASE}/tenant/login`);
  await page.getByTestId('login-form').waitFor({ state: 'visible', timeout: 15000 });
  await settled(3000);
  await page.getByTestId('login-email').fill('uji@example.com');
  await page.getByTestId('login-password').fill('sandi-uji-123');
  await page.waitForFunction(() => (document.querySelector('[data-testid="login-captcha-token"]') || {}).value, { timeout: 30000 }).catch(() => {});
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/tenant/beranda', { timeout: 30000 });
  assert(page.url().indexOf('/tenant/beranda') >= 0, 'login uji berhasil');
  await page.goto(`${BASE}/tenant/profil`);
  await page.getByTestId('profil-pass-form').waitFor({ state: 'visible', timeout: 15000 });
  await settled(3000);
  await page.getByTestId('profil-pass-baru').fill('pendek');
  await page.getByTestId('profil-pass-submit').click();
  assert(await page.getByTestId('profil-pass-baru-error').isVisible(), 'error sandi pendek tampil');
  await page.getByTestId('profil-pass-lama').fill('salah-lama');
  await page.getByTestId('profil-pass-baru').fill('Sandi-Baru-123');
  await page.getByTestId('profil-pass-konfirmasi').fill('Sandi-Baru-123');
  await page.getByTestId('profil-pass-submit').click();
  await page.getByTestId('profil-pass-lama-error').waitFor({ state: 'visible', timeout: 15000 });
  assert(await page.getByTestId('profil-pass-lama-error').isVisible(), 'error sandi lama salah tampil');
  assert(await page.getByTestId('profil-pass-errors').isVisible(), 'ringkasan error sandi tampil');
  await page.getByTestId('profil-pass-lama').fill('sandi-uji-123');
  await page.getByTestId('profil-pass-submit').click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('berhasil diganti') >= 0), { timeout: 15000 });
  assert(true, 'ganti sandi berhasil');
  await page.getByTestId('profil-pass-lama').fill('Sandi-Baru-123');
  await page.getByTestId('profil-pass-baru').fill('sandi-uji-123');
  await page.getByTestId('profil-pass-konfirmasi').fill('sandi-uji-123');
  await page.getByTestId('profil-pass-submit').click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('berhasil diganti') >= 0), { timeout: 15000 });
  assert(true, 'sandi dikembalikan seperti semula');

  step('9. dashboard widget');
  await page.goto(`${BASE}/tenant/dashboard`);
  await page.getByTestId('page-tenant-dashboard').waitFor();
  await settled();
  assert(((await page.locator('body').textContent()) || '').indexOf('QRIS dibuat') >= 0, 'widget tampil');

  console.log(`\nconsole errors: ${consoleErrors.length}`);
  consoleErrors.forEach((e) => console.log(`  [console] ${e}`));
  if (consoleErrors.filter((e) => e.indexOf(`status of 422`) < 0).length > 0) failures++;

  await browser.close();
  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
