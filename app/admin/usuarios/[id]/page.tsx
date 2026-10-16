import { notFound } from 'next/navigation'
import { TituloPagina } from '@/components/TituloPagina'
import { UsuarioForm } from '@/components/UsuarioForm'
import { exigirAdminPagina } from '@/lib/auth'
import { listarLojas } from '@/lib/consultas'
import { criarClienteServidor } from '@/lib/supabase/server'
import type { Perfil } from '@/lib/types'
import { atualizarUsuario } from '../actions'

export default async function EditarUsuario({ params }: { params: { id: string } }) {
  await exigirAdminPagina()
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound()

  const supabase = criarClienteServidor()
  const [{ data }, lojas] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.id).maybeSingle(),
    listarLojas(),
  ])
  if (!data) notFound()
  const usuario = data as Perfil

  // Lojas inativas só aparecem se o usuário já estiver vinculado a elas.
  const visiveis = lojas.filter((l) => l.ativa || usuario.lojas.includes(l.nome))

  return (
    <div className="mx-auto max-w-2xl">
      <TituloPagina titulo="Editar usuário" descricao={usuario.email} />
      <div className="rounded-xl bg-white p-5 shadow-cartao sm:p-8">
        <UsuarioForm acao={atualizarUsuario.bind(null, usuario.id)} lojas={visiveis} usuario={usuario} />
      </div>
    </div>
  )
}
