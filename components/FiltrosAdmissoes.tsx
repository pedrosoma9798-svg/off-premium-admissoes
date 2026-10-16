'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { CARGOS } from '@/lib/constants'
import { classeCampo } from './campos'

interface Props {
  lojas: string[]
  status: readonly string[] // status disponíveis no filtro desta página
}

// Filtros guardados na URL (?q=&loja=&cargo=&status=): o link pode
// ser compartilhado e a página continua funcionando ao recarregar.
export function FiltrosAdmissoes({ lojas, status }: Props) {
  const router = useRouter()
  const caminho = usePathname()
  const params = useSearchParams()
  const [pendente, iniciar] = useTransition()
  const [busca, setBusca] = useState(params.get('q') ?? '')

  function aplicar(chave: string, valor: string) {
    const novos = new URLSearchParams(params.toString())
    if (valor) novos.set(chave, valor)
    else novos.delete(chave)
    iniciar(() => router.replace(`${caminho}?${novos.toString()}`))
  }

  // Busca por nome com pequena espera para não consultar a cada tecla.
  useEffect(() => {
    if (busca === (params.get('q') ?? '')) return
    const t = setTimeout(() => aplicar('q', busca.trim()), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca])

  const temFiltro = ['q', 'loja', 'cargo', 'status'].some((k) => params.get(k))

  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_2fr_1fr_1fr] ${pendente ? 'opacity-70' : ''}`}>
      <input
        type="search"
        placeholder="Buscar por nome"
        aria-label="Buscar por nome"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className={classeCampo}
      />
      <select
        aria-label="Filtrar por loja"
        value={params.get('loja') ?? ''}
        onChange={(e) => aplicar('loja', e.target.value)}
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
        value={params.get('cargo') ?? ''}
        onChange={(e) => aplicar('cargo', e.target.value)}
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
          value={params.get('status') ?? ''}
          onChange={(e) => aplicar('status', e.target.value)}
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
          onClick={() => {
            setBusca('')
            iniciar(() => router.replace(caminho))
          }}
          className="justify-self-start text-sm text-stone-600 underline underline-offset-4 hover:text-marca-grafite"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
