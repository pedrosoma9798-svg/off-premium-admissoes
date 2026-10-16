'use client'

import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { excluirAdmissao, mudarStatus } from '@/app/admin/actions'
import type { Admissao } from '@/lib/types'

function BotaoAcao({
  children,
  tom = 'neutro',
}: {
  children: React.ReactNode
  tom?: 'neutro' | 'verde' | 'vermelho'
}) {
  const { pending } = useFormStatus()
  const cores = {
    neutro: 'text-stone-700 hover:bg-stone-100',
    verde: 'text-emerald-800 hover:bg-emerald-50',
    vermelho: 'text-red-700 hover:bg-red-50',
  }[tom]
  return (
    <button
      type="submit"
      disabled={pending}
      className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition disabled:opacity-50 ${cores}`}
    >
      {pending ? '…' : children}
    </button>
  )
}

// Ações de uma linha: editar, iniciado, desistente, excluir.
export function AcoesAdmissao({ admissao, historico = false }: { admissao: Admissao; historico?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link
        href={`/admin/${admissao.id}/editar`}
        className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
      >
        Editar
      </Link>

      {!historico && (
        <>
          <form
            action={mudarStatus}
            onSubmit={(e) => {
              if (!confirm(`Marcar ${admissao.nome} como iniciado? O registro vai para o histórico.`)) e.preventDefault()
            }}
          >
            <input type="hidden" name="id" value={admissao.id} />
            <input type="hidden" name="status" value="Iniciado" />
            <BotaoAcao tom="verde">Iniciado</BotaoAcao>
          </form>

          {admissao.status !== 'Desistente' && (
            <form
              action={mudarStatus}
              onSubmit={(e) => {
                if (!confirm(`Marcar ${admissao.nome} como desistente?`)) e.preventDefault()
              }}
            >
              <input type="hidden" name="id" value={admissao.id} />
              <input type="hidden" name="status" value="Desistente" />
              <BotaoAcao tom="vermelho">Desistente</BotaoAcao>
            </form>
          )}
        </>
      )}

      <form
        action={excluirAdmissao}
        onSubmit={(e) => {
          if (!confirm(`Excluir a admissão de ${admissao.nome}? Isso não pode ser desfeito.`)) e.preventDefault()
        }}
      >
        <input type="hidden" name="id" value={admissao.id} />
        <BotaoAcao>Excluir</BotaoAcao>
      </form>
    </div>
  )
}
