# UPGR — Unified Payment Gateway Router

**UPGR = Unified Payment Gateway Router**: satu pintu yang menyatukan
banyak gerbang pembayaran dan meneruskan tiap transaksi ke aplikasi yang tepat.

Punya beberapa aplikasi (toko, kasir, keuangan) tapi cuma satu akun Midtrans?

Punya beberapa aplikasi (toko, kasir, keuangan) tapi cuma satu akun Midtrans?
UPGR duduk di tengah: pelanggan bayar seperti biasa, lalu UPGR otomatis
meneruskan kabar pembayaran ke aplikasi yang tepat.

```
Pelanggan bayar ──▶ Midtrans ──▶ UPGR ──▶ Toko / Kasir / Keuangan
```

Cocok untuk: sekolah, koperasi, UMKM, atau siapa pun yang menerima
pembayaran online dan ingin pencatatannya rapi per aplikasi.

## Yang bisa dilakukan

- **Terima bayar** lewat QRIS dan halaman bayar Snap (transfer bank, e-wallet, kartu).
- **Atur tujuan otomatis**: kode transaksi berawalan `INV` diteruskan ke aplikasi A,
  berawalan `SPP` ke aplikasi B — tanpa campur aduk.
- **Lihat semua catatan**: siapa bayar, kapan, lewat apa, terkirim ke mana.
- **Coba-coba gratis**: ada simulator penampung notifikasi, jadi tidak perlu
  bayar betulan saat latihan.

## Cara pakai (5 menit)

1. Install [Node.js](https://nodejs.org) versi 20 ke atas, dan siapkan database MySQL kosong.
2. Unduh kode ini, lalu di foldernya jalankan:
   ```bash
   npm install
   ```
3. Salin `cp .env.example .env`, buka file `.env`, isi nama database dan password MySQL.
4. Jalankan:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:3000` di browser. Selesai.

Langkah berikutnya (buat akun, sambungkan Midtrans, pasang webhook) ada di
halaman bantuan dalam aplikasi.

## Butuh bantuan teknis?

File [PRODUCTION-READY.md](PRODUCTION-READY.md) berisi bukti uji lengkap.
Pengembang: lihat panduan kontribusi di [docs/PENGEMBANG.md](docs/PENGEMBANG.md).

## Lisensi

MIT — bebas dipakai dan diubah, lihat [LICENSE](LICENSE).
