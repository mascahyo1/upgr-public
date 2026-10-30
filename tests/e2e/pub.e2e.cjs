// E2E halaman publik UPGR Nuxt: landing + nav responsif + tema
// Jalankan: node tests/e2e/pub.e2e.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

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
  const browser = await chromium.launch();

  step('1. landing tidak redirect');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const consoleErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
    await page.goto(`${BASE}/`);
    await settled(3000);
    assert(!page.url().includes('/tenant/beranda'), 'root tidak redirect');
    assert(((await page.locator('h1').first().textContent()) || '').indexOf('Satu webhook gateway') >= 0, 'hero tampil');
    assert(await page.getByTestId('nav-desktop-home').isVisible(), 'nav Beranda terlihat di 1280');
    assert(await page.getByTestId('nav-login-tenant').isVisible(), 'login tenant terlihat di 1280');
    assert(await page.getByTestId('nav-login-provider').isVisible(), 'login provider terlihat di 1280');
    const disp = await page.getByTestId('nav-toggle').evaluate((el) => getComputedStyle(el).display);
    assert(disp === 'none', 'toggle tersembunyi di 1280');
    await page.screenshot({ path: path.join(OUT, 'area-pub-landing.png') });
    if (consoleErrors.length > 0) { failures++; console.log('  FAIL: console errors landing: ' + consoleErrors.join(' | ')); }
    else console.log('  PASS: console bersih landing');
    await page.close();
  }

  step('2. drawer di 320px');
  {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
    const consoleErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
    await page.goto(`${BASE}/`);
    await settled(3000);
    await page.getByTestId('nav-toggle').waitFor({ state: 'visible', timeout: 15000 });
    assert(await page.getByTestId('nav-toggle').isVisible(), 'toggle terlihat di 320');
    assert(!(await page.getByTestId('nav-login-tenant').isVisible()), 'login tenant tersembunyi dari bar');
    await page.getByTestId('nav-theme').click();
    await page.screenshot({ path: path.join(OUT, 'area-pub-mobile.png') });
    await page.getByTestId('nav-toggle').click();
    await page.waitForFunction(() => !!document.querySelector('[data-testid="nav-drawer"]'));
    assert(await page.getByTestId('nav-backdrop').isVisible(), 'drawer terbuka: backdrop terlihat');
    await page.getByTestId('nav-drawer-tentang-kami').click();
    await page.waitForURL('**/tentang-kami', { timeout: 15000 });
    assert(page.url().indexOf('/tentang-kami') >= 0, 'drawer navigasi ke tentang-kami');
    if (consoleErrors.length > 0) { failures++; console.log('  FAIL: console errors mobile: ' + consoleErrors.join(' | ')); }
    else console.log('  PASS: console bersih mobile');
    await page.close();
  }

  step('3. halaman statis + tema');
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const consoleErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
    await page.goto(`${BASE}/tentang-kami`);
    await settled(2500);
    assert(((await page.locator('h1').first().textContent()) || '').indexOf('Tentang Kami') >= 0, 'tentang-kami tampil');
    await page.goto(`${BASE}/syarat-ketentuan`);
    await settled(2500);
    assert(((await page.locator('h1').first().textContent()) || '').indexOf('Syarat') >= 0, 'syarat tampil');
    await page.goto(`${BASE}/kebijakan-privasi`);
    await settled(2500);
    assert(((await page.locator('h1').first().textContent()) || '').indexOf('Privasi') >= 0, 'privasi tampil');
    await page.goto(`${BASE}/hubungi-kami`);
    await settled(2500);
    assert(((await page.locator('h1').first().textContent()) || '').indexOf('Hubungi') >= 0, 'kontak tampil');
    const before = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await page.getByTestId('nav-theme').click();
    await settled(500);
    const after = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    assert(before !== after, 'toggle tema mengubah class dark');
    if (consoleErrors.length > 0) { failures++; console.log('  FAIL: console errors statis: ' + consoleErrors.join(' | ')); }
    else console.log('  PASS: console bersih statis');
    await page.close();
  }

  await browser.close();
  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
