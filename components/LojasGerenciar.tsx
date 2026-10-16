'use client'

import { useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { alternarLoja, criarLoja, renomearLoja } from '@/app/admin/lojas/actions'
import type { Loja } from '@/lib/types'
import { Aviso } from './Aviso'
import { BotaoEnviar } from './BotaoEnviar'
import { classeCampo } from './campos'

export function NovaLoja() {
  const [estado, enviar] = useFormState(criarLoja, {})
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (estado.ok) form.current?.reset()
  }, [estado])

  return (
    <form ref={form} action={enviar} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="nome"
          required
          placeholder="OFF PREMIUM - NOME DA LOJA"
          aria-label="Nome da nova loja"
          className={classeCampo}
        />
        <BotaoEnviar carregando="Adicionando…" className="shrink-0">
          Adicionar loja
        </BotaoEnviar>
      </div>
      <Aviso erro={estado.erro} ok={estado.ok} />
    </form>
  )
}

function BotaoAlternar({ ativa }: { ativa: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
    >
      {ativa ? 'Desativar' : 'Reativar'}
    </button>
  )
}

export function LinhaLoja({ loja }: { loja: Loja }) {
  const [estado, enviar] = useFormState(renomearLoja.bind(null, loja.nome), {})

  return (
    <li className="px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form action={enviar} className="flex flex-1 gap-2">
          <input
            name="nome"
            defaultValue={loja.nome}
            key={loja.nome /* recria o campo quando o nome muda */}
            aria-label={`Nome da loja ${loja.nome}`}
            className={`${classeCampo} ${loja.ativa ? '' : 'text-stone-400'}`}
          />
          <BotaoEnviar carregando="…" className="shrink-0 bg-stone-700">
            Salvar
          </BotaoEnviar>
        </form>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              loja.ativa ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {loja.ativa ? 'Ativa' : 'Inativa'}
          </span>
          <form action={alternarLoja}>
            <input type="hidden" name="nome" value={loja.nome} />
            <input type="hidden" name="ativa" value={String(!loja.ativa)} />
            <BotaoAlternar ativa={loja.ativa} />
          </form>
        </div>
      </div>
      {(estado.erro || estado.ok) && (
        <div className="mt-2">
          <Aviso erro={estado.erro} ok={estado.ok} />
        </div>
      )}
    </li>
  )
}
