'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { Admissao } from '@/lib/types'
import { FiltrosAdmissoes, FILTROS_VAZIOS, type Filtros } from './FiltrosAdmissoes'
import { ListaAdmissoes } from './ListaAdmissoes'

interface Props {
  admissoes: Admissao[]
  lojas: string[]
  status: readonly string[]
  historico?: boolean
  filtrosIniciais?: Partial<Filtros>
}

// Os dados chegam prontos do servidor e a filtragem acontece aqui,
// na memória do navegador. Nenhum filtro gera ida ao servidor, então
// a lista responde no mesmo instante em que o campo muda.
//
// Trocar para filtro no servidor só valeria a pena com um volume de
// registros muito maior do que o desta operação.
export function AdmissoesFiltraveis({
  admissoes,
  lojas,
  status,
  historico = false,
  filtrosIniciais,
}: Props) {
  const [filtros, setFiltros] = useState<Filtros>({ ...FILTROS_VAZIOS, ...filtrosIniciais })

  // Mantém os filtros na barra de endereço para o link continuar
  // compartilhável. replaceState não aciona o roteador, então não
  // dispara nenhuma requisição.
  useEffect(() => {
    const p = new URLSearchParams()
    Object.entries(filtros).forEach(([k, v]) => {
      if (v) p.set(k, v)
    })
    const busca = p.toString()
    window.history.replaceState(null, '', busca ? `?${busca}` : window.location.pathname)
  }, [filtros])

  const visiveis = useMemo(() => {
    const termo = filtros.q.trim().toLowerCase()
    return admissoes.filter((a) => {
      if (termo && !a.nome.toLowerCase().includes(termo)) return false
      if (filtros.loja && a.loja !== filtros.loja) return false
      if (filtros.cargo && a.cargo !== filtros.cargo) return false
      if (filtros.status && a.status !== filtros.status) return false
      return true
    })
  }, [admissoes, filtros])

  const filtrando = Object.values(filtros).some(Boolean)
  const total = visiveis.length

  return (
    <>
      <p className="-mt-4 mb-6 text-stone-600">
        {total} {total === 1 ? 'admissão' : 'admissões'}
        {filtrando ? ' com estes filtros' : ''}
      </p>

      <div className="mb-6">
        <FiltrosAdmissoes lojas={lojas} status={status} valores={filtros} aoMudar={setFiltros} />
      </div>

      <ListaAdmissoes
        admissoes={visiveis}
        historico={historico}
        vazio={
          filtrando ? (
            'Nenhuma admissão encontrada com esses filtros.'
          ) : historico ? (
            'Ninguém foi marcado como iniciado ainda.'
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
