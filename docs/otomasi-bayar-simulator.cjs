// Otomasi bayar QRIS sandbox via Playwright (Node.js) — tanpa sentuh manual.
// Pakai: node docs/otomasi-bayar-simulator.cjs <qr-code-url>
// Alur: buka simulator QRIS Midtrans -> isi QR Code Image Url -> Scan QR -> issuer GoPay -> Pay.
// Butuh: npm i playwright-core + npx playwright install chromium (sekali).
// Verifikasi sesudahnya: cek status invoice (settlement) + webhook_logs (terkirim).
const { chromium } = require('playwright-core');
const QR = process.argv[2];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://simulator.sandbox.midtrans.com/v2/qris/index', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.fill('#qrCodeUrl', QR);
  await page.click('input[type="submit"]');
  await page.waitForTimeout(5000);
  await page.selectOption('#issuer', 'gopay').catch(() => {});
  await page.click('input[type="submit"]');
  await page.waitForTimeout(8000);
  console.log('AFTER PAY URL: ' + page.url());
  console.log('BODY: ' + (await page.locator('body').innerText()).slice(0, 1500));
  await browser.close();
})().catch((e) => { console.error('FATAL ' + e.message); process.exit(1); });
