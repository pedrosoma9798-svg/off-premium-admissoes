'use client'

import { CARGOS } from '@/lib/constants'
import { classeCampo } from './campos'

export interface Filtros {
  q: string
  loja: string
  cargo: string
  status: string
}

export const FILTROS_VAZIOS: Filtros = { q: '', loja: '', cargo: '', status: '' }

interface Props {
  lojas: string[]
  status: readonly string[]
  valores: Filtros
  aoMudar: (f: Filtros) => void
}

// Controles de filtro. Não fazem nenhuma chamada de rede: só avisam
// o componente pai, que filtra a lista que já está na memória.
export function FiltrosAdmissoes({ lojas, status, valores, aoMudar }: Props) {
  const set = (chave: keyof Filtros, valor: string) => aoMudar({ ...valores, [chave]: valor })
  const temFiltro = Object.values(valores).some(Boolean)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_2fr_1fr_1fr]">
      <input
        type="search"
        placeholder="Buscar por nome"
        aria-label="Buscar por nome"
        value={valores.q}
        onChange={(e) => set('q', e.target.value)}
        className={classeCampo}
      />
      <select
        aria-label="Filtrar por loja"
        value={valores.loja}
        onChange={(e) => set('loja', e.target.value)}
        className={classeCampo}
      >
        <option value="">Todas as lojas</option>
        {lojas.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <select
        aria-label="Filtrar por cargo"
        value={valores.cargo}
        onChange={(e) => set('cargo', e.target.value)}
        className={classeCampo}
      >
        <option value="">Todos os cargos</option>
        {CARGOS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {status.length > 1 ? (
        <select
          aria-label="Filtrar por status"
          value={valores.status}
          onChange={(e) => set('status', e.target.value)}
          className={classeCampo}
        >
          <option value="">Todos os status</option>
          {status.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ) : (
        <span className="hidden lg:block" />
      )}
      {temFiltro && (
        <button
          type="button"
          onClick={() => aoMudar(FILTROS_VAZIOS)}
          className="justify-self-start text-sm text-stone-600 underline underline-offset-4 hover:text-marca-grafite"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
