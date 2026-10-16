'use server'

import { redirect } from 'next/navigation'
import { criarClienteServidor } from '@/lib/supabase/server'
import type { EstadoForm } from '@/lib/types'

export async function entrar(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const senha = String(formData.get('senha') ?? '')

  if (!email || !senha) return { erro: 'Preencha e-mail e senha.' }

  const supabase = criarClienteServidor()
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

  if (error) return { erro: 'E-mail ou senha incorretos.' }

  redirect('/')
}

export async function sair() {
  const supabase = criarClienteServidor()
  await supabase.auth.signOut()
  redirect('/login')
}
