import 'server-only'
import { criarClienteServidor } from './supabase/server'
import type { Admissao, Loja } from './types'

/**
 * Admissões para as listas do admin.
 * Traz o conjunto completo de uma vez: a filtragem acontece no
 * navegador, sem nova ida ao servidor a cada campo alterado.
 */
export async function listarAdmissoes(tipo: 'ativas' | 'historico'): Promise<Admissao[]> {
  const supabase = criarClienteServidor()
  let consulta = supabase.from('admissoes').select('*')

  if (tipo === 'ativas') {
    consulta = consulta
      .neq('status', 'Iniciado')
      .order('data_aprovacao', { ascending: false })
      .order('created_at', { ascending: false })
  } else {
    consulta = consulta
      .eq('status', 'Iniciado')
      .order('data_inicio', { ascending: false, nullsFirst: false })
      .order('data_aprovacao', { ascending: false })
  }

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
