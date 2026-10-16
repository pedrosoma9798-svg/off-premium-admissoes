import { redirect } from 'next/navigation'
import { Cabecalho } from '@/components/Cabecalho'
import { obterPerfil } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function LayoutGerente({ children }: { children: React.ReactNode }) {
  const perfil = await obterPerfil()
  if (!perfil) redirect('/auth/sem-perfil')
  if (perfil.role === 'admin') redirect('/admin')

  return (
    <>
      <Cabecalho nome={perfil.nome} />
      <main className="mx-auto max-w-xl px-4 py-6 sm:py-10">{children}</main>
    </>
  )
}
