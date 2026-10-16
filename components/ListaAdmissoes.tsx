import { formatarData } from '@/lib/datas'
import type { Admissao } from '@/lib/types'
import { AcoesAdmissao } from './AcoesAdmissao'
import { StatusChip } from './StatusChip'

// Remove o prefixo repetido para caber melhor na tela.
const lojaCurta = (loja: string) => loja.replace(/^OFF PREMIUM - /, '')

// Tabela no desktop, cards no celular.
export function ListaAdmissoes({
  admissoes,
  historico = false,
  vazio,
}: {
  admissoes: Admissao[]
  historico?: boolean
  vazio: React.ReactNode
}) {
  if (admissoes.length === 0) {
    return <div className="rounded-xl bg-white p-8 text-center text-stone-600 shadow-cartao">{vazio}</div>
  }

  return (
    <>
      {/* Celular */}
      <ul className="space-y-3 md:hidden">
        {admissoes.map((a) => (
          <li key={a.id} className="rounded-xl bg-white p-4 shadow-cartao">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{a.nome}</p>
                <p className="text-sm text-stone-600">{a.cargo}</p>
              </div>
              <StatusChip status={a.status} />
            </div>
            <p className="mt-2 text-sm text-stone-600">{lojaCurta(a.loja)}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-stone-500">Aprovação</dt>
                <dd>{formatarData(a.data_aprovacao)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Início</dt>
                <dd className={a.data_inicio ? 'font-semibold text-emerald-700' : ''}>{formatarData(a.data_inicio)}</dd>
              </div>
            </dl>
            <div className="mt-3 border-t border-stone-100 pt-2">
              <AcoesAdmissao admissao={a} historico={historico} />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <div className="hidden overflow-x-auto rounded-xl bg-white shadow-cartao md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Cargo</th>
              <th className="px-4 py-3 font-medium">Loja</th>
              <th className="px-4 py-3 font-medium">Aprovação</th>
              <th className="px-4 py-3 font-medium">Início</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {admissoes.map((a) => (
              <tr key={a.id} className="align-middle">
                <td className="px-4 py-3 font-medium">{a.nome}</td>
                <td className="px-4 py-3 text-stone-700">{a.cargo}</td>
                <td className="px-4 py-3 text-stone-700">{lojaCurta(a.loja)}</td>
                <td className="px-4 py-3 text-stone-700">{formatarData(a.data_aprovacao)}</td>
                <td className={`px-4 py-3 ${a.data_inicio ? 'font-semibold text-emerald-700' : 'text-stone-400'}`}>
                  {formatarData(a.data_inicio)}
                </td>
                <td className="px-4 py-3">
                  <StatusChip status={a.status} />
                </td>
                <td className="px-2 py-2">
                  <AcoesAdmissao admissao={a} historico={historico} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
