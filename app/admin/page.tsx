import Link from 'next/link'
import { FiltrosAdmissoes } from '@/components/FiltrosAdmissoes'
import { ListaAdmissoes } from '@/components/ListaAdmissoes'
import { TituloPagina } from '@/components/TituloPagina'
import { exigirAdminPagina } from '@/lib/auth'
import { listarAdmissoes, listarLojas, type FiltrosLista } from '@/lib/consultas'

const STATUS_ATIVOS = ['Pendente', 'Data confirmada', 'Desistente'] as const

export default async function AdmissoesAtivas({ searchParams }: { searchParams: FiltrosLista }) {
  await exigirAdminPagina()
  const [admissoes, lojas] = await Promise.all([listarAdmissoes('ativas', searchParams), listarLojas()])

  const filtrando = Object.values(searchParams).some(Boolean)
  const total = admissoes.length

  return (
    <>
      <TituloPagina
        titulo="Admissões ativas"
        descricao={`${total} ${total === 1 ? 'admissão' : 'admissões'}${filtrando ? ' com estes filtros' : ''}`}
        acao={
          <Link
            href="/admin/nova"
            className="rounded-xl bg-marca-grafite px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-black"
          >
            Nova admissão
          </Link>
        }
      />

      <div className="mb-6">
        <FiltrosAdmissoes lojas={lojas.map((l) => l.nome)} status={STATUS_ATIVOS} />
      </div>

      <ListaAdmissoes
        admissoes={admissoes}
        vazio={
          filtrando ? (
            'Nenhuma admissão encontrada com esses filtros.'
          ) : (
            <>
              Nenhuma admissão ativa.{' '}
              <Link href="/admin/nova" className="font-medium text-marca-grafite underline underline-offset-4">
                Cadastre a primeira
              </Link>
              .
            </>
          )
        }
      />
    </>
  )
}
