export const DEFAULT_TENANT_ID = '01a18296-88bb-7cd3-888e-b69cb5214659'

export const TENANT_API_KEYS_DDL = `CREATE TABLE IF NOT EXISTS tenant_api_keys (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL DEFAULT '${DEFAULT_TENANT_ID}',
  name VARCHAR(100) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'aktif',
  \`key\` VARCHAR(200) NOT NULL,
  secret VARCHAR(200) NOT NULL,
  created_at VARCHAR(32) NOT NULL,
  updated_at VARCHAR(32) NOT NULL,
  UNIQUE KEY uq_api_key (\`key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export interface ApiKeyRow {
  id: string
  tenant_id: string
  name: string
  status: string
  key: string
  secret: string
  created_at: string
  updated_at: string
}

export function toApi(r: any): ApiKeyRow {
  return {
    id: r.id,
    tenant_id: r.tenant_id ?? DEFAULT_TENANT_ID,
    name: r.name,
    status: r.status,
    key: r.key,
    secret: r.secret,
    created_at: r.created_at,
    updated_at: r.updated_at
  }
}
