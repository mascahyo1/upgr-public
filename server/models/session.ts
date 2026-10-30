export const SESSIONS_DDL = `CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) PRIMARY KEY,
  area VARCHAR(16) NOT NULL DEFAULT 'tenant',
  user_id VARCHAR(64) NOT NULL DEFAULT '',
  created_at VARCHAR(32) NOT NULL,
  expires_at BIGINT NOT NULL,
  INDEX idx_sessions_exp (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export interface SessionRow {
  id: string
  area: string
  user_id: string
  created_at: string
  expires_at: number
}
