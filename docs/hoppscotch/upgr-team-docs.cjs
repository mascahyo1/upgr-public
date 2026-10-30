// Konten dokumentasi + contoh respons untuk koleksi Hoppscotch tim Hoppscotch (UPGR).
// Kunci = id TeamRequest. Contoh digabung (merge) ke request.responses, deskripsi ditulis
// ke request.description. Bentuk respons disalin dari perilaku server asli (dev 3200).
const CT = [{ key: 'content-type', value: 'application/json' }];
const errEnv = (url, code, data) => ({
  error: true, url: '<<baseUrl>>' + url, statusCode: code,
  statusMessage: 'Server Error', message: '', data
});

module.exports = {
  // ---------- Auth ----------
  'c222d18b5362e85c6a7e2b496': {
    description: 'Login portal tenant. Mengisi cookie sesi HttpOnly (upgr_session, 12 jam) untuk seluruh endpoint /api_web.\n\nBody: area ("tenant"), email, password, captcha (token Turnstile; di dev cukup "dummy").\nBatas: 10x/menit per IP -> 429 + header Retry-After. Salah kredensial -> 401 (pesan disamarkan).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT.concat([{ key: 'set-cookie', value: 'upgr_session=01a18759-b9ca-79a1-b14b-c8b60443da7d; Max-Age=43200; Path=/; HttpOnly; SameSite=Lax' }]), body: { data: { ok: true, area: 'tenant', nama: 'Pengguna Uji' } } },
      { name: 'Kredensial salah', code: 401, status: 'Unauthorized', headers: CT, reqBody: { area: 'tenant', email: 'uji@example.com', password: 'salah', captcha: 'dummy' }, body: errEnv('/api_web/auth/login', 401, { error: 'Email atau kata sandi salah.' }) },
      { name: 'Captcha tidak diisi', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { area: 'tenant', email: 'uji@example.com', password: 'sandi-uji-123' }, body: errEnv('/api_web/auth/login', 422, { errors: { captcha: 'Verifikasi captcha wajib diisi.' } }) },
      { name: 'Throttled (10x/menit)', code: 429, status: 'Too Many Requests', headers: CT.concat([{ key: 'retry-after', value: '59' }]), body: { data: { error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa saat.', retryAfter: 59 } } }
    ]
  },
  'c8504557f37b164466ae8fdb4': {
    description: 'Login portal provider (akun tabel users, area "provider"). Sama seperti login tenant: cookie sesi, wajib captcha, throttle 10x/menit per IP.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT.concat([{ key: 'set-cookie', value: 'upgr_session=...; Max-Age=43200; Path=/; HttpOnly; SameSite=Lax' }]), reqBody: { area: 'provider', email: 'provider@contoh.id', password: 'ganti-dengan-asli', captcha: 'dummy' }, body: { data: { ok: true, area: 'provider', nama: 'Provider Utama' } } },
      { name: 'Kredensial salah', code: 401, status: 'Unauthorized', headers: CT, body: errEnv('/api_web/auth/login', 401, { error: 'Email atau kata sandi salah.' }) },
      { name: 'Area salah', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { area: 'x', captcha: 'dummy' }, body: errEnv('/api_web/auth/login', 422, { errors: { area: 'Area harus tenant atau provider.' } }) }
    ]
  },
  'c2aca32457fa033b4fd08df3f': {
    description: 'Cek sesi aktif. Wajib cookie upgr_session dari login. Tanpa/expired sesi -> 401 "Belum login.".',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { area: 'tenant', nama: 'Pengguna Uji', email: 'uji@example.com' } } },
      { name: 'Belum login', code: 401, status: 'Unauthorized', headers: CT, body: errEnv('/api_web/auth/me', 401, { error: 'Belum login.' }) }
    ]
  },
  'c0640e3dce6d6123cfe3ea5ae': {
    description: 'Keluar: menghapus sesi di server + mengosongkan cookie upgr_session.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT.concat([{ key: 'set-cookie', value: 'upgr_session=; Max-Age=0; Path=/' }]), body: { data: { ok: true } } }
    ]
  },
  // ---------- Publik ----------
  'c9619d6f1cfcb8dee136b0766': {
    description: 'Verifikasi kredensial API milik tenant (dipakai aplikasi ERP/BIS sebelum memanggil endpoint publik).\n\nAuth: HTTP Basic, username = key, password = secret (kolom key/secret di Tenant > API Keys). Key nonaktif -> 401.\nBatas: 20x/menit per IP -> 429 + header Retry-After.',
    examples: [
      { name: 'Kredensial salah / nonaktif', code: 401, status: 'Unauthorized', headers: CT, body: errEnv('/api_external/publik/verify', 401, { error: 'Kredensial API tidak valid atau nonaktif.' }) },
      { name: 'Throttled (20x/menit)', code: 429, status: 'Too Many Requests', headers: CT.concat([{ key: 'retry-after', value: '59' }]), body: { data: { error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa saat.' } } }
    ]
  },
  'c768682e1c94572d2726a814f': {
    description: 'Pintu masuk notifikasi Midtrans (panggil otomatis oleh Midtrans, BUKAN oleh aplikasi).\n\nIsi di dashboard Midtrans (Settings > Notification URL): <<baseUrl>>/api_external/publik/notify/midtrans/<<credId>> untuk Payment notification URL, Recurring notification URL, dan Account linking notification URL (ketiganya URL yang sama, ganti <<credId>> dengan id kredensial).\n\nAlur per panggilan: 1) baca raw body + header, 2) verifikasi signature SHA512(order_id + status_code + gross_amount + serverKey) == signature_key (serverKey = kolom secret, cadangan key; hanya di memori, TIDAK PERNAH disimpan ke log), 3) SELALU jawab 200 {"ok": true} agar Midtrans tidak retry (kecuali kredensial tak ada -> 404), 4) catat 1 baris provider_logs (hasil ok/gagal + header/body disensor: cookie -> [REDACTED], secret tak disimpan), 5) bila signature valid, teruskan body ke semua webhook AKTIF milik kredensial (POST JSON + header X-Webhook-Token bila webhook punya verify_token) dan catat tiap penerusan ke webhook_logs (hasil terkirim/gagal). Maks 200 provider_logs + 200 webhook_logs per kredensial, tertua dibuang.',
    reqBody: { order_id: 'MG-TEST-1', status_code: '200', gross_amount: '15000', signature_key: 'HITUNG: SHA512(order_id+status_code+gross_amount+serverKey)', transaction_status: 'settlement', payment_type: 'qris' },
    examples: [
      { name: 'Signature valid (diteruskan ke webhook)', code: 200, status: 'OK', headers: CT, reqBody: { order_id: 'MG-TEST-1', status_code: '200', gross_amount: '15000', signature_key: '2f5ab3d59900f53bcdb260439afce2d052502d72985951c5193700a1a04e5f96', transaction_status: 'settlement', payment_type: 'qris' }, body: { ok: true } },
      { name: 'Signature salah (tetap 200, dicatat gagal)', code: 200, status: 'OK', headers: CT, reqBody: { order_id: 'MG-TEST-1', status_code: '200', gross_amount: '15000', signature_key: 'salah', transaction_status: 'settlement' }, body: { ok: true } },
      { name: 'Kredensial tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_external/publik/notify/midtrans/tidak-ada', 404, { error: 'Kredensial tidak ditemukan.' }) }
    ]
  },
  // ---------- Kredensial ----------
  'caf69e395a1dd1f1987ceb8b7': {
    description: 'Daftar semua kredensial payment gateway milik tenant (secret + token tampil apa adanya di JSON; di layar UI disensor). Kolom status: "aktif"/"nonaktif" (filter + badge di halaman list).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: [{ id: '01a18296-88bf-7931-ba3d-b391e594d1a0', nama: 'Midtrans Sandbox', provider: 'midtrans', is_production: false, merchant_id: 'M-001', key: 'SB-Mid-client-001', secret: 'SB-Mid-secret-001', webhook_verify_token: 'tok-sb-001', deskripsi: 'Akun sandbox pengembang', status: 'aktif', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' }, { id: '01a18296-88bf-75af-b5a7-1eb6f2ded83e', nama: 'DOKU Production', provider: 'doku', is_production: true, merchant_id: 'D-001', key: 'DK-client-001', secret: 'DK-secret-001', webhook_verify_token: 'tok-dk-001', deskripsi: '', status: 'nonaktif', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' }] } }
    ]
  },
  'c63f5a767da5f5dde1b21aae5': {
    description: 'Tambah kredensial. provider bebas (huruf kecil/angka/dash, 2-30 char); uji otomatis hanya mendukung midtrans + xendit. status default "aktif" bila tak diisi; isian salah -> 422 per-field.',
    examples: [
      { name: 'Berhasil', code: 201, status: 'Created', headers: CT, body: { data: { id: '01a18759-ba52-7d86-b2e3-b66a955242c2', nama: 'Midtrans Sandbox', provider: 'midtrans', is_production: false, merchant_id: 'M-001', key: 'SB-Mid-client-001', secret: 'SB-Mid-secret-001', webhook_verify_token: 'tok-sb-001', deskripsi: 'Akun sandbox pengembang', status: 'aktif', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Validasi gagal', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { nama: '' }, body: errEnv('/api_web/credentials', 422, { errors: { nama: 'Nama wajib diisi.', provider: 'Provider wajib diisi.', key: 'Key wajib diisi.', secret: 'Secret wajib diisi.' } }) }
    ]
  },
  'ce826269f35946c677b91b69d': {
    description: 'Detail satu kredensial by id (<<credId>>). Id tak ada -> 404.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18296-88bf-7931-ba3d-b391e594d1a0', nama: 'Midtrans Sandbox', provider: 'midtrans', is_production: false, merchant_id: 'M-001', key: 'SB-Mid-client-001', secret: 'SB-Mid-secret-001', webhook_verify_token: 'tok-sb-001', deskripsi: 'Akun sandbox pengembang', status: 'aktif', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/credentials/tidak-ada-uuid', 404, { error: 'Kredensial tidak ditemukan.' }) }
    ]
  },
  'c1e9f8a8d9ca32f439e8ac2b1': {
    description: 'Ubah kredensial (termasuk ganti status aktif/nonaktif dan mode sandbox/production). Validasi sama seperti Tambah.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18296-88bf-7931-ba3d-b391e594d1a0', nama: 'Midtrans Sandbox 2', provider: 'midtrans', is_production: false, merchant_id: 'M-001', key: 'SB-Mid-client-001', secret: 'SB-Mid-secret-001', webhook_verify_token: 'tok-sb-001', deskripsi: 'Diubah', status: 'aktif', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:01:00.000Z' } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/credentials/tidak-ada-uuid', 404, { error: 'Kredensial tidak ditemukan.' }) }
    ]
  },
  'c048e78cf44efbfb5615572c3': {
    description: 'Uji kredensial ke gateway ASLI tanpa buat transaksi / gerakkan uang. midtrans: GET status order fiktif (kunci diterima bila HTTP 404 atau status_code 404; ditolak bila 401). xendit: GET /balance. Provider lain -> 422. Setiap probe dicatat ke api_logs TANPA secret (header Authorization disimpan sebagai "Basic ***"). Throttle 10x/menit per IP -> 429.',
    examples: [
      { name: 'Kunci valid (midtrans)', code: 200, status: 'OK', headers: CT, body: { data: { ok: true, provider: 'midtrans', mode: 'Sandbox', http: 404, pesan: 'Kunci diterima Midtrans (order contoh memang tidak ada).', checked_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Kunci ditolak (401)', code: 200, status: 'OK', headers: CT, body: { data: { ok: false, provider: 'midtrans', mode: 'Sandbox', http: 401, pesan: 'Kunci ditolak Midtrans (HTTP 401). Periksa Server Key.', checked_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Provider belum didukung', code: 422, status: 'Unprocessable Entity', headers: CT, body: errEnv('/api_web/credentials/<<credId>>/test', 422, { errors: { provider: 'Uji otomatis untuk provider "contoh" belum didukung.' } }) }
    ]
  },
  'ca8cfecd4022e1588a7ad16a2': {
    description: 'Hapus kredensial permanen (tanpa soft delete). Id tak ada -> 404.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ok: true } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/credentials/tidak-ada-uuid', 404, { error: 'Kredensial tidak ditemukan.' }) }
    ]
  },
  'cf7f7698b2465bd7729535e54': {
    description: 'Hapus banyak kredensial sekaligus. Respons selalu menyebut yang diproses + yang dilewati (id tak ada ikut dihitung dilewati, tidak error).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { diproses: 2, dilewati: 1 } } },
      { name: 'Ids kosong', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { ids: [] }, body: errEnv('/api_web/credentials/bulk-delete', 422, { errors: { ids: 'Pilih minimal 1 baris.' } }) }
    ]
  },
  'c73e55a596490c752b9f6e7e4': {
    description: 'Impor banyak kredensial dari baris Excel (kolom: Nama, Provider, Mode, Status, Merchant ID, Key, Secret, Verify Token, Deskripsi). Baris invalid / key duplikat dilewati dan dilaporkan, tidak menggagalkan yang valid.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ditambah: 1, dilewati: 1 } } }
    ]
  },
  // ---------- Webhook ----------
  'cbc6c803a658f8d7e35583ff1': {
    description: 'Daftar webhook penerus milik satu kredensial (notify valid dari Midtrans diteruskan ke yang is_active=1). prefix dipakai sebagai awalan nomor order ke app tujuan.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: [{ id: '01a18760-0000-7000-8000-000000000001', credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', nama: 'ERP Utama', url: 'https://erp.contoh.id/w/midtrans', prefix: 'INV', is_active: true, verify_token: 'tok-erp-1', deskripsi: 'Penerus ERP', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' }] } }
    ]
  },
  'c48a1811d5e87950e14593ede': {
    description: 'Tambah webhook penerus (201). verify_token opsional: bila diisi, tiap penerusan membawa header X-Webhook-Token.',
    examples: [
      { name: 'Berhasil', code: 201, status: 'Created', headers: CT, body: { data: { id: '01a18760-0000-7000-8000-000000000001', credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', nama: 'ERP Utama', url: 'https://erp.contoh.id/w/midtrans', prefix: 'INV', is_active: true, verify_token: 'tok-erp-1', deskripsi: 'Penerus ERP', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'URL tak valid', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { nama: 'ERP Utama', url: 'bukan-url' }, body: errEnv('/api_web/credentials/<<credId>>/webhooks', 422, { errors: { url: 'URL harus diawali http(s):// dengan host valid.' } }) }
    ]
  },
  'c66a583fd051f046d85d68598': {
    description: 'Detail satu webhook. Id tak ada / milik kredensial lain -> 404.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18760-0000-7000-8000-000000000001', credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', nama: 'ERP Utama', url: 'https://erp.contoh.id/w/midtrans', prefix: 'INV', is_active: true, verify_token: 'tok-erp-1', deskripsi: 'Penerus ERP', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/credentials/<<credId>>/webhooks/tidak-ada', 404, { error: 'Webhook tidak ditemukan.' }) }
    ]
  },
  'ce34b31b9125147a1889ec751': {
    description: 'Ubah webhook (termasuk aktif/nonaktif via is_active).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18760-0000-7000-8000-000000000001', credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', nama: 'ERP Utama 2', url: 'https://erp.contoh.id/w/midtrans', prefix: 'INV', is_active: true, verify_token: 'tok-erp-1', deskripsi: 'Diubah', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:01:00.000Z' } } }
    ]
  },
  'c90a29948aa6da7ef6e32b303': {
    description: 'Uji kirim: POST payload {event, credential_id, webhook_id, nama, prefix, sent_at} + header X-UPGR-Test ke URL webhook, lalu catat hasilnya sebagai webhook_logs (hasil terkirim/gagal, header disensor). Webhook nonaktif -> 422.',
    examples: [
      { name: 'Terkirim', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18760-0000-7000-8000-000000000002', credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', webhook_id: '01a18760-0000-7000-8000-000000000001', nama: 'ERP Utama', url: 'https://erp.contoh.id/w/midtrans', event: 'Uji coba', hasil: 'terkirim', http: 200, pesan: '', created_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Webhook nonaktif', code: 422, status: 'Unprocessable Entity', headers: CT, body: errEnv('/api_web/credentials/<<credId>>/webhooks/<<webhookId>>/test', 422, { errors: { webhook: 'Webhook nonaktif. Aktifkan dulu untuk uji kirim.' } }) }
    ]
  },
  'c95d3adc06a94c23d2669fd3e': {
    description: 'Hapus webhook permanen.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ok: true } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/credentials/<<credId>>/webhooks/tidak-ada', 404, { error: 'Webhook tidak ditemukan.' }) }
    ]
  },
  'c79eaa771c5edc7e9293f8818': {
    description: 'Hapus banyak webhook sekaligus (dilaporkan diproses + dilewati).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { diproses: 2, dilewati: 0 } } }
    ]
  },
  'cdb61f749f9115e69d6da1934': {
    description: 'Impor banyak webhook dari Excel (kolom: Nama, URL, Prefix, Status, Token, Deskripsi).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ditambah: 1, dilewati: 1 } } }
    ]
  },
  // ---------- Log ----------
  'c534df4b9fc2190656d8be624': {
    description: 'Log router: penerusan notify ke webhook milik kredensial (hasil terkirim/gagal, http, pesan). Filter: hasil, http, q (cari nama/url/event), dari + sampai (ISO). Maks 200/kredensial, tertua dibuang.',
    examples: [
      { name: 'Berhasil (kosong)', code: 200, status: 'OK', headers: CT, body: { data: [] } }
    ]
  },
  'c5ea3a191e1de819210c82a24': {
    description: 'Catat baris webhook_logs manual (201), mis. untuk simulasi. Webhook tujuan wajib milik kredensial ini.',
    examples: [
      { name: 'Berhasil', code: 201, status: 'Created', headers: CT, body: { data: { id: '01a18760-0000-7000-8000-000000000003', credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', webhook_id: '<<webhookId>>', nama: 'ERP Utama', url: 'https://erp.contoh.id/w/midtrans', event: 'Uji kirim', hasil: 'terkirim', http: 200, pesan: 'OK', created_at: '2026-10-29T10:00:00.000Z' } } }
    ]
  },
  'cba19c77a5b118392f563e276': {
    description: 'Detail satu webhook_logs: request_header, request_body, response_header, response_body lengkap (token/secret disensor).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18760-0000-7000-8000-000000000003', credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', event: 'Midtrans notify', hasil: 'terkirim', http: 200, request_header: '{"Content-Type":"application/json","X-Webhook-Token":"[REDACTED]"}', request_body: '{"order_id":"MG-TEST-1"}', response_header: '{"content-type":"application/json"}', response_body: '{"ok":true}', created_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/credentials/<<credId>>/logs/tidak-ada', 404, { error: 'Log router tidak ditemukan.' }) }
    ]
  },
  'c941df1e58ed8f890b3657831': {
    description: 'Log API: tiap probe Test kredensial (provider, method, url, http, durasi_ms, hasil ok/gagal, pesan). Termasuk meta {total, page, limit}. Tanpa secret (Authorization = "Basic ***").',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: [], meta: { total: 0, page: 1, limit: 20 } } }
    ]
  },
  'ce20dbd12fbf2fda30a75253c': {
    description: 'Detail satu api_logs: ringkasan + header/body request-response lengkap dan tersensor.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18760-0000-7000-8000-000000000004', credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', provider: 'midtrans', method: 'GET', url: 'https://api.sandbox.midtrans.com/v2/UPGR-CRED-CHECK-1/status', http: 404, durasi_ms: 812, hasil: 'ok', pesan: 'Kunci diterima Midtrans (order contoh memang tidak ada).', request_header: '{"authorization":"Basic ***"}', request_body: '', response_header: '{"content-type":"application/json"}', response_body: '{"status_code":"404","status_message":"Transaction doesn\'t exist."}', created_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/credentials/<<credId>>/api-logs/tidak-ada', 404, { error: 'Log API tidak ditemukan.' }) }
    ]
  },
  'c8235d3918b2a3f7730b03c91': {
    description: 'Log provider: tiap panggilan notify Midtrans masuk (hasil ok = signature valid, gagal = tak valid; pesan menyebut order_id). Request header disensor (cookie -> [REDACTED]), secret tak pernah disimpan.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: [{ id: '01a18759-ba45-7608-80af-954368703d6d16', credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', provider: 'midtrans', method: 'POST', url: '/api_external/publik/notify/midtrans/01a18296-88bf-7931-ba3d-b391e594d1a0', http: 200, durasi_ms: 5, hasil: 'ok', pesan: 'Signature valid (order MG-TEST-1).', created_at: '2026-10-29T10:00:00.000Z' }] } }
    ]
  },
  'c78449c52136b12a910d1c94f': {
    description: 'Detail satu provider_logs: header/body request-response lengkap (contoh: signature_key pengirim terlihat, secret server TIDAK PERNAH ada di log).',
    examples: [
      { name: 'Berhasil (signature salah)', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18759-ba45-7608-80af-954368703d6d16', credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', provider: 'midtrans', method: 'POST', url: '/api_external/publik/notify/midtrans/01a18296-88bf-7931-ba3d-b391e594d1a0', http: 200, durasi_ms: 2, hasil: 'gagal', pesan: 'Signature tidak valid (order MG-TEST-1).', request_header: '{"content-type":"application/json","cookie":"[REDACTED]"}', request_body: '{"order_id":"MG-TEST-1","status_code":"200","gross_amount":"15000","signature_key":"salah","transaction_status":"settlement"}', response_header: '{"content-type":"application/json"}', response_body: '{"ok":true}', created_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/credentials/<<credId>>/provider-logs/tidak-ada', 404, { error: 'Log provider tidak ditemukan.' }) }
    ]
  },
  // ---------- API Keys ----------
  'cb1332f851d101ce28c65b46a': {
    description: 'Daftar API key milik tenant yang sedang login (dipakai aplikasi ERP/BIS sebagai Basic key:secret ke /api_external/publik/verify). status aktif/nonaktif: key nonaktif selalu 401.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: [{ id: '01a18296-88bf-7755-8da0-78ccc9236f14', tenant_id: '01a18296-88bb-7cd3-888e-b69cb5214659', name: 'ERP Production', status: 'aktif', key: 'upgrk_erp_prod_001', secret: 'upgrs_erp_prod_001', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' }, { id: '01a18296-88bf-7c94-b816-061dbdb5445d', tenant_id: '01a18296-88bb-7cd3-888e-b69cb5214659', name: 'BIS Staging', status: 'nonaktif', key: 'upgrk_bis_stg_001', secret: 'upgrs_bis_stg_001', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' }] } }
    ]
  },
  'c0b1f33b3d48c1a9ad1762470': {
    description: 'Terbitkan API key baru (201). key + secret bebas (maks 200 char); simpan secret baik-baik, tampil di list tapi tak bisa disensor per-key.',
    examples: [
      { name: 'Berhasil', code: 201, status: 'Created', headers: CT, body: { data: { id: '01a18761-0000-7000-8000-000000000001', tenant_id: '01a18296-88bb-7cd3-888e-b69cb5214659', name: 'ERP Production', status: 'aktif', key: 'upgrk_erp_prod_001', secret: 'upgrs_erp_prod_001', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Validasi gagal', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { name: '' }, body: errEnv('/api_web/tenant/api-keys', 422, { errors: { name: 'Nama wajib diisi.', key: 'Key wajib diisi.', secret: 'Secret wajib diisi.' } }) }
    ]
  },
  'c798353dddc2508fef743cbd0': {
    description: 'Detail satu API key.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18296-88bf-7755-8da0-78ccc9236f14', tenant_id: '01a18296-88bb-7cd3-888e-b69cb5214659', name: 'ERP Production', status: 'aktif', key: 'upgrk_erp_prod_001', secret: 'upgrs_erp_prod_001', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/tenant/api-keys/tidak-ada', 404, { error: 'API tidak ditemukan.' }) }
    ]
  },
  'cd2f8df2334729eb51de257f5': {
    description: 'Ubah API key (termasuk putar secret dan aktif/nonaktif).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18296-88bf-7755-8da0-78ccc9236f14', tenant_id: '01a18296-88bb-7cd3-888e-b69cb5214659', name: 'ERP Production 2', status: 'aktif', key: 'upgrk_erp_prod_001', secret: 'upgrs_erp_prod_001', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:01:00.000Z' } } }
    ]
  },
  'c1681db8b5455efe7f23df929': {
    description: 'Cabut API key permanen (aplikasi pemakai langsung 401).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ok: true } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/tenant/api-keys/tidak-ada', 404, { error: 'API tidak ditemukan.' }) }
    ]
  },
  'c09032a8750b549e5e5ed63b6': {
    description: 'Cabut banyak API key sekaligus (dilaporkan diproses + dilewati).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { diproses: 1, dilewati: 0 } } }
    ]
  },
  'cb2d7cf0efe521f7f50b7401d': {
    description: 'Impor banyak API key dari Excel (kolom: Nama, Tenant ID, Status, Key, Secret).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ditambah: 1, dilewati: 1 } } }
    ]
  },
  // ---------- Profil ----------
  'ce013c337a34688387be5f211': {
    description: 'Lihat profil tenant yang sedang login (nama, email, deskripsi). Tanpa sesi -> 401.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { nama: 'Pengguna Uji', email: 'uji@example.com', deskripsi: 'Akun uji E2E' } } },
      { name: 'Sesi berakhir', code: 401, status: 'Unauthorized', headers: CT, body: errEnv('/api_web/tenant/profil', 401, { error: 'Sesi berakhir, silakan login kembali.' }) }
    ]
  },
  'cc4c28ab645490e643ef13788': {
    description: 'Ubah nama/email/deskripsi tenant sendiri. Email harus unik antar tenant (duplikat -> 422).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { nama: 'PT Uji Coba', email: 'uji@contoh.id', deskripsi: 'Profil contoh' } } },
      { name: 'Email dipakai tenant lain', code: 422, status: 'Unprocessable Entity', headers: CT, body: errEnv('/api_web/tenant/profil', 422, { errors: { email: 'Email sudah dipakai tenant lain.' } }) }
    ]
  },
  'c347d1e24242b283b399f7d03': {
    description: 'Ganti kata sandi akun sendiri. Syarat: kata sandi lama benar, baru 8-100 char, konfirmasi sama. Tanpa sesi -> 401.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ok: true } } },
      { name: 'Sandi lama salah', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { password_lama: 'salah', password_baru: 'sandi-baru-123', konfirmasi: 'sandi-baru-123' }, body: errEnv('/api_web/tenant/password', 422, { errors: { password_lama: 'Kata sandi lama salah.' } }) },
      { name: 'Sandi baru pendek', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { password_lama: 'sandi-uji-123', password_baru: 'pendek', konfirmasi: 'pendek' }, body: errEnv('/api_web/tenant/password', 422, { errors: { password_baru: 'Kata sandi baru minimal 8 karakter.' } }) }
    ]
  },
  // ---------- Tenants (provider) ----------
  'c242a09ed26daa5e58405d12f': {
    description: 'Daftar tenant kelolaan provider (akun login portal tenant). status aktif/nonaktif: tenant nonaktif tak bisa login (401).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: [{ id: '01a18296-88bb-7cd3-888e-b69cb5214659', nama: 'PT Contoh Teknologi Indonesia', email: 'admin@example.com', deskripsi: 'Tenant utama. Segera atur ulang kata sandi.', status: 'aktif', created_by: 'provider', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' }] } }
    ]
  },
  'c10dd81fbbb3d1507472dbe9e': {
    description: 'Daftarkan tenant baru (201). Email unik; kata sandi min 8 char. Tenant langsung bisa login.',
    examples: [
      { name: 'Berhasil', code: 201, status: 'Created', headers: CT, body: { data: { id: '01a18762-0000-7000-8000-000000000001', nama: 'Kopsis Mawar', email: 'kopsis@contoh.id', deskripsi: 'Koperasi sekolah', status: 'aktif', created_by: 'provider', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Validasi gagal', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { nama: '', email: 'bukan-email', password: 'pendek' }, body: errEnv('/api_web/provider/tenants', 422, { errors: { nama: 'Nama tenant wajib diisi.', email: 'Email tidak valid.', password: 'Kata sandi minimal 8 karakter.' } }) }
    ]
  },
  'c0d709dbb182fbda1301d3f84': {
    description: 'Detail satu tenant.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18296-88bb-7cd3-888e-b69cb5214659', nama: 'PT Contoh Teknologi Indonesia', email: 'admin@example.com', deskripsi: 'Tenant utama. Segera atur ulang kata sandi.', status: 'aktif', created_by: 'provider', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/provider/tenants/tidak-ada', 404, { error: 'Tenant tidak ditemukan.' }) }
    ]
  },
  'c551ef0252926fd7e77c0edd0': {
    description: 'Ubah tenant. password opsional: kosong = tidak diganti; diisi = min 8 char lalu di-hash.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18296-88bb-7cd3-888e-b69cb5214659', nama: 'PT Contoh 2', email: 'admin@example.com', deskripsi: 'Diubah', status: 'aktif', created_by: 'provider', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:01:00.000Z' } } }
    ]
  },
  'cb0d33f471f6543932c84e22d': {
    description: 'Hapus tenant permanen.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ok: true } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/provider/tenants/tidak-ada', 404, { error: 'Tenant tidak ditemukan.' }) }
    ]
  },
  'c21207109bd6a569ff69e4f81': {
    description: 'Ubah status banyak tenant sekaligus (aktif/nonaktif). Respons = jumlah yang diubah.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { diubah: 2 } } },
      { name: 'Ids kosong', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { ids: [], status: 'nonaktif' }, body: errEnv('/api_web/provider/tenants/bulk-status', 422, { errors: { ids: 'Pilih minimal 1 baris.' } }) }
    ]
  },
  'c83c5452617a525fa33d678db': {
    description: 'Hapus banyak tenant sekaligus (dilaporkan diproses + dilewati).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { diproses: 1, dilewati: 0 } } }
    ]
  },
  'c767b108e248e09782ff34fa7': {
    description: 'Impor banyak tenant dari Excel (kolom: Nama, Email, Password, Deskripsi, Status).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ditambah: 1, dilewati: 1 } } }
    ]
  },
  // ---------- Konfigurasi (provider) ----------
  'c8aff6d8fc73ce132cf629c3d': {
    description: 'Daftar konfigurasi global (kode unik). type: text / number / boolean / kredensial (value disensor di UI).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: [{ id: '01a18296-88bf-7ff0-9911-9832653597ae', kode: 'midtrans-server-key', nama: 'Midtrans Server Key', type: 'kredensial', value: 'SB-Mid-test-123', deskripsi: 'Server key gateway Midtrans. Disensor di layar, enkripsi menyusul.', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' }, { id: '01a18296-88bf-7d9c-95a3-65c38bbac987', kode: 'retry-maksimal', nama: 'Retry Maksimal', type: 'number', value: '3', deskripsi: 'Jumlah percobaan ulang pengiriman webhook.', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' }] } }
    ]
  },
  'ca3c08bcef2c2fd3592f34cbe': {
    description: 'Tambah konfigurasi teks (201).',
    examples: [
      { name: 'Berhasil', code: 201, status: 'Created', headers: CT, body: { data: { id: '01a18763-0000-7000-8000-000000000001', kode: 'webhook-erp', nama: 'Webhook ERP RT/RW Net', type: 'text', value: 'https://erp.contoh.id/w/midtrans', deskripsi: 'Penerus webhook', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } }
    ]
  },
  'c84b9850b8e191c0f90fb9ce8': {
    description: 'Tambah konfigurasi rahasia (201, type kredensial: value min 4 char, disensor di UI).',
    examples: [
      { name: 'Berhasil', code: 201, status: 'Created', headers: CT, body: { data: { id: '01a18296-88bf-7ff0-9911-9832653597ae', kode: 'midtrans-server-key', nama: 'Midtrans Server Key', type: 'kredensial', value: 'SB-Mid-xxx', deskripsi: 'Kunci server gateway', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Tipe salah', code: 422, status: 'Unprocessable Entity', headers: CT, reqBody: { kode: 'x', nama: 'X', type: 'rahasia', value: 'v' }, body: errEnv('/api_web/provider/konfigurasi', 422, { errors: { type: 'Tipe tidak valid.' } }) }
    ]
  },
  'cc710441be533640dd2994e0b': {
    description: 'Detail satu konfigurasi.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18296-88bf-7ff0-9911-9832653597ae', kode: 'midtrans-server-key', nama: 'Midtrans Server Key', type: 'kredensial', value: 'SB-Mid-xxx', deskripsi: 'Kunci server gateway', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:00:00.000Z' } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/provider/konfigurasi/tidak-ada', 404, { error: 'Konfigurasi tidak ditemukan.' }) }
    ]
  },
  'c5154f411ad10e82109053dc5': {
    description: 'Ubah konfigurasi.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { id: '01a18296-88bf-7ff0-9911-9832653597ae', kode: 'midtrans-server-key', nama: 'Midtrans Server Key 2', type: 'kredensial', value: 'SB-Mid-xxx', deskripsi: 'Diubah', created_at: '2026-10-29T10:00:00.000Z', updated_at: '2026-10-29T10:01:00.000Z' } } }
    ]
  },
  'c8087a606a4e31f2b5174d08d': {
    description: 'Hapus konfigurasi permanen.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ok: true } } },
      { name: 'Tak ada', code: 404, status: 'Not Found', headers: CT, body: errEnv('/api_web/provider/konfigurasi/tidak-ada', 404, { error: 'Konfigurasi tidak ditemukan.' }) }
    ]
  },
  'ce2cb4cd35111f571aa417f68': {
    description: 'Hapus banyak konfigurasi sekaligus (dilaporkan diproses + dilewati).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { diproses: 1, dilewati: 0 } } }
    ]
  },
  'c01f0e326fd91e26c28cf4a1e': {
    description: 'Impor banyak konfigurasi dari Excel (kolom: Kode, Nama, Tipe, Nilai, Deskripsi).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ditambah: 1, dilewati: 1 } } }
    ]
  },
  // ---------- Uji (dev/lokal saja) ----------
  'ccee1335a9883031595e9a670': {
    description: 'Reset DB dev: hapus semua data lalu isi 2 kredensial + 2 API key + tenant utama + 4 konfigurasi. Wajib ALLOW_TEST_API=1, JANGAN ada di prod (403).',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ok: true, seeds: 2 } } },
      { name: 'Ditolak (bukan dev)', code: 403, status: 'Forbidden', headers: CT, body: errEnv('/api_web/_test/reset', 403, { error: 'Endpoint uji hanya tersedia di development.' }) }
    ]
  },
  'c09abd1c51e0e4e1ee211237e': {
    description: 'Buat/refresh akun uji tenant (uji@example.com / sandi-uji-123) untuk login E2E. Wajib ALLOW_TEST_API=1.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ok: true, email: 'uji@example.com' } } }
    ]
  },
  'cae5c9c75086880d773399fa0': {
    description: 'Endpoint pantul untuk uji kirim webhook (selalu {"ok": true}). Dipakai sebagai URL webhook dummy.',
    examples: [
      { name: 'Berhasil', code: 200, status: 'OK', headers: CT, body: { data: { ok: true } } }
    ]
  }
};
