import { redirect } from 'next/navigation'
import { obterPerfil } from '@/lib/auth'
import { criarClienteServidor } from '@/lib/supabase/server'

// Porta de entrada: manda cada pessoa para a sua área.
export default async function Inicio() {
  const perfil = await obterPerfil()

  if (!perfil) {
    const supabase = criarClienteServidor()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    // Logado mas sem perfil: conta criada fora do app.
    redirect(user ? '/auth/sem-perfil' : '/login')
  }

  redirect(perfil.role === 'admin' ? '/admin' : '/gerente')
}
