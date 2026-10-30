// Tabel penampung simulasi webhook (catcher ala webhook.site, milik sendiri).
// POST publik .../simulator/terima mencatat header+body apa adanya (dipotong
// 8000 char). Lihat/hapus butuh sesi tenant. Maks 200 baris, tertua dibuang.
export const WEBHOOK_SIMULASI_DDL = `CREATE TABLE IF NOT EXISTS webhook_simulasi (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL DEFAULT '',
  ip VARCHAR(64) NOT NULL DEFAULT '',
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  method VARCHAR(10) NOT NULL DEFAULT '',
  url VARCHAR(500) NOT NULL DEFAULT '',
  request_header TEXT NOT NULL,
  request_body TEXT NOT NULL,
  response_status INT NOT NULL DEFAULT 0,
  response_header TEXT NOT NULL,
  response_body TEXT NOT NULL,
  created_at VARCHAR(32) NOT NULL,
  INDEX idx_simulasi_tenant (tenant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export interface SimulasiRow {
  id: string
  tenant_id: string
  ip: string
  user_agent: string
  method: string
  url: string
  request_header: string
  request_body: string
  response_status: number
  response_header: string
  response_body: string
  created_at: string
}
