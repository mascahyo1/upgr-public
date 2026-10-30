// E2E paritas layout vs aplikasi referensi (Express lama :3000 vs Nuxt :3200).
// Aturan ketat: chrome layout (sidebar, header, dropdown user) HARUS SAMA PERSIS.
// Jalankan: node tests/e2e/parity.e2e.cjs  (kedua server harus hidup)
const { chromium } = require('playwright');

const OLD = 'http://127.0.0.1:3000';
const NEW = 'http://127.0.0.1:3200';
const PATHS = [
  '/tenant/beranda',
  '/tenant/dashboard',
  '/tenant/payment-gateway-credential',
  '/tenant/api',
  // '/tenant/profil' sengaja tidak ikut: butuh login (redirect /tenant/login), chrome-nya sama dengan halaman di atas, fungsionalnya diuji tenant.e2e saat login
  '/provider/beranda',
  '/provider/dashboard',
  '/provider/tenant',
  '/provider/konfigurasi'
];

let failures = 0;
function step(name) { console.log(`\n[STEP] ${name}`); }
function same(label, a, b) {
  const sa = JSON.stringify(a);
  const sb = JSON.stringify(b);
  if (sa === sb) { console.log(`  PASS: ${label}`); return; }
  failures++;
  console.log(`  FAIL: ${label}`);
  console.log(`    lama : ${sa}`);
  console.log(`    baru : ${sb}`);
}
function settled(ms) { return new Promise((r) => setTimeout(r, ms || 1500)); }

async function chrome(page, base, path) {
  await page.goto(base + path);
  await page.getByTestId('admin-sidebar').waitFor({ state: 'visible', timeout: 15000 });
  await settled(2500);
  const sb = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('#admin-sidebar nav a')).map((a) => ({
      testid: a.getAttribute('data-testid'),
      href: a.getAttribute('href'),
      text: (a.textContent || '').trim().replace(/\s+/g, ' '),
      icon: ((a.querySelector('i') || {}).className || '').split(' ').filter((c) => c.indexOf('fa-') === 0).sort().join(' ')
    }));
    const brandEl = document.querySelector('#admin-sidebar .menu-label');
    const situs = document.querySelector('#admin-sidebar a[href="/"]');
    const box = document.querySelector('#admin-sidebar').getBoundingClientRect();
    return {
      links,
      brand: brandEl ? brandEl.textContent.trim() : null,
      situs: situs ? { href: situs.getAttribute('href'), text: situs.textContent.trim().replace(/\s+/g, ' ') } : null,
      sidebarVisible: box.width > 200,
      backdropHidden: document.querySelector('#admin-backdrop').classList.contains('hidden'),
      toggle: !!document.querySelector('[data-testid="admin-toggle"]'),
      userBtn: !!document.querySelector('[data-testid="admin-user"]')
    }});
  await page.getByTestId('admin-user').click();
  await page.getByTestId('admin-user-menu').waitFor({ state: 'visible', timeout: 15000 });
  await settled(300);
  sb.userMenu = await page.evaluate(() => Array.from(document.querySelectorAll('#admin-user-menu [role="menuitem"]')).map((el) => ({
    tag: el.tagName.toLowerCase(),
    testid: el.getAttribute('data-testid'),
    href: el.getAttribute('href'),
    text: (el.textContent || '').trim().replace(/\s+/g, ' ')
  })));
  await page.keyboard.press('Escape');
  return sb;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

  step('0. referensi hidup');
  const oldOk = await (await fetch(OLD + '/tenant/beranda')).status;
  const newOk = await (await fetch(NEW + '/tenant/beranda')).status;
  same('referensi :3000 hidup', oldOk, 200);
  same('nuxt :3200 hidup', newOk, 200);
  consoleErrors.length = 0;

  for (const path of PATHS) {
    step('paritas ' + path);
    const a = await chrome(page, OLD, path);
    const b = await chrome(page, NEW, path);
    same('sidebar links', a.links, b.links);
    same('brand', a.brand, b.brand);
    same('lihat situs', a.situs, b.situs);
    same('sidebar tampil desktop', a.sidebarVisible, b.sidebarVisible);
    same('backdrop tersembunyi', a.backdropHidden, b.backdropHidden);
    same('tombol toggle ada', a.toggle, b.toggle);
    same('tombol user ada', a.userBtn, b.userBtn);
    same('isi dropdown user', a.userMenu, b.userMenu);
  }

  console.log(`\nconsole errors (baru): ${consoleErrors.length}`);
  consoleErrors.forEach((e) => console.log(`  [console] ${e}`));
  if (consoleErrors.length > 0) failures++;

  await browser.close();
  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => { console.error('FATAL:', err); process.exit(1); });
