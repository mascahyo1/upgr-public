// E2E slice invoice Midtrans GoPay QRIS dinamis: auth, validasi, kredensial,
// teruskan 401 provider, envelope meta + payment_gateway_response, api_logs.
// Kunci seed PALSU sehingga Midtrans menolak 401 secara deterministik.
// Jalankan: E2E_PORT=3210 node tests/e2e/tagihan.e2e.cjs (butuh dev server + ALLOW_TEST_API=1)
const APIKEY = 'upgrk_erp_prod_001';
const APISECRET = 'upgrs_erp_prod_001';
const SEED_MIDTRANS = '01a18296-88bf-7931-ba3d-b391e594d1a0';

const PORT = Number(process.env.E2E_PORT || 3200);
const BASE = `http://127.0.0.1:${PORT}`;
const BASIC = 'Basic ' + Buffer.from(`${APIKEY}:${APISECRET}`).toString('base64');
const BADBASIC = 'Basic ' + Buffer.from('salah:rahasia').toString('base64');
const BUAT = '/api_external/publik/tagihan/midtrans/buat';
const STATUS = '/api_external/publik/tagihan/midtrans/status';

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

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE}/`);
      if (res.ok) return;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('server tidak siap');
}

async function call(method, path, auth, body) {
  const headers = {};
  if (auth) headers.Authorization = auth;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json };
}
const errOf = (r) => (r.json || {}).data || {};

(async () => {
  step('0. reset via API');
  await waitForServer();
  const rst = await (await fetch(`${BASE}/api_web/_test/reset`, { method: 'POST' })).json();
  assert(rst.data && rst.data.seeds === 2, 'reset: 2 seed');

  step('1. buat invoice wajib auth Basic');
  let r = await call('POST', BUAT, null, {});
  assert(r.status === 401, 'tanpa auth 401');
  r = await call('POST', BUAT, BADBASIC, {});
  assert(r.status === 401, 'key salah 401');

  step('2. validasi credential_id + kode_trx');
  r = await call('POST', BUAT, BASIC, { payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV-1' });
  assert(r.status === 422 && !!errOf(r).errors?.credential_id, 'tanpa credential_id 422');
  r = await call('POST', BUAT, BASIC, { credential_id: 'bukan-uuid', payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV-1' });
  assert(r.status === 422, 'credential_id bukan uuid 422');
  r = await call('POST', BUAT, BASIC, { credential_id: '01a18296-88bf-0000-4000-800000000000', payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV-1' });
  assert(r.status === 404, 'credential_id tak ada 404');

  step('3. validasi payment_method + amount + kode_trx');
  const goodCred = { credential_id: SEED_MIDTRANS, amount: 15000, kode_trx: 'INV-1' };
  r = await call('POST', BUAT, BASIC, { ...goodCred, payment_method: 'qris' });
  assert(r.status === 422 && !!errOf(r).errors?.payment_method, 'payment_method selain gopay_qris_dinamis/snap 422');
  r = await call('POST', BUAT, BASIC, { ...goodCred, payment_method: 'snap' });
  assert(r.status === 401, 'snap diterima validator, diteruskan ke Midtrans (kunci palsu 401)');
  r = await call('POST', BUAT, BASIC, { credential_id: SEED_MIDTRANS, payment_method: 'gopay_qris_dinamis', amount: 0, kode_trx: 'INV-1' });
  assert(r.status === 422 && !!errOf(r).errors?.amount, 'amount nol 422');
  r = await call('POST', BUAT, BASIC, { credential_id: SEED_MIDTRANS, payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV aneh!' });
  assert(r.status === 422 && !!errOf(r).errors?.kode_trx, 'kode_trx karakter aneh 422');
  r = await call('POST', BUAT, BASIC, { credential_id: SEED_MIDTRANS, payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV-1', cust_email: 'bukan-email' });
  assert(r.status === 422 && !!errOf(r).errors?.cust_email, 'cust_email salah 422');
  r = await call('POST', BUAT, BASIC, { credential_id: SEED_MIDTRANS, payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV-1', expiry_menit: 'lama' });
  assert(r.status === 422 && !!errOf(r).errors?.expiry_menit, 'expiry_menit bukan angka 422');
  r = await call('POST', BUAT, BASIC, { credential_id: SEED_MIDTRANS, payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV-1', items: [{ price: -1, quantity: 0, name: '' }] });
  assert(r.status === 422, 'item invalid 422');

  step('4. kredensial bukan midtrans');
  const doku = await (await fetch(`${BASE}/api_web/credentials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: 'Doku Uji', provider: 'doku', key: 'dk-uji-001', secret: 'ds-uji-001' }) })).json();
  assert(doku.data && doku.data.id, 'kredensial doku terbuat');
  r = await call('POST', BUAT, BASIC, { credential_id: doku.data.id, payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV-1' });
  assert(r.status === 422, 'provider doku di endpoint midtrans 422');
  await (await fetch(`${BASE}/api_web/credentials/${doku.data.id}`, { method: 'DELETE' })).json();

  step('5. buat invoice teruskan 401 provider (kunci seed palsu)');
  r = await call('POST', BUAT, BASIC, {
    credential_id: SEED_MIDTRANS, payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV-E2E-1',
    items: [{ id: 'BRG-1', price: 15000, quantity: 1, name: 'Kantin' }],
    cust_name: 'Budi', cust_email: 'budi@contoh.id', cust_phone_number: '0812000001', cust_address: 'Jl. Contoh 1'
  });
  assert(r.status === 401, 'server key palsu diteruskan 401');
  assert(JSON.stringify(r.json || {}).indexOf('Midtrans menolak') >= 0, 'pesan menyebut Midtrans menolak');

  step('6. cek status butuh auth + body valid');
  r = await call('POST', STATUS, null, {});
  assert(r.status === 401, 'status tanpa auth 401');
  r = await call('POST', STATUS, BASIC, { credential_id: SEED_MIDTRANS });
  assert(r.status === 422 && !!errOf(r).errors?.kode_trx, 'tanpa kode_trx 422');
  r = await call('POST', STATUS, BASIC, { credential_id: SEED_MIDTRANS, kode_trx: 'INV-E2E-1' });
  assert(r.status === 401, 'status kunci palsu 401');
  assert(JSON.stringify(r.json || {}).indexOf('"provider"') >= 0, 'respons error memuat body mentah provider');

  step('7. panggilan tercatat di api_logs');
  const logs = await (await fetch(`${BASE}/api_web/credentials/${SEED_MIDTRANS}/api-logs`)).json();
  const urls = ((logs || {}).data || []).map((x) => x.url || '').join(' ');
  assert(urls.indexOf('/v2/charge') >= 0, 'charge tercatat di api_logs');
  assert(urls.indexOf('/v2/INV-E2E-1/status') >= 0, 'cek status tercatat di api_logs');

  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
