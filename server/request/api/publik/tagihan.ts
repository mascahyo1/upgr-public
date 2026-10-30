// Validasi INVOICE Midtrans GoPay QRIS dinamis (stateless proxy).
// Controller:
// - server/routes/api_external/publik/tagihan/midtrans/buat/index.post.ts
// - server/routes/api_external/publik/tagihan/midtrans/status/index.post.ts
// payment_method: "gopay_qris_dinamis" (charge QRIS GoPay langsung)
// atau "snap" (halaman bayar Midtrans Snap, semua channel aktif).
//   -> Midtrans: payment_type "qris" + qris.acquirer "gopay" (QR dinamis per transaksi).
// Semua field cust_* nullable: dikirim ke Midtrans hanya bila diisi
// (Midtrans mencatatnya; respons charge/status TIDAK mengembalikan items/customer).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface InvoiceBuatInput {
  credential_id?: unknown
  payment_method?: unknown
  items?: unknown
  amount?: unknown
  kode_trx?: unknown
  cust_name?: unknown
  cust_email?: unknown
  cust_address?: unknown
  cust_phone_number?: unknown
  expiry_menit?: unknown
}

export interface InvoiceItem {
  id: string
  price: number
  quantity: number
  name: string
}

export function validateInvoiceBuat(input: InvoiceBuatInput) {
  const errs: Record<string, string> = {}
  const credentialId = String(input.credential_id ?? '').trim()
  const paymentMethod = String(input.payment_method ?? '').trim().toLowerCase()
  const kodeTrx = String(input.kode_trx ?? '').trim()
  const amount = Number(input.amount)
  const custName = String(input.cust_name ?? '').trim()
  const custEmail = String(input.cust_email ?? '').trim()
  const custAddress = String(input.cust_address ?? '').trim()
  const custPhone = String(input.cust_phone_number ?? '').trim()
  const expiryMenit = input.expiry_menit === undefined || input.expiry_menit === null || input.expiry_menit === ''
    ? null
    : Number(input.expiry_menit)

  if (!credentialId) errs.credential_id = 'credential_id wajib diisi.'
  else if (!UUID_RE.test(credentialId)) errs.credential_id = 'credential_id harus UUID valid.'
  if (paymentMethod !== 'gopay_qris_dinamis' && paymentMethod !== 'snap') {
    errs.payment_method = 'payment_method hanya mendukung "gopay_qris_dinamis" dan "snap".'
  }
  if (!kodeTrx) errs.kode_trx = 'kode_trx wajib diisi.'
  else if (kodeTrx.length > 50) errs.kode_trx = 'kode_trx maksimal 50 karakter.'
  else if (!/^[A-Za-z0-9_-]+$/.test(kodeTrx)) errs.kode_trx = 'kode_trx hanya huruf, angka, dash, underscore.'
  if (!Number.isFinite(amount) || amount <= 0) {
    errs.amount = 'amount wajib angka lebih dari 0.'
  }

  const items: InvoiceItem[] = []
  if (input.items !== undefined && input.items !== null) {
    if (!Array.isArray(input.items)) {
      errs.items = 'items harus array.'
    } else {
      input.items.forEach((raw: any, i: number) => {
        if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
          errs[`items[${i}]`] = `items[${i}] harus objek.`
          return
        }
        const price = Number(raw.price)
        const quantity = Number(raw.quantity)
        const name = String(raw.name ?? '').trim()
        const id = String(raw.id ?? '').trim() || `brg-${i + 1}`
        if (!name) errs[`items[${i}].name`] = `items[${i}].name wajib diisi.`
        else if (name.length > 100) errs[`items[${i}].name`] = `items[${i}].name maksimal 100 karakter.`
        if (!Number.isFinite(price) || price <= 0) errs[`items[${i}].price`] = `items[${i}].price wajib angka lebih dari 0.`
        if (!Number.isInteger(quantity) || quantity < 1) errs[`items[${i}].quantity`] = `items[${i}].quantity wajib bilangan bulat minimal 1.`
        if (Object.keys(errs).length === 0 || !Object.keys(errs).some((k) => k.startsWith(`items[${i}]`))) {
          items.push({ id, price, quantity, name })
        }
      })
    }
  }

  if (custEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(custEmail)) {
    errs.cust_email = 'cust_email tidak valid.'
  }
  if (expiryMenit !== null && (!Number.isInteger(expiryMenit) || expiryMenit <= 0)) {
    errs.expiry_menit = 'expiry_menit wajib bilangan bulat positif (menit).'
  }

  return {
    errs,
    clean: {
      credential_id: credentialId,
      payment_method: paymentMethod,
      items,
      amount: Number.isFinite(amount) ? amount : 0,
      kode_trx: kodeTrx,
      cust_name: custName,
      cust_email: custEmail,
      cust_address: custAddress,
      cust_phone_number: custPhone,
      expiry_menit: expiryMenit
    }
  }
}

export function validateInvoiceStatus(input: { credential_id?: unknown, kode_trx?: unknown }) {
  const errs: Record<string, string> = {}
  const credentialId = String(input.credential_id ?? '').trim()
  const kodeTrx = String(input.kode_trx ?? '').trim()
  if (!credentialId) errs.credential_id = 'credential_id wajib diisi.'
  else if (!UUID_RE.test(credentialId)) errs.credential_id = 'credential_id harus UUID valid.'
  if (!kodeTrx) errs.kode_trx = 'kode_trx wajib diisi.'
  return { errs, clean: { credential_id: credentialId, kode_trx: kodeTrx } }
}

export default validateInvoiceBuat
