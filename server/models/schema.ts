import { CREDENTIALS_DDL } from './credential'
import { WEBHOOKS_DDL } from './webhook'
import { WEBHOOK_LOGS_DDL, API_LOGS_DDL, PROVIDER_LOGS_DDL } from './log'
import { TENANT_API_KEYS_DDL } from './api-key'
import { TENANTS_DDL } from './tenant'
import { KONFIGURASI_DDL } from './konfigurasi'
import { USERS_DDL } from './user'
import { SESSIONS_DDL } from './session'
import { WEBHOOK_SIMULASI_DDL } from './simulasi'

const AUTH_ATTEMPTS_DDL = `CREATE TABLE IF NOT EXISTS auth_attempts (
  \`key\` VARCHAR(128) NOT NULL,
  ts BIGINT NOT NULL,
  INDEX idx_auth_key_ts (\`key\`, ts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

// Tabel warisan yang sudah tidak dipakai: dihapus bila ada.
const DROP_TENANT_PROFIL = `DROP TABLE IF EXISTS tenant_profil`

// Urutan TETAP: credentials dulu karena webhooks/webhook_logs/api_logs/
// provider_logs punya FK ke credentials. Sama seperti DDL lama di mysql.ts.
export const SCHEMA = [
  CREDENTIALS_DDL,
  WEBHOOKS_DDL,
  WEBHOOK_LOGS_DDL,
  API_LOGS_DDL,
  PROVIDER_LOGS_DDL,
  AUTH_ATTEMPTS_DDL,
  USERS_DDL,
  TENANT_API_KEYS_DDL,
  TENANTS_DDL,
  KONFIGURASI_DDL,
  DROP_TENANT_PROFIL,
  SESSIONS_DDL,
  WEBHOOK_SIMULASI_DDL
].join(';\n')

// Kolom TEXT detail header/body untuk database yang dibuat sebelum kolom itu
// ada di DDL (CREATE TABLE IF NOT EXISTS tidak mengubah tabel lama).
export const BACKFILL_COLUMNS: string[] = [
  `ALTER TABLE credentials ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT 'aktif'`,
  `ALTER TABLE webhook_simulasi ADD COLUMN tenant_id VARCHAR(64) NOT NULL DEFAULT ''`,
  `ALTER TABLE webhook_simulasi ADD COLUMN response_status INT NOT NULL DEFAULT 0`,
  `ALTER TABLE webhook_simulasi ADD COLUMN response_header TEXT NOT NULL`,
  `ALTER TABLE webhook_simulasi ADD COLUMN response_body TEXT NOT NULL`,
  `ALTER TABLE webhook_simulasi ADD COLUMN method VARCHAR(10) NOT NULL DEFAULT ''`,
  `ALTER TABLE webhook_simulasi ADD COLUMN url VARCHAR(500) NOT NULL DEFAULT ''`,
  `ALTER TABLE webhook_simulasi ADD COLUMN user_agent VARCHAR(500) NOT NULL DEFAULT ''`,
  `ALTER TABLE webhook_logs ADD COLUMN ip VARCHAR(64) NOT NULL DEFAULT ''`,
  `ALTER TABLE webhook_logs ADD COLUMN user_agent VARCHAR(500) NOT NULL DEFAULT ''`,
  `ALTER TABLE api_logs ADD COLUMN ip VARCHAR(64) NOT NULL DEFAULT ''`,
  `ALTER TABLE api_logs ADD COLUMN user_agent VARCHAR(500) NOT NULL DEFAULT ''`,
  `ALTER TABLE provider_logs ADD COLUMN ip VARCHAR(64) NOT NULL DEFAULT ''`,
  `ALTER TABLE provider_logs ADD COLUMN user_agent VARCHAR(500) NOT NULL DEFAULT ''`,
  'ALTER TABLE api_logs ADD COLUMN request_header TEXT NOT NULL',
  'ALTER TABLE api_logs ADD COLUMN request_body TEXT NOT NULL',
  'ALTER TABLE api_logs ADD COLUMN response_header TEXT NOT NULL',
  'ALTER TABLE api_logs ADD COLUMN response_body TEXT NOT NULL',
  'ALTER TABLE webhook_logs ADD COLUMN request_header TEXT NOT NULL',
  'ALTER TABLE webhook_logs ADD COLUMN request_body TEXT NOT NULL',
  'ALTER TABLE webhook_logs ADD COLUMN response_header TEXT NOT NULL',
  'ALTER TABLE webhook_logs ADD COLUMN response_body TEXT NOT NULL',
  'ALTER TABLE provider_logs ADD COLUMN request_header TEXT NOT NULL',
  'ALTER TABLE provider_logs ADD COLUMN request_body TEXT NOT NULL',
  'ALTER TABLE provider_logs ADD COLUMN response_header TEXT NOT NULL',
  'ALTER TABLE provider_logs ADD COLUMN response_body TEXT NOT NULL'
]
