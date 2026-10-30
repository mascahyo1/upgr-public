// Pecahan logika inline server/api/notify/midtrans/[credId].post.ts — bentuk payload.
// Sumber: blok "orderId/statusCode/grossAmount/signatureKey" + pesan
//   'Field order_id/status_code/gross_amount/signature_key tidak lengkap.'
// Tidak ada import-lama (cek inline di controller); verifikasi signature SHA512 +
// parse raw-body tetap di controller. Bentuk baku: default export { errs, clean }.
export interface NotifyMidtransInput {
  order_id?: unknown
  status_code?: unknown
  gross_amount?: unknown
  signature_key?: unknown
}

export function validateNotifyMidtrans(input: NotifyMidtransInput) {
  const errs: Record<string, string> = {}
  const order_id = String(input.order_id ?? '')
  const status_code = String(input.status_code ?? '')
  const gross_amount = String(input.gross_amount ?? '')
  const signature_key = String(input.signature_key ?? '')

  if (!order_id || !status_code || !gross_amount || !signature_key) {
    errs.payload = 'Field order_id/status_code/gross_amount/signature_key tidak lengkap.'
  }

  return { errs, clean: { order_id, status_code, gross_amount, signature_key } }
}

export default validateNotifyMidtrans
