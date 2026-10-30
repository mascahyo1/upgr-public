// Slot validasi untuk POST /api_external/publik/verify.
// Sumber: server/api/verify.post.ts — controller TIDAK memvalidasi body apa pun
// (auth via requireTenantKey + rate-limit 20/menit per IP).
// Tidak ada import-lama; file ini cadangan slot agar tiap endpoint publik
// punya pasangan request/api/publik. Bentuk baku: default export { errs, clean }.
export interface VerifyInput {
  [k: string]: unknown
}

export function validateVerify(_input?: VerifyInput) {
  const errs: Record<string, string> = {}
  return { errs, clean: {} }
}

export default validateVerify
