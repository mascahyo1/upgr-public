export const WEBHOOK_LOGS_DDL = `CREATE TABLE IF NOT EXISTS webhook_logs (
  id VARCHAR(64) PRIMARY KEY,
  credential_id VARCHAR(64) NOT NULL,
  webhook_id VARCHAR(64) NOT NULL DEFAULT '',
  nama VARCHAR(100) NOT NULL DEFAULT '',
  url VARCHAR(500) NOT NULL DEFAULT '',
  event VARCHAR(100) NOT NULL DEFAULT 'Uji kirim',
  hasil VARCHAR(16) NOT NULL DEFAULT 'gagal',
  http INT NULL,
  pesan VARCHAR(2000) NOT NULL DEFAULT '',
  ip VARCHAR(64) NOT NULL DEFAULT '',
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  request_header TEXT NOT NULL,
  request_body TEXT NOT NULL,
  response_header TEXT NOT NULL,
  response_body TEXT NOT NULL,
  created_at VARCHAR(32) NOT NULL,
  INDEX idx_weblog_cred (credential_id),
  CONSTRAINT fk_wl_cred FOREIGN KEY (credential_id) REFERENCES credentials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export const API_LOGS_DDL = `CREATE TABLE IF NOT EXISTS api_logs (
  id CHAR(36) PRIMARY KEY,
  credential_id VARCHAR(64) NOT NULL,
  provider VARCHAR(30) NOT NULL DEFAULT '',
  method VARCHAR(10) NOT NULL DEFAULT 'GET',
  url VARCHAR(500) NOT NULL DEFAULT '',
  http INT NULL,
  durasi_ms INT NULL,
  hasil VARCHAR(16) NOT NULL DEFAULT 'gagal',
  pesan VARCHAR(2000) NOT NULL DEFAULT '',
  request_ringkas VARCHAR(2000) NOT NULL DEFAULT '',
  response_ringkas VARCHAR(2000) NOT NULL DEFAULT '',
  ip VARCHAR(64) NOT NULL DEFAULT '',
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  request_header TEXT NOT NULL,
  request_body TEXT NOT NULL,
  response_header TEXT NOT NULL,
  response_body TEXT NOT NULL,
  created_at VARCHAR(32) NOT NULL,
  INDEX idx_apilog_cred (credential_id),
  CONSTRAINT fk_al_cred FOREIGN KEY (credential_id) REFERENCES credentials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export const PROVIDER_LOGS_DDL = `CREATE TABLE IF NOT EXISTS provider_logs (
  id CHAR(36) PRIMARY KEY,
  credential_id VARCHAR(64) NOT NULL,
  provider VARCHAR(30) NOT NULL DEFAULT '',
  method VARCHAR(10) NOT NULL DEFAULT 'POST',
  url VARCHAR(500) NOT NULL DEFAULT '',
  http INT NULL,
  durasi_ms INT NULL,
  hasil VARCHAR(16) NOT NULL DEFAULT 'gagal',
  pesan VARCHAR(2000) NOT NULL DEFAULT '',
  ip VARCHAR(64) NOT NULL DEFAULT '',
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  request_header TEXT NOT NULL,
  request_body TEXT NOT NULL,
  response_header TEXT NOT NULL,
  response_body TEXT NOT NULL,
  created_at VARCHAR(32) NOT NULL,
  INDEX idx_provlog_cred (credential_id),
  CONSTRAINT fk_pl_cred FOREIGN KEY (credential_id) REFERENCES credentials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export interface LogRow {
  id: string
  credential_id: string
  webhook_id: string
  nama: string
  url: string
  event: string
  hasil: string
  http: number | null
  pesan: string
  ip: string
  user_agent: string
  request_header: string
  request_body: string
  response_header: string
  response_body: string
  created_at: string
}

export function toLog(r: any): LogRow {
  return {
    id: r.id,
    credential_id: r.credential_id,
    webhook_id: r.webhook_id ?? '',
    nama: r.nama ?? '',
    url: r.url ?? '',
    event: r.event ?? 'Uji kirim',
    hasil: r.hasil,
    http: r.http ?? null,
    pesan: r.pesan ?? '',
    ip: r.ip ?? '',
    user_agent: r.user_agent ?? '',
    request_header: r.request_header ?? '',
    request_body: r.request_body ?? '',
    response_header: r.response_header ?? '',
    response_body: r.response_body ?? '',
    created_at: r.created_at
  }
}
