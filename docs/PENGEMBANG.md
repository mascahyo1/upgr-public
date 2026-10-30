# Panduan Pengembang UPGR

Untuk yang mau mengubah kode, menjalankan tes, atau deploy sendiri.

## Isi `.env`

```ini
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=upgr
MYSQL_PASSWORD=isi-password-kuat
MYSQL_DB=upgr
TURNSTILE_SECRET_KEY=        # rahasia widget Cloudflare Turnstile
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
ALLOW_TEST_API=0             # JANGAN =1 di production
```

Skema database dibuat otomatis saat aplikasi pertama kali query (`ensureSchema`).

## Akun uji (dev saja, `ALLOW_TEST_API=1`)

```bash
curl -X POST http://localhost:3000/api_web/_test/seed-user
```

- Tenant: `tenant@example.com` / `sandi-tenant-123`
- E2E: `uji@example.com` / `sandi-uji-123`

## Perintah

```bash
npx vue-tsc --noEmit   # cek tipe
npm run build          # build production
node .output/server/index.mjs
```

## E2E (butuh Chromium Playwright)

```bash
E2E_PORT=3000 node tests/e2e/simulator.e2e.cjs
E2E_PORT=3000 node tests/e2e/notify.e2e.cjs
E2E_PORT=3000 node tests/e2e/tagihan.e2e.cjs
E2E_PORT=3000 node tests/e2e/logdetail.e2e.cjs
```

## Deploy (contoh pm2)

```bash
npm run build
pm2 start .output/server/index.mjs --name upgr
pm2 save
```

## Koleksi API

- `docs/hoppscotch/` — generator + skrip terapkan ke tim Hoppscotch.
  ID tim/koleksi/environment dibaca dari env: `HOPP_TEAM_ID`,
  `HOPP_COL_PUBLIK`, `HOPP_COL_SIM`, `HOPP_ENV_ID`, `HOPP_PARENT_ID`.
- `docs/postman/` — `build-collection.cjs` + hasil `upgr.postman_collection.json`.
