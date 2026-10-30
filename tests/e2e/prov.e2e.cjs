// E2E slice provider: tenant CRUD + konfigurasi CRUD (Nuxt + MySQL)
// Jalankan: node tests/e2e/prov.e2e.cjs
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
  async function openModal(btnId, formId) {
    for (let i = 0; i < 8; i++) {
      await page.getByTestId(btnId).first().click();
      try { await page.getByTestId(formId).waitFor({ state: 'visible', timeout: 2000 }); return; }
      catch {}
    }
    throw new Error('modal tidak terbuka: ' + btnId);
  }
  async function waitToast(text) {
    await page.waitForFunction((t) => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf(t) >= 0), text);
  }
  const tRowCount = () => page.getByTestId('tenant-select').count();
  const kRowCount = () => page.getByTestId('konfig-select').count();

  step('1. tenant: seed tampil + navigasi provider');
  await page.goto(`${BASE}/provider/tenant`);
  await page.getByTestId('tenant-rows').waitFor();
  await settled(3000);
  assert((await tRowCount()) === 1, 'mulai 1 baris seed');
  assert((await page.locator('tbody[data-testid="tenant-rows"]').getByText('PT Contoh Teknologi Indonesia').count()) >= 1, 'seed tampil');
  assert(await page.getByTestId('admin-menu-tenant').isVisible(), 'menu tenant tampil');
  assert(await page.getByTestId('admin-menu-konfigurasi').isVisible(), 'menu konfigurasi tampil');

  step('2. tenant: tambah invalid');
  await openModal('tenant-add', 'tenant-form');
  await page.getByTestId('tenant-form-submit').click();
  await page.getByTestId('tenant-form-errors').waitFor({ state: 'visible', timeout: 15000 });
  assert(await page.getByTestId('tenant-form-errors').isVisible(), 'ringkasan error tampil');
  assert(await page.getByTestId('tenant-nama-error').isVisible(), 'error inline nama tampil');
  assert(await page.getByTestId('tenant-email-error').isVisible(), 'error inline email tampil');
  assert(await page.getByTestId('tenant-password-error').isVisible(), 'error inline kata sandi tampil');
  await page.getByTestId('tenant-form-cancel').click();
  await page.getByTestId('tenant-modal').waitFor({ state: 'detached', timeout: 15000 });

  step('3. tenant: tambah 2 valid');
  async function tambahTenant(nama, email, pass, status, deskripsi) {
    await openModal('tenant-add', 'tenant-form');
    await page.getByTestId('tenant-nama').fill(nama);
    await page.getByTestId('tenant-email').fill(email);
    await page.getByTestId('tenant-password').fill(pass);
    if (deskripsi) await page.getByTestId('tenant-deskripsi').fill(deskripsi);
    await page.getByTestId('tenant-status-input').selectOption(status);
    await page.getByTestId('tenant-form-submit').click();
    await page.getByTestId('tenant-modal').waitFor({ state: 'detached', timeout: 15000 });
    await settled();
  }
  await tambahTenant('Kopsis Mawar', 'kopsis@contoh.id', 'sandi-ku-123', 'nonaktif', 'Koperasi sekolah');
  await tambahTenant('Toko Berkah', 'toko@contoh.id', 'sandi-tb-123', 'aktif', '');
  assert((await tRowCount()) === 3, 'tambah 2 menjadi 3 baris');

  step('4. tenant: filter cari + status');
  await page.getByTestId('tenant-q').fill('kopsis');
  await page.getByTestId('tenant-filter-apply').click();
  await settled();
  assert((await tRowCount()) === 1, 'filter kopsis 1 baris');
  await page.getByTestId('tenant-filter-reset').click();
  await settled();
  await page.getByTestId('tenant-status').selectOption('nonaktif');
  await page.getByTestId('tenant-filter-apply').click();
  await settled();
  assert((await tRowCount()) === 1, 'filter nonaktif 1 baris');
  assert(((await page.locator('tbody[data-testid="tenant-rows"]').textContent()) || '').indexOf('Kopsis Mawar') >= 0, 'baris nonaktif benar');
  await page.getByTestId('tenant-filter-reset').click();
  await settled();
  assert((await tRowCount()) === 3, 'reset filter kembali 3');

  step('5. tenant: bulk nonaktif lalu aktif');
  await page.getByTestId('tenant-select-all').check();
  await settled();
  assert(((await page.getByTestId('tenant-selected-count').textContent()) || '').trim() === '3', 'pilih semua 3');
  await page.getByTestId('tenant-bulk-deactivate').click();
  await waitToast('diubah menjadi nonaktif');
  await settled();
  assert(((await page.locator('tbody[data-testid="tenant-rows"]').textContent()) || '').indexOf('Aktif') < 0, 'semua badge nonaktif');
  await page.getByTestId('tenant-select-all').check();
  await settled();
  await page.getByTestId('tenant-bulk-activate').click();
  await waitToast('diubah menjadi aktif');
  await settled();

  step('6. tenant: sortir nama + ubah');
  await page.getByTestId('tenant-sort-nama').click();
  await settled();
  assert(((await page.getByTestId('tenant-sort-nama-ind').textContent()) || '') === '▲', 'sortir nama naik');
  const firstNama = ((await page.locator('tbody[data-testid="tenant-rows"] tr').first().textContent()) || '');
  assert(firstNama.indexOf('Kopsis Mawar') >= 0, 'baris pertama Kopsis Mawar');
  await page.getByTestId('tenant-edit').first().click();
  await page.getByTestId('tenant-form').waitFor({ state: 'visible', timeout: 15000 });
  await page.getByTestId('tenant-nama').fill('Kopsis Mawar 2');
  await page.getByTestId('tenant-form-submit').click();
  await page.getByTestId('tenant-modal').waitFor({ state: 'detached', timeout: 15000 });
  await settled();
  assert((await page.locator('tbody[data-testid="tenant-rows"]').getByText('Kopsis Mawar 2').count()) >= 1, 'ubah nama tersimpan');
  await page.getByTestId('tenant-sort-reset').click();
  await settled();
  assert(((await page.getByTestId('tenant-sort-nama-ind').textContent()) || '') === '', 'reset sorting');

  step('7. tenant: halaman detail + 404');
  await page.getByTestId('tenant-detail').first().click();
  await page.getByTestId('page-tenant-detail').waitFor({ state: 'visible', timeout: 15000 });
  await settled(2000);
  assert(page.url().indexOf('/provider/tenant/') >= 0, 'navigasi ke halaman detail: ' + page.url());
  assert(((await page.getByTestId('tenant-detail-list').textContent()) || '').indexOf('Toko Berkah') >= 0, 'detail memuat nama Toko Berkah');
  await page.goto(`${BASE}/provider/tenant/tidak-ada-xyz`);
  await settled(2000);
  assert(((await page.locator('body').textContent()) || '').indexOf('Tenant tidak ditemukan') >= 0, 'detail 404 ramah');
  await page.goto(`${BASE}/provider/tenant`);
  await page.getByTestId('tenant-rows').waitFor();
  await settled(3000);

  step('8. tenant: ekspor + impor + bulk hapus');
  const dl = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.getByTestId('tenant-export-btn').click()
  ]);
  const dlPath = path.join(OUT, 'tenant-export.xlsx');
  await dl[0].saveAs(dlPath);
  assert(fs.statSync(dlPath).size > 0, 'ekspor terunduh');
  const wtpl = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.getByTestId('tenant-template-btn').click()
  ]);
  const wtplPath = path.join(OUT, 'template-tenant.xlsx');
  await wtpl[0].saveAs(wtplPath);
  assert(fs.statSync(wtplPath).size > 0, 'template terunduh');
  const twb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(twb, XLSX.utils.aoa_to_sheet([
    ['Nama', 'Email', 'Password', 'Deskripsi', 'Status'],
    ['Impor Baru', 'baru@contoh.id', 'sandi-baru-123', 'Dari impor', 'aktif'],
    ['Duplikat', 'kopsis@contoh.id', 'sandi-x-12345', 'Duplikat email', 'aktif']
  ]), 'Tenant');
  const tbuf = XLSX.write(twb, { type: 'buffer', bookType: 'xlsx' });
  await page.getByTestId('tenant-import-file').setInputFiles({ name: 'timpor.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: tbuf });
  await waitToast('Impor selesai');
  await settled();
  assert((await tRowCount()) === 4, 'impor 1 valid 1 dilewati');
  await page.getByTestId('tenant-select-all').check();
  await settled();
  assert(((await page.getByTestId('tenant-selected-count').textContent()) || '').trim() === '4', 'pilih semua 4');
  await page.getByTestId('tenant-bulk-delete').click();
  await page.getByTestId('tenant-delete-modal').waitFor({ state: 'visible', timeout: 15000 });
  await page.getByTestId('tenant-delete-confirm').click();
  await settled();
  assert((await tRowCount()) === 0, 'bulk hapus tersisa 0');
  assert(((await page.locator('tbody[data-testid="tenant-rows"]').textContent()) || '').indexOf('Belum ada tenant') >= 0, 'teks kosong tampil');

  step('9. konfig: seed + sensor rahasia');
  await page.goto(`${BASE}/provider/konfigurasi`);
  await page.getByTestId('konfig-rows').waitFor();
  await settled(3000);
  assert((await kRowCount()) === 4, 'mulai 4 baris seed');
  const kText = (await page.locator('tbody[data-testid="konfig-rows"]').textContent()) || '';
  assert(kText.indexOf('midtrans-server-key') >= 0, 'seed midtrans tampil');
  assert(kText.indexOf('••••••••') >= 0, 'kredensial disensor di tabel');
  assert(kText.indexOf('SB-Mid-test-123') < 0, 'nilai asli tidak bocor ke tabel');

  step('10. konfig: tambah invalid + angka invalid');
  await openModal('konfig-add', 'konfig-form');
  await page.getByTestId('konfig-form-submit').click();
  await page.getByTestId('konfig-form-errors').waitFor({ state: 'visible', timeout: 15000 });
  assert(await page.getByTestId('konfig-form-errors').isVisible(), 'ringkasan error tampil');
  assert(await page.getByTestId('konfig-kode-error').isVisible(), 'error inline kode tampil');
  assert(await page.getByTestId('konfig-nama-error').isVisible(), 'error inline nama tampil');
  assert(await page.getByTestId('konfig-value-error').isVisible(), 'error inline nilai tampil');
  await page.getByTestId('konfig-kode').fill('batas-harian');
  await page.getByTestId('konfig-nama').fill('Batas Harian');
  await page.getByTestId('konfig-type-input').selectOption('number');
  await page.getByTestId('konfig-value-number').fill('bukan-angka');
  await page.getByTestId('konfig-form-submit').click();
  await settled();
  assert(await page.getByTestId('konfig-value-error').isVisible(), 'angka invalid ditolak');
  await page.getByTestId('konfig-value-number').fill('100');
  await page.getByTestId('konfig-deskripsi').fill('Batas harian transaksi');
  await page.getByTestId('konfig-form-submit').click();
  await page.getByTestId('konfig-modal').waitFor({ state: 'detached', timeout: 15000 });
  await settled();
  assert((await kRowCount()) === 5, 'tambah angka valid');

  step('11. konfig: tambah kredensial tersensor');
  await openModal('konfig-add', 'konfig-form');
  await page.getByTestId('konfig-kode').fill('doku-client-id');
  await page.getByTestId('konfig-nama').fill('DOKU Client ID');
  await page.getByTestId('konfig-type-input').selectOption('kredensial');
  await page.getByTestId('konfig-value-secret').fill('DK-Rahasia-999');
  assert((await page.getByTestId('konfig-value-secret').getAttribute('type')) === 'password', 'secret tersensor');
  await page.getByTestId('konfig-show').click();
  assert((await page.getByTestId('konfig-value-secret').getAttribute('type')) === 'text', 'show secret tampil');
  await page.getByTestId('konfig-form-submit').click();
  await page.getByTestId('konfig-modal').waitFor({ state: 'detached', timeout: 15000 });
  await settled();
  const kText2 = (await page.locator('tbody[data-testid="konfig-rows"]').textContent()) || '';
  assert(kText2.indexOf('DK-Rahasia-999') < 0, 'secret baru tidak bocor ke tabel');

  step('12. konfig: filter tipe + sortir + ubah + detail');
  await page.getByTestId('konfig-type').selectOption('kredensial');
  await page.getByTestId('konfig-filter-apply').click();
  await settled();
  assert((await kRowCount()) === 2, 'filter kredensial 2 baris');
  await page.getByTestId('konfig-filter-reset').click();
  await settled();
  assert((await kRowCount()) === 6, 'reset filter kembali 6');
  await page.getByTestId('konfig-sort-kode').click();
  await settled();
  assert(((await page.getByTestId('konfig-sort-kode-ind').textContent()) || '') === '▲', 'sortir kode naik');
  await page.getByTestId('konfig-edit').first().click();
  await page.getByTestId('konfig-form').waitFor({ state: 'visible', timeout: 15000 });
  await page.getByTestId('konfig-nama').fill('Batas Harian 2');
  await page.getByTestId('konfig-form-submit').click();
  await page.getByTestId('konfig-modal').waitFor({ state: 'detached', timeout: 15000 });
  await settled();
  assert((await page.locator('tbody[data-testid="konfig-rows"]').getByText('Batas Harian 2').count()) >= 1, 'ubah nama tersimpan');
  await page.getByTestId('konfig-detail').first().click();
  await page.getByTestId('konfig-detail-body').waitFor({ state: 'visible', timeout: 15000 });
  assert(((await page.getByTestId('konfig-detail-body').textContent()) || '').indexOf('Batas Harian 2') >= 0, 'modal detail tampil');
  await page.getByTestId('konfig-detail-close').click();
  await page.getByTestId('konfig-detail-modal').waitFor({ state: 'detached', timeout: 15000 });

  step('13. konfig: ekspor + impor + bulk hapus');
  const kdl = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.getByTestId('konfig-export-btn').click()
  ]);
  const kdlPath = path.join(OUT, 'konfig-export.xlsx');
  await kdl[0].saveAs(kdlPath);
  assert(fs.statSync(kdlPath).size > 0, 'ekspor terunduh');
  const kwb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(kwb, XLSX.utils.aoa_to_sheet([
    ['Kode', 'Nama', 'Tipe', 'Nilai', 'Deskripsi'],
    ['webhook-bis', 'Webhook BIS', 'text', 'https://bis.contoh.id/w', 'Penerus BIS'],
    ['duplikat-kode', 'Duplikat', 'text', 'https://x.contoh.id', 'Duplikat'],
    ['duplikat-kode', 'Duplikat 2', 'text', 'https://y.contoh.id', 'Duplikat']
  ]), 'Konfigurasi');
  const kbuf = XLSX.write(kwb, { type: 'buffer', bookType: 'xlsx' });
  await page.getByTestId('konfig-import-file').setInputFiles({ name: 'kimpor.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: kbuf });
  await waitToast('Impor selesai');
  await settled();
  assert((await kRowCount()) === 8, 'impor 2 valid 1 dilewati');
  await page.getByTestId('konfig-select-all').check();
  await settled();
  assert(((await page.getByTestId('konfig-selected-count').textContent()) || '').trim() === '8', 'pilih semua 8');
  await page.getByTestId('konfig-bulk-delete').click();
  await page.getByTestId('konfig-delete-modal').waitFor({ state: 'visible', timeout: 15000 });
  await page.getByTestId('konfig-delete-confirm').click();
  await settled();
  assert((await kRowCount()) === 0, 'bulk hapus tersisa 0');

  step('14. dashboard provider + dark mode');
  await page.goto(`${BASE}/provider/dashboard`);
  await page.getByTestId('page-provider-dashboard').waitFor();
  await settled(2000);
  assert(((await page.locator('body').textContent()) || '').indexOf('Tenant terdaftar') >= 0, 'widget tenant tampil');
  await page.goto(`${BASE}/provider/beranda`);
  await page.getByTestId('page-provider-home').waitFor();
  for (let i = 0; i < 8; i++) {
    await page.getByTestId('admin-user').click();
    try { await page.getByTestId('admin-user-menu').waitFor({ state: 'visible', timeout: 2000 }); break; }
    catch { if (i === 7) throw new Error('menu user tidak terbuka'); }
  }
  assert(((await page.getByTestId('admin-user-menu').textContent()) || '').indexOf('Mode gelap') >= 0, 'dropdown user tampil');
  assert(((await page.getByTestId('admin-user-menu').textContent()) || '').indexOf('Ubah profil') >= 0, 'tautan profil tampil');
  const darkNow = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.getByTestId('admin-theme').click();
  await page.waitForFunction((d) => document.documentElement.classList.contains('dark') !== d, darkNow, { timeout: 10000 });
  const darkAfter = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  assert(darkAfter !== darkNow, 'toggle tema berfungsi');
  if (darkAfter) {
    await page.getByTestId('admin-user').click();
    await page.getByTestId('admin-user-menu').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByTestId('admin-theme').click();
    await settled(500);
  }

  // 404 dari probe detail tenant yang memang tidak ada (disengaja, seperti filter 401 di login.e2e)
  const realErrors = consoleErrors.filter((e) => e.indexOf('404') < 0);
  console.log(`\nconsole errors: ${consoleErrors.length} (diabaikan 404 disengaja: ${consoleErrors.length - realErrors.length})`);
  consoleErrors.forEach((e) => console.log(`  [console] ${e}`));
  if (realErrors.length > 0) failures++;

  await browser.close();
  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
