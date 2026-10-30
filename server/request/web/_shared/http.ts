// Helper lintas-portal: validasi URL http(s).
// Pindahan verbatim dari server/utils/validate.ts (isHttpUrl).
// Dipakai validateWebhook; JANGAN diduplikasi di file aksi.
export function isHttpUrl(u: string) {
  const m = /^https?:\/\/([^/\s]+)(\/\S*)?$/.exec(u)
  if (!m) return false
  const host = (m[1] ?? '').split(':')[0]?.toLowerCase() ?? ''
  if (host === 'localhost') return true
  return host.indexOf('.') >= 0
}
