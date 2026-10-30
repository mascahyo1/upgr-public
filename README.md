# UPGR — Payment Gateway Router (Midtrans)

Self-hosted payment router: beberapa aplikasi berbagi satu akun Midtrans.
Satu notification URL, lalu UPGR meneruskan notifikasi ke webhook tiap aplikasi
berdasarkan **prefix kode transaksi** (case-sensitive), lengkap dengan log
IP/User-Agent/header/body dan simulator webhook built-in.

- Portal **tenant**: kredensial gateway, webhook + prefix, log API/provider/router, simulator webhook, profil.
- Portal **provider**: tenant, konfigurasi, kredensial.
- Invoice stateless: GoPay QRIS dinamis (`gopay_qris_dinamis`) + halaman Snap (`snap`), cek status.
- Notifikasi: `POST /api_external/publik/notify/midtrans/[credId]` selalu 200, verifikasi signature SHA512.
- Simulator: `POST /api_external/publik/simulator/terima/[tenantId]` — penampung gratis per tenant (pengganti webhook.site).
- Koleksi Hoppscotch + Postman dengan contoh respons tersimpan; E2E Playwright.

## Syarat

- Node.js 20+ dan npm
- MySQL 8+ (database kosong, mis. `upgr`)
- (Opsional) widget Cloudflare Turnstile untuk captcha login

## Install

```bash
git clone https://github.com/<akun-kamu>/upgr-nuxt.git
cd upgr-nuxt
cp .env.example .env   # lalu isi kredensial MySQL + Turnstile
npm install
```

Isi `.env` (lihat `.env.example`):

```ini
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=upgr
MYSQL_PASSWORD=isi-password-kuat
MYSQL_DB=upgr
TURNSTILE_SECRET_KEY=
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
ALLOW_TEST_API=0
```

Skema database dibuat otomatis saat aplikasi pertama kali query (`ensureSchema`),
jadi cukup siapkan database kosong.

## Jalan lokal

```bash
npm run dev    # http://localhost:3000
```

Akun uji (hanya bila `ALLOW_TEST_API=1`, jangan di production):

```bash
curl -X POST http://localhost:3000/api_web/_test/seed-user
```

- Tenant: `tenant@example.com` / `sandi-tenant-123`
- E2E: `uji@example.com` / `sandi-uji-123`

## Production

```bash
npm run build
node .output/server/index.mjs   # atau via pm2
```

Contoh dengan pm2:

```bash
pm2 start .output/server/index.mjs --name upgr
pm2 save
```

## Uji

```bash
npx vue-tsc --noEmit
E2E_PORT=3000 node tests/e2e/simulator.e2e.cjs
E2E_PORT=3000 node tests/e2e/notify.e2e.cjs
E2E_PORT=3000 node tests/e2e/tagihan.e2e.cjs
E2E_PORT=3000 node tests/e2e/logdetail.e2e.cjs   # butuh Chromium Playwright
```

## Lisensi

MIT — lihat [LICENSE](LICENSE).
