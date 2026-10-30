export function nowIso() {
  return new Date().toISOString()
}

export function newId(prefix: string) {
  return `${prefix}-` + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}

// Potong string log sampai 8000 karakter (satu-satunya batas ringkas).
export function cut8(v: unknown): string {
  return String(v ?? '').slice(0, 8000)
}

// Serialisasi body log: string apa adanya, null/undefined jadi ''.
export function bodyJson(d: any): string {
  try {
    if (typeof d === 'string') return d
    if (d === undefined || d === null) return ''
    return JSON.stringify(d) ?? ''
  } catch {
    return ''
  }
}

// Serialisasi headers apa adanya (untuk respons provider; header sensitif
// request selalu ditulis sebagai literal sensor di call site).
export function headersJson(h: any): string {
  try {
    if (!h) return ''
    const obj: Record<string, string> = {}
    if (typeof h.entries === 'function') {
      for (const [k, v] of h.entries()) obj[String(k)] = String(v)
    } else if (typeof h === 'object') {
      for (const k of Object.keys(h)) {
        const v: any = (h as any)[k]
        obj[k] = Array.isArray(v) ? v.join(', ') : String(v)
      }
    } else {
      return ''
    }
    return JSON.stringify(obj)
  } catch {
    return ''
  }
}

function censorValue(key: string, value: string): string {
  const k = key.toLowerCase().replace(/_/g, '-')
  if (k === 'authorization' || k.includes('verify-token')) return '***'
  return value
}

// Serialisasi headers dengan sensor: Authorization dan *-verify-token jadi '***'.
export function headersJsonCensored(h: any): string {
  try {
    if (!h) return ''
    const obj: Record<string, string> = {}
    if (typeof h.entries === 'function') {
      for (const [k, v] of h.entries()) obj[String(k)] = censorValue(String(k), String(v))
    } else if (typeof h === 'object') {
      for (const k of Object.keys(h)) {
        const v: any = (h as any)[k]
        obj[k] = censorValue(k, Array.isArray(v) ? v.join(', ') : String(v))
      }
    } else {
      return ''
    }
    return JSON.stringify(obj)
  } catch {
    return ''
  }
}

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'set-cookie', 'x-api-key'])

// Sensor headers request notifikasi: nilai sensitif jadi '[REDACTED]'.
export function safeHeaders(h: Record<string, string | string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of Object.keys(h)) {
    const v = h[k]
    const s = Array.isArray(v) ? v.join(', ') : String(v ?? '')
    out[k] = SENSITIVE_HEADERS.has(k.toLowerCase()) ? '[REDACTED]' : s
  }
  return out
}

// UUIDv7 (skill uuidv7): 48 bit unix-ms big-endian + versi 7 +
// varian 10xx + acak. Satu-satunya format untuk SETIAP ID baru.
export function uuidv7(): string {
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  const ms = Date.now()
  b[0] = Math.floor(ms / 2 ** 40) & 0xff
  b[1] = Math.floor(ms / 2 ** 32) & 0xff
  b[2] = Math.floor(ms / 2 ** 24) & 0xff
  b[3] = Math.floor(ms / 2 ** 16) & 0xff
  b[4] = Math.floor(ms / 2 ** 8) & 0xff
  b[5] = ms & 0xff
  b[6] = 0x70 | (b[6] & 0x0f)
  b[8] = 0x80 | (b[8] & 0x3f)
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
