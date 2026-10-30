export const CREDENTIALS_DDL = `CREATE TABLE IF NOT EXISTS credentials (
  id VARCHAR(64) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  provider VARCHAR(30) NOT NULL,
  is_production TINYINT(1) NOT NULL DEFAULT 0,
  merchant_id VARCHAR(100) NOT NULL DEFAULT '',
  \`key\` VARCHAR(200) NOT NULL,
  secret VARCHAR(200) NOT NULL,
  webhook_verify_token VARCHAR(200) NOT NULL DEFAULT '',
  deskripsi VARCHAR(500) NOT NULL DEFAULT '',
  status VARCHAR(10) NOT NULL DEFAULT 'aktif',
  created_at VARCHAR(32) NOT NULL,
  updated_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export interface CredentialRow {
  id: string
  nama: string
  provider: string
  is_production: boolean
  merchant_id: string
  key: string
  secret: string
  webhook_verify_token: string
  deskripsi: string
  status: string
  created_at: string
  updated_at: string
}

export function toCredential(r: any): CredentialRow {
  return {
    id: r.id,
    nama: r.nama,
    provider: r.provider,
    is_production: r.is_production ? true : false,
    merchant_id: r.merchant_id,
    key: r.key,
    secret: r.secret,
    webhook_verify_token: r.webhook_verify_token,
    deskripsi: r.deskripsi,
    status: r.status === 'nonaktif' ? 'nonaktif' : 'aktif',
    created_at: r.created_at,
    updated_at: r.updated_at
  }
}
