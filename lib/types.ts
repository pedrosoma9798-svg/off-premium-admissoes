import type { Cargo, Role, Status } from './constants'

export interface Admissao {
  id: string
  nome: string
  cargo: Cargo
  loja: string
  data_aprovacao: string // "AAAA-MM-DD"
  data_inicio: string | null // "AAAA-MM-DD"
  status: Status
  created_at: string
  updated_at: string
}

export interface Perfil {
  id: string
  email: string
  nome: string
  role: Role
  lojas: string[]
}

export interface Loja {
  nome: string
  ativa: boolean
  created_at: string
}

// Estado devolvido pelas server actions aos formulários
export interface EstadoForm {
  erro?: string
  ok?: string
}
