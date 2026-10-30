export const USERS_DDL = `CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  area VARCHAR(16) NOT NULL DEFAULT 'tenant',
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL DEFAULT '',
  nama VARCHAR(100) NOT NULL DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at VARCHAR(32) NOT NULL,
  updated_at VARCHAR(32) NOT NULL,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export interface UserRow {
  id: string
  area: string
  email: string
  password_hash: string
  nama: string
  is_active: number
  created_at: string
  updated_at: string
}
