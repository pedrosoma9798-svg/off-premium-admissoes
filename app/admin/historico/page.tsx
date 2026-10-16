import { FiltrosAdmissoes } from '@/components/FiltrosAdmissoes'
import { ListaAdmissoes } from '@/components/ListaAdmissoes'
import { TituloPagina } from '@/components/TituloPagina'
import { exigirAdminPagina } from '@/lib/auth'
import { listarAdmissoes, listarLojas, type FiltrosLista } from '@/lib/consultas'

export default async function Historico({ searchParams }: { searchParams: FiltrosLista }) {
  await exigirAdminPagina()
  const [admissoes, lojas] = await Promise.all([
    listarAdmissoes('historico', { ...searchParams, status: undefined }),
    listarLojas(),
  ])

  return (
    <>
      <TituloPagina
        titulo="Histórico"
        descricao="Pessoas que já começaram a trabalhar. Para corrigir um registro, use Editar."
      />
      <div className="mb-6">
        <FiltrosAdmissoes lojas={lojas.map((l) => l.nome)} status={['Iniciado']} />
      </div>
      <ListaAdmissoes admissoes={admissoes} historico vazio="Ninguém foi marcado como iniciado ainda." />
    </>
  )
}
