const crypto = require('crypto');
const cuid = () => 'c' + crypto.randomBytes(12).toString('hex');
const CT = [{ key: 'content-type', value: 'application/json' }];
const AUTH = { authType: 'basic', username: '<<apiKey>>', password: '<<apiSecret>>', authActive: true };
const errEnv = (url, code, data) => ({
  error: true, url: '<<baseUrl>>' + url, statusCode: code,
  statusMessage: 'Server Error', message: '', data
});
function req(name, endpoint, bodyText) {
  return {
    v: '17', auth: AUTH,
    body: { body: bodyText, contentType: 'application/json' },
    name, method: 'POST', params: [],
    headers: [{ key: 'Content-Type', value: 'application/json', active: true, description: '' }],
    endpoint, responses: {}, testScript: '', description: null, preRequestScript: '', requestVariables: []
  };
}
function ex(cur, e) {
  return {
    body: JSON.stringify(e.body, null, 2),
    code: e.code, name: e.name, status: e.status, headers: e.headers || CT,
    originalRequest: {
      v: '6', auth: cur.auth,
      body: { body: e.reqBody !== undefined ? JSON.stringify(e.reqBody, null, 2) : cur.body.body, contentType: 'application/json' },
      name: cur.name, method: cur.method, params: [], headers: cur.headers,
      endpoint: cur.endpoint, requestVariables: []
    }
  };
}

