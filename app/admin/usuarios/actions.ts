'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { exigirAdmin } from '@/lib/auth'
import { ehRole, type Role } from '@/lib/constants'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import type { EstadoForm } from '@/lib/types'

// ATENÇÃO: estas actions usam a service role key (ignora RLS).
// exigirAdmin() no início de cada uma é OBRIGATÓRIO.

const SENHA_MINIMA = 8

interface DadosUsuario {
  nome: string
  email: string
  senha: string
  role: Role
  lojas: string[]
}

function lerFormulario(formData: FormData): { dados?: DadosUsuario; erro?: string } {
  const nome = String(formData.get('nome') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const senha = String(formData.get('senha') ?? '')
  const role = String(formData.get('role') ?? '')
  const lojas = formData.getAll('lojas').map(String).filter(Boolean)

  if (!nome) return { erro: 'Informe o nome.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: 'Informe um e-mail válido.' }
  if (!ehRole(role)) return { erro: 'Escolha o papel.' }
  if (role !== 'admin' && lojas.length === 0) return { erro: 'Vincule pelo menos uma loja.' }

  // Admin vê tudo: não guarda lojas.
  return { dados: { nome, email, senha, role, lojas: role === 'admin' ? [] : lojas } }
}

function traduzirErroAuth(mensagem: string): string {
  if (/already.*registered|already exists/i.test(mensagem)) return 'Já existe uma conta com esse e-mail.'
  if (/password/i.test(mensagem)) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`
  return 'Não foi possível salvar o usuário. Tente de novo.'
}

export async function criarUsuario(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  try {
    await exigirAdmin()
  } catch (e) {
    return { erro: (e as Error).message }
  }

  const { dados, erro } = lerFormulario(formData)
  if (!dados) return { erro }
  if (dados.senha.length < SENHA_MINIMA) return { erro: `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.` }

  const admin = criarClienteAdmin()

  // 1) Conta no Auth, já confirmada (não há e-mail de confirmação).
  const { data: criado, error: erroAuth } = await admin.auth.admin.createUser({
    email: dados.email,
    password: dados.senha,
    email_confirm: true,
    user_metadata: { nome: dados.nome },
  })
  if (erroAuth || !criado.user) return { erro: traduzirErroAuth(erroAuth?.message ?? '') }

  // 2) Perfil. Se falhar, desfaz a conta para não sobrar usuário órfão.
  const { error: erroPerfil } = await admin.from('profiles').insert({
    id: criado.user.id,
    email: dados.email,
    nome: dados.nome,
    role: dados.role,
    lojas: dados.lojas,
  })
  if (erroPerfil) {
    await admin.auth.admin.deleteUser(criado.user.id)
    return { erro: 'Não foi possível criar o perfil (alguma loja pode ter sido renomeada). Tente de novo.' }
  }

  revalidatePath('/admin/usuarios')
  redirect('/admin/usuarios')
}

export async function atualizarUsuario(id: string, _estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  let quemEdita
  try {
    quemEdita = await exigirAdmin()
  } catch (e) {
    return { erro: (e as Error).message }
  }

  const { dados, erro } = lerFormulario(formData)
  if (!dados) return { erro }
  if (dados.senha && dados.senha.length < SENHA_MINIMA) {
    return { erro: `A nova senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.` }
  }

  // Impede que um admin tire o próprio acesso por engano.
  if (id === quemEdita.id && dados.role !== 'admin') {
    return { erro: 'Você não pode remover o seu próprio acesso de admin.' }
  }

  const admin = criarClienteAdmin()

  // E-mail e senha ficam no Auth; nome, papel e lojas, em profiles.
  const mudancasAuth: { email?: string; password?: string; email_confirm?: boolean } = {}
  const { data: atual } = await admin.from('profiles').select('email').eq('id', id).maybeSingle()
  if (!atual) return { erro: 'Usuário não encontrado.' }
  if (atual.email !== dados.email) {
    mudancasAuth.email = dados.email
    mudancasAuth.email_confirm = true
  }
  if (dados.senha) mudancasAuth.password = dados.senha

  if (Object.keys(mudancasAuth).length > 0) {
    const { error } = await admin.auth.admin.updateUserById(id, mudancasAuth)
    if (error) return { erro: traduzirErroAuth(error.message) }
  }

  const { error: erroPerfil } = await admin
    .from('profiles')
    .update({ nome: dados.nome, email: dados.email, role: dados.role, lojas: dados.lojas })
    .eq('id', id)
  if (erroPerfil) return { erro: 'Não foi possível salvar o perfil. Tente de novo.' }

  revalidatePath('/admin/usuarios')
  redirect('/admin/usuarios')
}
