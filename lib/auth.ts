import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { criarClienteServidor } from './supabase/server'
import type { Perfil } from './types'

// Perfil do usuário logado (ou null). cache() evita buscar duas
// vezes na mesma renderização (layout + página).
export const obterPerfil = cache(async (): Promise<Perfil | null> => {
  const supabase = criarClienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, email, nome, role, lojas')
    .eq('id', user.id)
    .maybeSingle()

  return (data as Perfil | null) ?? null
})

/** Para páginas: manda embora quem não é admin. */
export async function exigirAdminPagina(): Promise<Perfil> {
  const perfil = await obterPerfil()
  if (!perfil) redirect('/login?erro=sem-perfil')
  if (perfil.role !== 'admin') redirect('/gerente')
  return perfil
}

/** Para server actions: lança erro se não for admin. */
export async function exigirAdmin(): Promise<Perfil> {
  const perfil = await obterPerfil()
  if (!perfil || perfil.role !== 'admin') {
    throw new Error('Acesso negado: somente o RH pode fazer isso.')
  }
  return perfil
}
