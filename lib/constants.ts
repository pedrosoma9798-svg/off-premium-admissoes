// ─────────────────────────────────────────────────────────────
// Listas fixas do sistema. Se mudar algo aqui, mude também os
// CHECKs correspondentes em supabase/schema.sql.
//
// As LOJAS não ficam aqui: estão na tabela "lojas" e o admin
// edita pelo app em /admin/lojas.
// ─────────────────────────────────────────────────────────────

export const CARGOS = [
  'Vendedor',
  'Vendedor Extra Natal',
  'ADM',
  'ADM Extra Natal',
  'ASL', // Auxiliar de Loja
  'Gerente',
] as const

export const STATUS = ['Pendente', 'Data confirmada', 'Desistente', 'Iniciado'] as const

export const ROLES = ['admin', 'gerente', 'supervisor'] as const

export type Cargo = (typeof CARGOS)[number]
export type Status = (typeof STATUS)[number]
export type Role = (typeof ROLES)[number]

// Rótulos legíveis para os papéis
export const ROTULO_ROLE: Record<Role, string> = {
  admin: 'Admin (RH)',
  gerente: 'Gerente',
  supervisor: 'Supervisor',
}

// Cores semânticas dos chips de status (definidas na especificação)
export const COR_STATUS: Record<Status, string> = {
  Pendente: 'bg-amber-100 text-amber-800',
  'Data confirmada': 'bg-emerald-100 text-emerald-800',
  Desistente: 'bg-red-100 text-red-800',
  Iniciado: 'bg-gray-200 text-gray-600',
}

export const FUSO = 'America/Sao_Paulo'

// Type guards usados na validação das server actions
export const ehCargo = (v: unknown): v is Cargo => CARGOS.includes(v as Cargo)
export const ehStatus = (v: unknown): v is Status => STATUS.includes(v as Status)
export const ehRole = (v: unknown): v is Role => ROLES.includes(v as Role)
