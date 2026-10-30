export const KONFIGURASI_DDL = `CREATE TABLE IF NOT EXISTS konfigurasi (
  id VARCHAR(64) PRIMARY KEY,
  kode VARCHAR(50) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  type VARCHAR(16) NOT NULL DEFAULT 'text',
  value VARCHAR(500) NOT NULL DEFAULT '',
  deskripsi VARCHAR(500) NOT NULL DEFAULT '',
  created_at VARCHAR(32) NOT NULL,
  updated_at VARCHAR(32) NOT NULL,
  UNIQUE KEY uq_konfig_kode (kode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export interface KonfigRow {
  id: string
  kode: string
  nama: string
  type: string
  value: string
  deskripsi: string
  created_at: string
  updated_at: string
}

export function toKonfig(r: any): KonfigRow {
  return {
    id: r.id,
    kode: r.kode,
    nama: r.nama,
    type: r.type,
    value: r.value ?? '',
    deskripsi: r.deskripsi ?? '',
    created_at: r.created_at,
    updated_at: r.updated_at
  }
}
