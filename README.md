# UPGR — Unified Payment Gateway Router

**UPGR = Unified Payment Gateway Router** — "tukang pos" pembayaran online.

Bayangkan sebuah sekolah punya 3 urusan bayar-membayar: SPP, kantin, dan
koperasi. Semuanya menerima transfer/QRIS lewat **satu rekening Midtrans
yang sama**. Masalahnya: saat ada uang masuk, sekolah tidak tahu itu
bayaran untuk urusan yang mana.

UPGR menyelesaikan itu. Setiap tagihan diberi kode berawalan beda
(mis. `SPP-...`, `Kantin-...`, `Kop-...`). Begitu Midtrans mengabari
"ada pembayaran lunas", UPGR membaca kode itu lalu **meneruskan kabar ke
aplikasi yang tepat** — kabar `SPP-...` ke aplikasi keuangan sekolah,
`Kantin-...` ke aplikasi kasir kantin. Semua tercatat: siapa bayar, kapan,
terkirim ke mana.

```
Murid bayar ──▶ Midtrans ──▶ UPGR ──▶ Keuangan (SPP-...) / Kantin (Kantin-...) / Koperasi (Kop-...)
```

Kenapa tidak langsung Midtrans ke aplikasi? Karena Midtrans hanya punya
**satu alamat kabar** (satu notification URL) per rekening. Tanpa UPGR,
semua kabar lunas menumpuk di satu tempat dan tiap aplikasi harus
berebut memilah sendiri. UPGR yang memilahkan — tiap aplikasi cukup
menunggu kabar yang memang untuknya.

Cocok untuk: sekolah, koperasi, UMKM, atau siapa pun yang menerima
pembayaran online dari banyak keperluan tapi ingin pencatatannya
terpisah rapi per aplikasi.

## Syarat (apa saja yang perlu disiapkan)

1. **Komputer server** — laptop/PC biasa cukup untuk coba-coba; untuk
   dipakai betulan, sewa VPS kecil (RAM 2 GB cukup).
2. **Node.js versi 20 ke atas** — mesin yang menjalankan UPGR.
3. **Database MySQL** — lemari arsip tempat UPGR menyimpan catatan
   (tabel dibuat otomatis, tidak perlu dirancang manual).
4. **Akun Midtrans** — daftar gratis di midtrans.com; yang dipakai cukup
   *Server Key* dari dashboard (ada versi sandbox untuk latihan,
   tidak pakai uang asli).
5. **Alamat internet (domain)** — hanya untuk produksi, mis. agar Midtrans
   bisa mengabari UPGR. Untuk latihan di laptop sendiri tidak perlu.

Yang **tidak** perlu: aplikasi lain tidak perlu diubah — mereka hanya
menerima kabar seperti biasa dari UPGR.

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
