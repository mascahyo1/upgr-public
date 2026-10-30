// E2E slice auth UPGR Nuxt: throttle 10x/menit + Turnstile + sesi MySQL
// Jalankan: node tests/e2e/auth.e2e.cjs
const BASE = 'http://127.0.0.1:3200';

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

async function post(path, body, cookie) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body ?? {})
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data, setCookie: res.headers.get('set-cookie') || '' };
}

async function get(path, cookie) {
  const res = await fetch(`${BASE}${path}`, { headers: cookie ? { Cookie: cookie } : {} });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

(async () => {
  step('0. reset + seed user');
  await post('/api_web/_test/reset', {});
  const seed = await post('/api_web/_test/seed-user', {});
  assert(seed.status === 200 && seed.data?.data?.email === 'uji@example.com', 'seed user uji');

  step('1. captcha kosong ditolak');
  const noCap = await post('/api_web/auth/login', { area: 'tenant', email: 'uji@example.com', password: 'sandi-uji-123', captcha: '' });
  assert(noCap.status === 422, 'captcha kosong 422');

  step('2. kredensial salah ditolak');
  const wrong = await post('/api_web/auth/login', { area: 'tenant', email: 'uji@example.com', password: 'salah', captcha: 'dummy' });
  assert(wrong.status === 401, 'password salah 401');

  step('3. login benar + sesi di DB');
  const ok = await post('/api_web/auth/login', { area: 'tenant', email: 'uji@example.com', password: 'sandi-uji-123', captcha: 'dummy' });
  assert(ok.status === 200 && ok.data?.data?.nama === 'Pengguna Uji', 'login 200');
  const cookie = (ok.setCookie.split(', ').find((c) => c.startsWith('upgr_session=')) || '').split(';')[0];
  assert(cookie.startsWith('upgr_session='), 'cookie sesi diset');
  const me = await get('/api_web/auth/me', cookie);
  assert(me.status === 200 && me.data?.data?.email === 'uji@example.com', 'me 200 dari sesi DB');
  const out = await post('/api_web/auth/logout', {}, cookie);
  assert(out.status === 200, 'logout 200');
  const meAfter = await get('/api_web/auth/me', cookie);
  assert(meAfter.status === 401, 'sesi terhapus setelah logout');

  step('4. throttle 10x per menit');
  await post('/api_web/_test/reset', {});
  await post('/api_web/_test/seed-user', {});
  const codes = [];
  for (let i = 0; i < 11; i++) {
    const r = await post('/api_web/auth/login', { area: 'tenant', email: 'x@y.z', password: 'salah', captcha: 'dummy' });
    codes.push(r.status);
    if (i === 10) {
      assert(r.status === 429, 'percobaan ke-11 ditolak 429');
      assert((r.data?.data?.retryAfter ?? 0) > 0, '429 membawa retryAfter');
    }
  }
  assert(codes.slice(0, 10).every((c) => c === 401), '10 percobaan pertama lolos throttle (401 kredensial)');

  console.log(failures === 0 ? '\nHASIL: SEMUA PASS' : `\nHASIL: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
