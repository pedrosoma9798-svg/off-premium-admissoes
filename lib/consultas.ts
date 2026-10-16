import 'server-only'
import { CARGOS, STATUS } from './constants'
import { criarClienteServidor } from './supabase/server'
import type { Admissao, Loja } from './types'

export interface FiltrosLista {
  q?: string
  loja?: string
  cargo?: string
  status?: string
}

// Escapa % e _ para que a busca trate o texto literalmente no ILIKE.
const escaparLike = (t: string) => t.replace(/[\\%_]/g, (c) => `\\${c}`)

/** Admissões para as listas do admin (ativas ou histórico). */
export async function listarAdmissoes(tipo: 'ativas' | 'historico', filtros: FiltrosLista): Promise<Admissao[]> {
  const supabase = criarClienteServidor()
  let consulta = supabase.from('admissoes').select('*')

  if (tipo === 'ativas') {
    consulta = consulta.neq('status', 'Iniciado')
    if (filtros.status && STATUS.includes(filtros.status as never) && filtros.status !== 'Iniciado') {
      consulta = consulta.eq('status', filtros.status)
    }
    consulta = consulta.order('data_aprovacao', { ascending: false }).order('created_at', { ascending: false })
  } else {
    consulta = consulta
      .eq('status', 'Iniciado')
      .order('data_inicio', { ascending: false, nullsFirst: false })
      .order('data_aprovacao', { ascending: false })
  }

  if (filtros.q) consulta = consulta.ilike('nome', `%${escaparLike(filtros.q)}%`)
  if (filtros.loja) consulta = consulta.eq('loja', filtros.loja)
  if (filtros.cargo && CARGOS.includes(filtros.cargo as never)) consulta = consulta.eq('cargo', filtros.cargo)

  const { data, error } = await consulta
  if (error) throw new Error('Não foi possível carregar as admissões.')
  return (data ?? []) as Admissao[]
}

/** Lojas cadastradas. */
export async function listarLojas(somenteAtivas = false): Promise<Loja[]> {
  const supabase = criarClienteServidor()
  let consulta = supabase.from('lojas').select('*').order('nome')
  if (somenteAtivas) consulta = consulta.eq('ativa', true)
  const { data, error } = await consulta
  if (error) throw new Error('Não foi possível carregar as lojas.')
  return (data ?? []) as Loja[]
}