const buatBody = {
  credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', payment_method: 'gopay_qris_dinamis',
  items: [{ id: 'BRG-1', price: 15000, quantity: 1, name: 'Nasi kotak' }],
  amount: 15000, kode_trx: 'INV-2026-0001',
  cust_name: 'Budi', cust_email: 'budi@contoh.id', cust_address: 'Jl. Contoh 1', cust_phone_number: '0812000001'
};
const buat = req('Buat invoice (GoPay QRIS dinamis)', '<<baseUrl>>/api_external/publik/tagihan/midtrans/buat', JSON.stringify(buatBody, null, 2));
buat.description = 'Buat invoice Midtrans GoPay QRIS dinamis (STATELESS, tanpa simpan transaksi).\n\nAuth: HTTP Basic key:secret API key tenant. credential_id (UUID kredensial Midtrans) ada di BODY.\npayment_method "gopay_qris_dinamis" -> Midtrans payment_type "qris" + qris.acquirer "gopay" (QR dinamis per transaksi, bisa dipindai GoPay/ShopeePay/aplikasi QRIS lain). Untuk halaman bayar multi-channel pakai request "Buat invoice (Snap)" (payment_method "snap").\nBody: credential_id, payment_method, items (nullable array {id?, price, quantity, name} -> item_details), amount (angka > 0 -> gross_amount; tidak wajib sama dengan total items), kode_trx (jadi order_id Midtrans), cust_name/cust_email/cust_address/cust_phone_number (semua nullable -> customer_details; cust_address masuk billing_address.address; cust_email dipakai Midtrans untuk notifikasi).\n\nMIDTRANS MENCATAT SEMUANYA: items + customer dikirim apa adanya ke Core API dan tampil di dashboard transaksi Midtrans. YANG TIDAK DIKEMBALIKAN: respons charge (201) maupun status TIDAK meng-echo items/customer — hanya field inti transaksi + actions. Bukti apa yang dikirim tersimpan di api_logs UPGR (request_body lengkap, secret disensor).\nRespons 201: { data: { meta: { payment_gateway_provider, is_production, kode_trx }, payment_gateway_response: <JSON mentah Midtrans: transaction_id, transaction_status pending, actions berisi URL generate-qr-code> } }.\nBatas 20x/menit per IP. Server key palsu -> 401 diteruskan ("Midtrans menolak").';
buat.responses = {};
for (const e of [
  { name: 'Berhasil (QR terbit)', code: 201, status: 'Created', reqBody: buatBody, body: { data: { meta: { payment_gateway_provider: 'midtrans', is_production: false, kode_trx: 'INV-2026-0001' }, payment_gateway_response: { status_code: '201', status_message: 'QRIS transaction is created', transaction_id: '0d8178e1-c6c7-4ab4-81a6-893be9d924ab', order_id: 'INV-2026-0001', merchant_id: 'M099098', gross_amount: '15000.00', currency: 'IDR', payment_type: 'qris', transaction_time: '2026-10-29 10:00:00', transaction_status: 'pending', fraud_status: 'accept', acquirer: 'gopay', actions: [{ name: 'generate-qr-code', method: 'GET', url: 'https://api.sandbox.midtrans.com/v2/qris/0d8178e1-c6c7-4ab4-81a6-893be9d924ab/qr-code' }] } } } },
  { name: 'payment_method salah', code: 422, status: 'Unprocessable Entity', reqBody: { credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', payment_method: 'qris', amount: 15000, kode_trx: 'INV-1' }, body: errEnv('/api_external/publik/tagihan/midtrans/buat', 422, { errors: { payment_method: 'payment_method hanya mendukung "gopay_qris_dinamis" dan "snap".' } }) },
  { name: 'Kredensial salah / nonaktif', code: 401, status: 'Unauthorized', body: errEnv('/api_external/publik/tagihan/midtrans/buat', 401, { error: 'Kredensial API tidak valid atau nonaktif.' }) },
  { name: 'Kredensial tak ada', code: 404, status: 'Not Found', reqBody: { credential_id: '01a18296-88bf-0000-4000-800000000000', payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV-1' }, body: errEnv('/api_external/publik/tagihan/midtrans/buat', 404, { error: 'Kredensial tidak ditemukan.' }) },
  { name: 'Server key ditolak Midtrans', code: 401, status: 'Unauthorized', body: errEnv('/api_external/publik/tagihan/midtrans/buat', 401, { error: 'Midtrans menolak (HTTP 401).', provider: { error_messages: ['Access denied due to unauthorized transaction, please check client or server key'] } }) }
]) buat.responses[e.name] = ex(buat, e);

const snapBody = {
  credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', payment_method: 'snap',
  items: [{ id: 'BRG-1', price: 15000, quantity: 1, name: 'Nasi kotak' }],
  amount: 15000, kode_trx: 'INV-2026-0001', expiry_menit: 60,
  cust_name: 'Budi', cust_email: 'budi@contoh.id', cust_address: 'Jl. Contoh 1', cust_phone_number: '0812000001'
};
const snap = req('Buat invoice (Snap)', '<<baseUrl>>/api_external/publik/tagihan/midtrans/buat', JSON.stringify(snapBody, null, 2));
snap.description = 'Buat invoice Midtrans Snap (STATELESS, tanpa simpan transaksi).\n\nAuth: HTTP Basic key:secret API key tenant. payment_method "snap" -> Midtrans Snap halaman bayar (semua channel aktif merchant tampil di situ).\nBody sama seperti QRIS: credential_id, items (nullable), amount, kode_trx (= order_id), cust_* (nullable), expiry_menit (opsional -> Snap expiry menit).\nRespons 201: { data: { meta, payment_gateway_response: { token, redirect_url } } }. Bayar manual lewat redirect_url (uang asli di production), lalu Midtrans mengirim notify ke /api_external/publik/notify/midtrans/[credId] dan router meneruskan ke webhook ber-prefix cocok.';
snap.responses = {};
for (const e of [
  { name: 'Berhasil (Snap terbit)', code: 201, status: 'Created', reqBody: snapBody, body: { data: { meta: { payment_gateway_provider: 'midtrans', is_production: false, kode_trx: 'INV-2026-0001' }, payment_gateway_response: { token: '17c12304-e671-4441-944d-2c381a800461', redirect_url: 'https://app.sandbox.midtrans.com/snap/v4/redirection/17c12304-e671-4441-944d-2c381a800461' } } } },
  { name: 'payment_method salah', code: 422, status: 'Unprocessable Entity', reqBody: { credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', payment_method: 'qris', amount: 15000, kode_trx: 'INV-1' }, body: errEnv('/api_external/publik/tagihan/midtrans/buat', 422, { errors: { payment_method: 'payment_method hanya mendukung "gopay_qris_dinamis" dan "snap".' } }) }
]) snap.responses[e.name] = ex(snap, e);

const cekBody = { credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', kode_trx: 'INV-2026-0001' };
const cek = req('Cek status invoice', '<<baseUrl>>/api_external/publik/tagihan/midtrans/status', JSON.stringify(cekBody, null, 2));
cek.description = 'Cek status invoice ke Midtrans GET /v2/{kode_trx}/status (STATELESS proxy).\n\nAuth Basic seperti Buat invoice. Body: credential_id + kode_trx.\ntransaction_status: pending / settlement / capture / deny / cancel / expire / failure / refund.\npayment_gateway_response = JSON Midtrans apa adanya (TIDAK memuat items/customer — itu hanya tercatat di dashboard Midtrans + api_logs UPGR). Kode tak ada -> 404. Batas 20x/menit per IP.';
cek.responses = {};
for (const e of [
  { name: 'Lunas (settlement)', code: 200, status: 'OK', reqBody: cekBody, body: { data: { meta: { payment_gateway_provider: 'midtrans', is_production: false, kode_trx: 'INV-2026-0001' }, payment_gateway_response: { status_code: '200', status_message: 'Success, QRIS transaction is successful', transaction_id: '0d8178e1-c6c7-4ab4-81a6-893be9d924ab', order_id: 'INV-2026-0001', gross_amount: '15000.00', payment_type: 'qris', transaction_time: '2026-10-29 10:00:00', transaction_status: 'settlement', fraud_status: 'accept', acquirer: 'gopay', settlement_time: '2026-10-29 10:05:00', currency: 'IDR' } } } },
  { name: 'Menunggu bayar (pending)', code: 200, status: 'OK', reqBody: cekBody, body: { data: { meta: { payment_gateway_provider: 'midtrans', is_production: false, kode_trx: 'INV-2026-0001' }, payment_gateway_response: { status_code: '201', status_message: 'QRIS transaction is created', transaction_id: '0d8178e1-c6c7-4ab4-81a6-893be9d924ab', order_id: 'INV-2026-0001', gross_amount: '15000.00', payment_type: 'qris', transaction_time: '2026-10-29 10:00:00', transaction_status: 'pending', fraud_status: 'accept', acquirer: 'gopay', currency: 'IDR' } } } },
  { name: 'Tak ada di Midtrans', code: 404, status: 'Not Found', reqBody: { credential_id: '01a18296-88bf-7931-ba3d-b391e594d1a0', kode_trx: 'INV-XXX' }, body: errEnv('/api_external/publik/tagihan/midtrans/status', 404, { error: 'Tagihan tidak ada di Midtrans (kode INV-XXX).', provider: { status_code: '404', status_message: "Transaction doesn't exist." } }) },
  { name: 'Kredensial salah / nonaktif', code: 401, status: 'Unauthorized', body: errEnv('/api_external/publik/tagihan/midtrans/status', 401, { error: 'Kredensial API tidak valid atau nonaktif.' }) }
]) cek.responses[e.name] = ex(cek, e);

module.exports = [
  { id: cuid(), title: 'Buat invoice (GoPay QRIS dinamis)', orderIndex: 2, request: buat },
  { id: cuid(), title: 'Buat invoice (Snap)', orderIndex: 3, request: snap },
  { id: cuid(), title: 'Cek status invoice', orderIndex: 4, request: cek }
];
