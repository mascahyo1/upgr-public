# UPGR — Production Ready

Status ini dicatat setelah verifikasi end-to-end di production
(`https://upgr.example.com`), commit `5ee3a6d`.

## Terbukti live di production

- Invoice Snap: `test-snap-1` Rp1.000 lunas (`settlement`, QRIS via Snap).
- Notify Midtrans production masuk, signature valid.
- Router meneruskan ke webhook prefix `test-` (`terkirim`, HTTP 201).
- Simulator menangkap penerusan (`?app=prod`).
- Invoice sandbox 4x lunas: `aaa` tanpa router log; `AKT-1`/`WHL-1`/`INV-1`
  tepat ke webhook prefix masing-masing.

## Fitur

- Invoice: GoPay QRIS dinamis + Snap (`token`/`redirect_url`), `expiry_menit`
  opsional, items + customer nullable diteruskan ke Midtrans.
- Router webhook: filter prefix case-sensitive (prefix kosong = semua order),
  info prefix di halaman kredensial.
- Log: IP + User Agent + request/response header + body di log API, log
  provider, log router, dan simulator (ada halaman detail per baris).
- Simulator webhook per tenant (pengganti webhook.site).
- Auth: middleware sesi per portal (`auth-tenant.global`,
  `auth-provider.global`); tanpa sesi redirect ke halaman login.
- Koleksi Hoppscotch tim `contoh`: per portal + simulator + invoice,
  lengkap dengan contoh respons tersimpan.

## Verifikasi terakhir

- `vue-tsc --noEmit` exit 0, `npm run build` sukses.
- E2E `SEMUA PASS`: simulator, notify (+prefix), tagihan (+snap),
  logdetail (headless + headed, screenshot per langkah).
- Kunci API uji sudah dihapus dari database production.
