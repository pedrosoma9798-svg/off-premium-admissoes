import { redirect } from 'next/navigation'
import { SeletorLoja, TODAS } from '@/components/SeletorLoja'
import { obterPerfil } from '@/lib/auth'
import { agoraFormatado, diaDaSemana, formatarDiaMes, hojeISO } from '@/lib/datas'
import { criarClienteServidor } from '@/lib/supabase/server'
import type { Admissao } from '@/lib/types'

type AdmissaoPainel = Pick<Admissao, 'id' | 'nome' | 'cargo' | 'loja' | 'data_inicio' | 'status'>

function rotuloDia(iso: string, hoje: string, amanha: string) {
  if (iso === hoje) return 'hoje'
  if (iso === amanha) return 'amanhã'
  return diaDaSemana(iso)
}

function somarUmDia(iso: string) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10)
}

const lojaCurta = (loja: string) => loja.replace(/^OFF PREMIUM - /, '')

export default async function PainelGerente({ searchParams }: { searchParams: { loja?: string } }) {
  const supabase = criarClienteServidor()

  // Perfil e admissões em paralelo, não em fila. A consulta não precisa
  // esperar para saber quais lojas filtrar: o RLS já devolve apenas as
  // lojas vinculadas a quem está logado. A escolha do seletor é aplicada
  // depois, em memória.
  const [perfil, { data }] = await Promise.all([
    obterPerfil(),
    supabase
      .from('admissoes')
      .select('id, nome, cargo, loja, data_inicio, status')
      .neq('status', 'Iniciado')
      .order('nome'),
  ])

  if (!perfil) redirect('/auth/sem-perfil')

  const minhasLojas = [...perfil.lojas].sort()

  if (minhasLojas.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-cartao">
        <p className="font-medium">Nenhuma loja vinculada ao seu acesso.</p>
        <p className="mt-1 text-stone-600">Peça ao RH para vincular a sua loja.</p>
      </div>
    )
  }

  const temSeletor = perfil.role === 'supervisor' || minhasLojas.length > 1
  const pedida = searchParams.loja
  const selecao = !temSeletor
    ? minhasLojas[0]
    : pedida && (pedida === TODAS || minhasLojas.includes(pedida))
      ? pedida
      : TODAS
  const visaoGeral = selecao === TODAS && minhasLojas.length > 1

  const todas = (data ?? []) as AdmissaoPainel[]
  const admissoes = selecao === TODAS ? todas : todas.filter((a) => a.loja === selecao)

  const hoje = hojeISO()
  const amanha = somarUmDia(hoje)

  const proximos = admissoes
    .filter((a) => a.status === 'Data confirmada' && a.data_inicio && a.data_inicio >= hoje)
    .sort((a, b) => a.data_inicio!.localeCompare(b.data_inicio!))
  const aguardando = admissoes.filter((a) => a.status === 'Pendente')
  const desistencias = admissoes.filter((a) => a.status === 'Desistente')

  const titulo = visaoGeral ? 'Todas as lojas' : selecao === TODAS ? minhasLojas[0] : selecao

  return (
    <div className="space-y-4">
      {temSeletor && <SeletorLoja lojas={minhasLojas} atual={selecao} />}

      <article className="rounded-xl bg-white shadow-cartao">
        <header className="border-b border-stone-100 px-5 py-5">
          <p className="text-sm text-stone-500">Admissões</p>
          <h1 className="mt-0.5 text-lg font-semibold leading-snug">{titulo}</h1>
        </header>

        {/* PRÓXIMOS INÍCIOS */}
        <section className="px-5 py-5" aria-labelledby="bloco-proximos">
          <h2
            id="bloco-proximos"
            className="flex items-center gap-2 text-sm font-semibold tracking-wide text-emerald-800"
          >
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> PRÓXIMOS INÍCIOS
          </h2>
          {proximos.length === 0 ? (
            <p className="mt-3 text-stone-500">Nenhum início confirmado por enquanto.</p>
          ) : (
            <ul className="mt-3 divide-y divide-stone-100">
              {proximos.map((a) => (
                <li key={a.id} className="flex items-center gap-4 py-3">
                  <div className="w-[4.75rem] shrink-0">
                    <p className="text-3xl font-bold leading-none tracking-tight text-emerald-700">
                      {formatarDiaMes(a.data_inicio!)}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        a.data_inicio === hoje ? 'font-semibold text-emerald-700' : 'text-stone-500'
                      }`}
                    >
                      {rotuloDia(a.data_inicio!, hoje, amanha)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.nome}</p>
                    <p className="truncate text-sm text-stone-600">
                      {a.cargo}
                      {visaoGeral && ` — ${lojaCurta(a.loja)}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* AGUARDANDO DATA DE INÍCIO */}
        <section className="border-t border-stone-100 px-5 py-5" aria-labelledby="bloco-aguardando">
          <h2
            id="bloco-aguardando"
            className="flex items-center gap-2 text-sm font-semibold tracking-wide text-amber-800"
          >
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-amber-400" /> AGUARDANDO DATA DE INÍCIO
          </h2>
          <p className="mt-2 text-stone-700">
            <span className="text-2xl font-semibold">{aguardando.length}</span>{' '}
            {aguardando.length === 1 ? 'admissão' : 'admissões'}
          </p>
          {aguardando.length > 0 && (
            <ul className="mt-2 space-y-1.5 text-sm">
              {aguardando.map((a) => (
                <li key={a.id} className="text-stone-700">
                  <span className="font-medium text-marca-grafite">{a.nome}</span> — {a.cargo}
                  {visaoGeral && <span className="text-stone-500"> — {lojaCurta(a.loja)}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* DESISTÊNCIAS */}
        <section className="border-t border-stone-100 px-5 py-5" aria-labelledby="bloco-desistencias">
          <h2
            id="bloco-desistencias"
            className="flex items-center gap-2 text-sm font-semibold tracking-wide text-red-800"
          >
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-red-500" /> DESISTÊNCIAS
          </h2>
          <p className="mt-2 text-2xl font-semibold text-stone-700">{desistencias.length}</p>
          {desistencias.length > 0 && (
            <ul className="mt-2 space-y-1.5 text-sm">
              {desistencias.map((a) => (
                <li key={a.id} className="text-stone-700">
                  <span className="font-medium text-marca-grafite">{a.nome}</span> — {a.cargo}
                  {visaoGeral && <span className="text-stone-500"> — {lojaCurta(a.loja)}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="rounded-b-xl border-t border-stone-100 bg-stone-50 px-5 py-3 text-xs text-stone-500">
          Última atualização: {agoraFormatado()}
        </footer>
      </article>
    </div>
  )
}
