// E2E login UPGR Nuxt (widget Turnstile kunci uji: lolos otomatis)
// Jalankan: node tests/e2e/login.e2e.cjs
const { chromium } = require('playwright');

const PORT = 3200;
const BASE = `http://127.0.0.1:${PORT}`;

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

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {})
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

(async () => {
  step('0. reset + seed user');
  await post('/api_web/_test/reset', {});
  const seed = await post('/api_web/_test/seed-user', {});
  assert(seed.status === 200, 'seed user uji');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  // 401 dari percobaan login salah (step 3) adalah hasil yang disengaja, bukan bug.
  page.on('console', (m) => { if (m.type() === 'error' && m.text().indexOf('status of 401') < 0) consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  async function openModalRetry(btnId, formId) {
    for (let i = 0; i < 8; i++) {
      await page.getByTestId(btnId).first().click();
      try { await page.getByTestId(formId).waitFor({ state: 'visible', timeout: 2000 }); return; }
      catch {}
    }
  }
  void openModalRetry;

  step('1. halaman login tenant tampil (tidak 404)');
  await page.goto(`${BASE}/tenant/login`);
  await page.getByTestId('login-form').waitFor({ state: 'visible', timeout: 15000 });
  await settled(3000);
  assert(await page.getByTestId('login-email').isVisible(), 'form email tampil');
  let captchaOk = false;
  try {
    await page.getByTestId('login-captcha').waitFor({ state: 'visible', timeout: 30000 });
    captchaOk = await page.getByTestId('login-captcha').isVisible();
  } catch {}
  assert(captchaOk, 'widget captcha tampil');

  step('2. validasi kosong');
  await page.getByTestId('login-submit').click();
  await settled();
  assert(await page.getByTestId('login-email-error').isVisible(), 'error email tampil');

  step('3. password salah');
  await page.getByTestId('login-email').fill('uji@example.com');
  await page.getByTestId('login-password').fill('salah');
  await page.waitForFunction(() => (document.querySelector('[data-testid="login-captcha-token"]') || {}).value, { timeout: 30000 }).catch(() => {});
  await page.getByTestId('login-submit').click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-testid="toast"]')).some((el) => el.textContent.indexOf('salah') >= 0), { timeout: 15000 });
  assert(true, 'toast kredensial salah tampil');

  step('4. login benar + redirect beranda');
  await page.getByTestId('login-password').fill('sandi-uji-123');
  await page.waitForFunction(() => (document.querySelector('[data-testid="login-captcha-token"]') || {}).value, { timeout: 30000 }).catch(() => {});
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/tenant/beranda', { timeout: 30000 });
  assert(page.url().indexOf('/tenant/beranda') >= 0, 'redirect ke beranda');
  const me = await page.evaluate(() => fetch('/api_web/auth/me').then((r) => r.status));
  assert(me === 200, 'sesi cookie berlaku');

  step('5. halaman login provider + lupa password');
  await page.goto(`${BASE}/provider/login`);
  await page.getByTestId('login-form').waitFor({ state: 'visible', timeout: 15000 });
  assert(((await page.locator('h1').first().textContent()) || '').indexOf('Provider') >= 0, 'login provider tampil');
  await page.goto(`${BASE}/tenant/lupa-password`);
  await settled();
  assert(((await page.locator('h1').first().textContent()) || '').indexOf('Lupa') >= 0, 'lupa password tenant tampil');
  await page.goto(`${BASE}/provider/lupa-password`);
  await settled();
  assert(((await page.locator('h1').first().textContent()) || '').indexOf('Lupa') >= 0, 'lupa password provider tampil');

  console.log(`\nconsole errors: ${consoleErrors.length}`);
  consoleErrors.forEach((e) => console.log(`  [console] ${e}`));
  if (consoleErrors.length > 0) failures++;

  await browser.close();
  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
