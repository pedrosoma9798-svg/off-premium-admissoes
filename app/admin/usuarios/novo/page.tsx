import { TituloPagina } from '@/components/TituloPagina'
import { UsuarioForm } from '@/components/UsuarioForm'
import { exigirAdminPagina } from '@/lib/auth'
import { listarLojas } from '@/lib/consultas'
import { criarUsuario } from '../actions'

export default async function NovoUsuario() {
  await exigirAdminPagina()
  const lojas = await listarLojas(true)

  return (
    <div className="mx-auto max-w-2xl">
      <TituloPagina titulo="Novo usuário" />
      <div className="rounded-xl bg-white p-5 shadow-cartao sm:p-8">
        <UsuarioForm acao={criarUsuario} lojas={lojas} />
      </div>
    </div>
  )
}
