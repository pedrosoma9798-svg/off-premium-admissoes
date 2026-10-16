'use server'

import { revalidatePath } from 'next/cache'
import { exigirAdmin } from '@/lib/auth'
import { criarClienteServidor } from '@/lib/supabase/server'
import type { EstadoForm } from '@/lib/types'

// Lojas: criar, renomear, ativar/desativar. O cliente é o do usuário
// logado; o RLS só deixa admin escrever. Renomear propaga sozinho para
// admissões (FK ON UPDATE CASCADE) e perfis (trigger no banco).

// Padroniza: maiúsculas, espaços simples.
const normalizar = (nome: string) => nome.trim().replace(/\s+/g, ' ').toUpperCase()

function revalidar() {
  revalidatePath('/admin', 'layout')
  revalidatePath('/gerente')
}

export async function criarLoja(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  try {
    await exigirAdmin()
  } catch (e) {
    return { erro: (e as Error).message }
  }

  const nome = normalizar(String(formData.get('nome') ?? ''))
  if (!nome) return { erro: 'Informe o nome da loja.' }

  const supabase = criarClienteServidor()
  const { error } = await supabase.from('lojas').insert({ nome })
  if (error) return { erro: error.code === '23505' ? 'Já existe uma loja com esse nome.' : 'Não foi possível criar a loja.' }

  revalidar()
  return { ok: `Loja “${nome}” criada.` }
}

export async function renomearLoja(nomeAtual: string, _estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  try {
    await exigirAdmin()
  } catch (e) {
    return { erro: (e as Error).message }
  }

  const novo = normalizar(String(formData.get('nome') ?? ''))
  if (!novo) return { erro: 'O nome não pode ficar vazio.' }
  if (novo === nomeAtual) return {}

  const supabase = criarClienteServidor()
  const { error } = await supabase.from('lojas').update({ nome: novo }).eq('nome', nomeAtual)
  if (error) return { erro: error.code === '23505' ? 'Já existe uma loja com esse nome.' : 'Não foi possível renomear.' }

  revalidar()
  return { ok: 'Nome atualizado.' }
}

export async function alternarLoja(formData: FormData): Promise<void> {
  await exigirAdmin()
  const nome = String(formData.get('nome') ?? '')
  const ativa = formData.get('ativa') === 'true'

  const supabase = criarClienteServidor()
  const { error } = await supabase.from('lojas').update({ ativa }).eq('nome', nome)
  if (error) throw new Error('Não foi possível alterar a loja.')

  revalidar()
}
