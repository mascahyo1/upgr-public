// Generator koleksi Postman UPGR — dijalankan: node docs/postman/build-collection.cjs
// Menulis ulang docs/postman/upgr.postman_collection.json (selalu JSON valid).
const fs = require('fs');
const path = require('path');

const J = (o) => ({ method: 'POST', url: '{{baseUrl}}' + o.url, header: [{ key: 'Content-Type', value: 'application/json' }], body: { mode: 'raw', raw: JSON.stringify(o.body, null, 2) } });
const G = (url) => ({ method: 'GET', url: '{{baseUrl}}' + url });
const P = (url, body) => J({ url, body });
const PUT = (url, body) => ({ method: 'PUT', url: '{{baseUrl}}' + url, header: [{ key: 'Content-Type', value: 'application/json' }], body: { mode: 'raw', raw: JSON.stringify(body, null, 2) } });
const DEL = (url) => ({ method: 'DELETE', url: '{{baseUrl}}' + url });
const req = (name, request) => ({ name, request });

const collection = {
  info: {
    name: 'UPGR API',
    description: 'Koleksi API UPGR (Nuxt fullstack, MySQL). Variabel baseUrl menunjuk server target; koleksi ini dipakai lokal/dev/prod. Alur umum: 0 Uji (reset+seed, dev/lokal saja) > 1 Auth (login tenant/provider, wajib captcha Turnstile; dev memakai captcha dummy) > 2 Kredensial + 3 Webhook + 4 Log > 5 Tenant (API keys, profil) > 6 Provider (tenants, konfigurasi). Password/secret asli TIDAK disimpan di koleksi ini.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    { key: 'baseUrl', value: 'http://127.0.0.1:3200' },
    { key: 'credId', value: 'c-seed-sandbox' },
    { key: 'webhookId', value: '' },
    { key: 'apiKeyId', value: '' },
    { key: 'tenantId', value: 't-seed-contoh' },
    { key: 'konfigId', value: '' }
  ],
  item: [
    {
      name: '0. Uji (dev/lokal saja, butuh ALLOW_TEST_API=1)',
      item: [
        req('Reset + seed kredensial', P('/api_web/_test/reset', {})),
        req('Seed user uji', P('/api_web/_test/seed-user', {})),
        req('Ping uji-kirim', P('/api_web/_test/ping', {}))
      ]
    },
    {
      name: '1. Auth (throttle 10x/menit per IP, 429 + Retry-After)',
      item: [
        req('Login tenant', P('/api_web/auth/login', { area: 'tenant', email: 'uji@example.com', password: 'sandi-uji-123', captcha: 'dummy' })),
        req('Login provider', P('/api_web/auth/login', { area: 'provider', email: 'provider@contoh.id', password: 'ganti-dengan-asli', captcha: 'dummy' })),
        req('Profil saya (butuh cookie sesi)', G('/api_web/auth/me')),
        req('Logout', P('/api_web/auth/logout', {}))
      ]
    },
    {
      name: '2. Kredensial payment gateway',
      item: [
        req('List', G('/api_web/credentials')),
        req('Tambah', P('/api_web/credentials', { nama: 'Midtrans Sandbox', provider: 'midtrans', is_production: false, merchant_id: 'M-001', key: 'SB-Mid-client-001', secret: 'SB-Mid-secret-001', webhook_verify_token: 'tok-sb-001', deskripsi: 'Akun sandbox pengembang', status: 'aktif' })),
        req('Detail', G('/api_web/credentials/{{credId}}')),
        req('Ubah', PUT('/api_web/credentials/{{credId}}', { nama: 'Midtrans Sandbox 2', provider: 'midtrans', is_production: false, merchant_id: 'M-001', key: 'SB-Mid-client-001', secret: 'SB-Mid-secret-001', webhook_verify_token: 'tok-sb-001', deskripsi: 'Diubah', status: 'aktif' })),
        req('Test kredensial ke gateway (midtrans/xendit, tanpa buat transaksi)', P('/api_web/credentials/{{credId}}/test', {})),
        req('Hapus', DEL('/api_web/credentials/{{credId}}')),
        req('Bulk hapus', P('/api_web/credentials/bulk-delete', { ids: ['{{credId}}'] })),
        req('Bulk impor', P('/api_web/credentials/bulk-import', { rows: [{ nama: 'Xendit Test', provider: 'xendit', is_production: false, merchant_id: 'X-1', key: 'xnd-key-1', secret: 'xnd-secret-1', deskripsi: 'Dari impor', status: 'aktif' }] }))
      ]
    },
    {
      name: '3. Webhook per kredensial',
      item: [
        req('List', G('/api_web/credentials/{{credId}}/webhooks')),
        req('Tambah', P('/api_web/credentials/{{credId}}/webhooks', { nama: 'ERP Utama', url: 'https://erp.contoh.id/w/midtrans', prefix: 'INV', is_active: true, verify_token: 'tok-erp-1', deskripsi: 'Penerus ERP' })),
        req('Detail', G('/api_web/credentials/{{credId}}/webhooks/{{webhookId}}')),
        req('Ubah', PUT('/api_web/credentials/{{credId}}/webhooks/{{webhookId}}', { nama: 'ERP Utama 2', url: 'https://erp.contoh.id/w/midtrans', prefix: 'INV', is_active: true, verify_token: 'tok-erp-1', deskripsi: 'Diubah' })),
        req('Uji kirim (POST ke URL webhook + catat log)', P('/api_web/credentials/{{credId}}/webhooks/{{webhookId}}/test', {})),
        req('Hapus', DEL('/api_web/credentials/{{credId}}/webhooks/{{webhookId}}')),
        req('Bulk hapus', P('/api_web/credentials/{{credId}}/webhooks/bulk-delete', { ids: ['{{webhookId}}'] })),
        req('Bulk impor', P('/api_web/credentials/{{credId}}/webhooks/bulk-import', { rows: [{ nama: 'BIS Staging', url: 'https://bis.contoh.id/w', prefix: 'BIS', deskripsi: 'Dari impor' }] }))
      ]
    },
    {
      name: '4. Log webhook (maks 200/kredensial, tertua dibuang)',
      item: [
        req('List (filter: hasil, http, q, dari, sampai)', G('/api_web/credentials/{{credId}}/logs?hasil=gagal')),
        req('Uji kirim (catat manual)', P('/api_web/credentials/{{credId}}/logs', { webhook_id: '{{webhookId}}', event: 'Uji kirim', hasil: 'terkirim', http: 200, pesan: 'OK' }))
      ]
    },
    {
      name: '5. Tenant (API keys + profil, tenant_id default t-seed-contoh)',
      item: [
        req('API keys list', G('/api_web/tenant/api-keys')),
        req('API key tambah', P('/api_web/tenant/api-keys', { name: 'ERP Production', tenant_id: 't-seed-contoh', status: 'aktif', key: 'upgrk_erp_prod_001', secret: 'upgrs_erp_prod_001' })),
        req('API key detail', G('/api_web/tenant/api-keys/{{apiKeyId}}')),
        req('API key ubah', PUT('/api_web/tenant/api-keys/{{apiKeyId}}', { name: 'ERP Production 2', status: 'aktif', key: 'upgrk_erp_prod_001', secret: 'upgrs_erp_prod_001' })),
        req('API key hapus', DEL('/api_web/tenant/api-keys/{{apiKeyId}}')),
        req('API keys bulk hapus', P('/api_web/tenant/api-keys/bulk-delete', { ids: ['{{apiKeyId}}'] })),
        req('API keys bulk impor', P('/api_web/tenant/api-keys/bulk-import', { rows: [{ name: 'BIS Staging', tenant_id: 't-seed-contoh', status: 'aktif', key: 'upgrk_baru_001', secret: 'upgrs_baru_001' }] })),
        req('Profil lihat', G('/api_web/tenant/profil')),
        req('Profil simpan', PUT('/api_web/tenant/profil', { nama: 'PT Uji Coba', email: 'uji@contoh.id', deskripsi: 'Profil contoh' }))
      ]
    },
    {
      name: '6. Provider (tenants + konfigurasi)',
      item: [
        req('Tenants list', G('/api_web/provider/tenants')),
        req('Tenant tambah', P('/api_web/provider/tenants', { nama: 'Kopsis Mawar', email: 'kopsis@contoh.id', password: 'minimal8karakter', deskripsi: 'Koperasi sekolah', status: 'aktif' })),
        req('Tenant detail', G('/api_web/provider/tenants/{{tenantId}}')),
        req('Tenant ubah (password opsional)', PUT('/api_web/provider/tenants/{{tenantId}}', { nama: 'Kopsis Mawar 2', email: 'kopsis@contoh.id', deskripsi: 'Diubah', status: 'aktif' })),
        req('Tenant hapus', DEL('/api_web/provider/tenants/{{tenantId}}')),
        req('Tenants bulk status', P('/api_web/provider/tenants/bulk-status', { ids: ['{{tenantId}}'], status: 'nonaktif' })),
        req('Tenants bulk hapus', P('/api_web/provider/tenants/bulk-delete', { ids: ['{{tenantId}}'] })),
        req('Tenants bulk impor', P('/api_web/provider/tenants/bulk-import', { rows: [{ nama: 'Impor Baru', email: 'baru@contoh.id', password: 'minimal8karakter', deskripsi: 'Dari impor', status: 'aktif' }] })),
        req('Konfigurasi list', G('/api_web/provider/konfigurasi')),
        req('Konfigurasi tambah teks', P('/api_web/provider/konfigurasi', { kode: 'webhook-erp', nama: 'Webhook ERP RT/RW Net', type: 'text', value: 'https://erp.contoh.id/w/midtrans', deskripsi: 'Penerus webhook' })),
        req('Konfigurasi tambah rahasia (disensor di UI)', P('/api_web/provider/konfigurasi', { kode: 'midtrans-server-key', nama: 'Midtrans Server Key', type: 'kredensial', value: 'SB-Mid-xxx', deskripsi: 'Kunci server gateway' })),
        req('Konfigurasi detail', G('/api_web/provider/konfigurasi/{{konfigId}}')),
        req('Konfigurasi ubah', PUT('/api_web/provider/konfigurasi/{{konfigId}}', { kode: 'webhook-erp', nama: 'Webhook ERP 2', type: 'text', value: 'https://erp.contoh.id/w/midtrans', deskripsi: 'Diubah' })),
        req('Konfigurasi hapus', DEL('/api_web/provider/konfigurasi/{{konfigId}}')),
        req('Konfigurasi bulk hapus', P('/api_web/provider/konfigurasi/bulk-delete', { ids: ['{{konfigId}}'] })),
        req('Konfigurasi bulk impor', P('/api_web/provider/konfigurasi/bulk-import', { rows: [{ kode: 'retry-maksimal', nama: 'Retry Maksimal', type: 'number', value: '3', deskripsi: 'Percobaan ulang' }] }))
      ]
    }
  ]
};

const out = path.join(__dirname, 'upgr.postman_collection.json');
fs.writeFileSync(out, JSON.stringify(collection, null, 2) + '\n');
console.log('ditulis: ' + out);
