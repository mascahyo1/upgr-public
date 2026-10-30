export const WEBHOOKS_DDL = `CREATE TABLE IF NOT EXISTS webhooks (
  id VARCHAR(64) PRIMARY KEY,
  credential_id VARCHAR(64) NOT NULL,
  nama VARCHAR(100) NOT NULL DEFAULT '',
  url VARCHAR(500) NOT NULL,
  prefix VARCHAR(20) NOT NULL DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  verify_token VARCHAR(200) NOT NULL DEFAULT '',
  deskripsi VARCHAR(500) NOT NULL DEFAULT '',
  created_at VARCHAR(32) NOT NULL,
  updated_at VARCHAR(32) NOT NULL,
  INDEX idx_webhooks_cred (credential_id),
  CONSTRAINT fk_wh_cred FOREIGN KEY (credential_id) REFERENCES credentials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export interface WebhookRow {
  id: string
  credential_id: string
  nama: string
  url: string
  prefix: string
  is_active: boolean
  verify_token: string
  deskripsi: string
  created_at: string
  updated_at: string
}

export function toWh(r: any): WebhookRow {
  return {
    id: r.id,
    credential_id: r.credential_id,
    nama: r.nama ?? '',
    url: r.url,
    prefix: r.prefix ?? '',
    is_active: r.is_active ? true : false,
    verify_token: r.verify_token ?? '',
    deskripsi: r.deskripsi ?? '',
    created_at: r.created_at,
    updated_at: r.updated_at
  }
}
