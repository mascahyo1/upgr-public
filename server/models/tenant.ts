export const TENANTS_DDL = `CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(64) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL DEFAULT '',
  deskripsi VARCHAR(500) NOT NULL DEFAULT '',
  status VARCHAR(16) NOT NULL DEFAULT 'aktif',
  created_by VARCHAR(64) NOT NULL DEFAULT 'provider',
  created_at VARCHAR(32) NOT NULL,
  updated_at VARCHAR(32) NOT NULL,
  UNIQUE KEY uq_tenant_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

export interface TenantRow {
  id: string
  nama: string
  email: string
  deskripsi: string
  status: string
  created_by: string
  created_at: string
  updated_at: string
}

export function toTenant(r: any): TenantRow {
  return {
    id: r.id,
    nama: r.nama,
    email: r.email,
    deskripsi: r.deskripsi ?? '',
    status: r.status,
    created_by: r.created_by ?? 'provider',
    created_at: r.created_at,
    updated_at: r.updated_at
  }
}
