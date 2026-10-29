import Link from 'next/link'
import { AdmissoesFiltraveis } from '@/components/AdmissoesFiltraveis'
import { TituloPagina } from '@/components/TituloPagina'
import { exigirAdminPagina } from '@/lib/auth'
import { listarAdmissoes, listarLojas } from '@/lib/consultas'

const STATUS_ATIVOS = ['Pendente', 'Data confirmada', 'Desistente'] as const

export default async function AdmissoesAtivas({
  searchParams,
}: {
  searchParams: { q?: string; loja?: string; cargo?: string; status?: string }
}) {
  // Permissão e dados em paralelo, não em fila: economiza uma ida ao
  // banco por carregamento. O RLS protege as consultas de qualquer forma,
  // e exigirAdminPagina redireciona quem não for admin.
  const [, admissoes, lojas] = await Promise.all([
    exigirAdminPagina(),
    listarAdmissoes('ativas'),
    listarLojas(),
  ])

  return (
    <>
      <TituloPagina
        titulo="Admissões ativas"
        acao={
          <Link
            href="/admin/nova"
            className="rounded-xl bg-marca-grafite px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-black"
          >
            Nova admissão
          </Link>
        }
      />
      <AdmissoesFiltraveis
        admissoes={admissoes}
        lojas={lojas.map((l) => l.nome)}
        status={STATUS_ATIVOS}
        filtrosIniciais={searchParams}
      />
    </>
  )
}
