import { Cabecalho } from '@/components/Cabecalho'
import { exigirAdminPagina } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const MENU = [
  { href: '/admin', rotulo: 'Admissões ativas' },
  { href: '/admin/historico', rotulo: 'Histórico' },
  { href: '/admin/usuarios', rotulo: 'Usuários' },
  { href: '/admin/lojas', rotulo: 'Lojas' },
]

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const perfil = await exigirAdminPagina()
  return (
    <>
      <Cabecalho nome={perfil.nome} menu={MENU} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </>
  )
}
