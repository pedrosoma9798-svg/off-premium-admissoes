import { AdmissoesFiltraveis } from '@/components/AdmissoesFiltraveis'
import { TituloPagina } from '@/components/TituloPagina'
import { exigirAdminPagina } from '@/lib/auth'
import { listarAdmissoes, listarLojas } from '@/lib/consultas'

export default async function Historico({
  searchParams,
}: {
  searchParams: { q?: string; loja?: string; cargo?: string }
}) {
  const [, admissoes, lojas] = await Promise.all([
    exigirAdminPagina(),
    listarAdmissoes('historico'),
    listarLojas(),
  ])

  return (
    <>
      <TituloPagina
        titulo="Histórico"
        descricao="Pessoas que já começaram a trabalhar. Para corrigir um registro, use Editar."
      />
      <AdmissoesFiltraveis
        admissoes={admissoes}
        lojas={lojas.map((l) => l.nome)}
        status={['Iniciado']}
        historico
        filtrosIniciais={searchParams}
      />
    </>
  )
}
