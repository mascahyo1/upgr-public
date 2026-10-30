// Tambah expiry_menit ke contoh body + deskripsi request invoice di Hoppscotch.
const { Client } = require('/tmp/hoppupd/node_modules/pg');
(async () => {
  const client = new Client({
    host: process.env.HOPPHOST || '127.0.0.1', port: 5432,
    user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD, database: process.env.POSTGRES_DB
  });
  await client.connect();
  const id = 'c6599f385bfef19aada6bce84';
  const { rows } = await client.query('SELECT request FROM "TeamRequest" WHERE id = $1', [id]);
  const req = rows[0].request;
  const body = JSON.parse(req.body.body);
  body.expiry_menit = 60;
  req.body.body = JSON.stringify(body, null, 2);
  req.description = (req.description || '').replace('Batas 20x/menit per IP.',
    'expiry_menit opsional (bilangan bulat menit, mis. 60): diteruskan ke Midtrans custom_expiry; tanpa itu QR kedaluwarsa ~15 menit.\nBatas 20x/menit per IP.');
  for (const k of Object.keys(req.responses || {})) {
    const o = req.responses[k].originalRequest;
    try {
      const b = JSON.parse(o.body.body);
      if (b.payment_method) { b.expiry_menit = 60; o.body.body = JSON.stringify(b, null, 2); }
    } catch {}
  }
  req.responses['Expiry salah'] = {
    body: JSON.stringify({ error: true, url: '<<baseUrl>>/api_external/publik/tagihan/midtrans/buat', statusCode: 422, statusMessage: 'Server Error', message: '', data: { errors: { expiry_menit: 'expiry_menit wajib bilangan bulat positif (menit).' } } }, null, 2),
    code: 422, name: 'Expiry salah', status: 'Unprocessable Entity',
    headers: [{ key: 'content-type', value: 'application/json' }],
    originalRequest: {
      v: '6', auth: req.auth,
      body: { body: JSON.stringify({ credential_id: '<<credId>>', payment_method: 'gopay_qris_dinamis', amount: 15000, kode_trx: 'INV-1', expiry_menit: 'lama' }, null, 2), contentType: 'application/json' },
      name: req.name, method: req.method, params: [], headers: req.headers, endpoint: req.endpoint, requestVariables: []
    }
  };
  await client.query('UPDATE "TeamRequest" SET request = $1::jsonb WHERE id = $2', [JSON.stringify(req), id]);
  console.log('hoppscotch invoice: expiry_menit ditambah');
  await client.end();
})().catch((e) => { console.error('FATAL: ' + e.message); process.exit(1); });
