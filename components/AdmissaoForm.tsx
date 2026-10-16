'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFormState } from 'react-dom'
import { CARGOS, STATUS, type Status } from '@/lib/constants'
import type { Admissao, EstadoForm } from '@/lib/types'
import { BotaoEnviar } from './BotaoEnviar'
import { Aviso } from './Aviso'
import { classeCampo, classeRotulo } from './campos'

interface Props {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>
  lojas: string[]
  admissao?: Admissao
  hoje: string
  voltarPara?: string
}

export function AdmissaoForm({ acao, lojas, admissao, hoje, voltarPara = '/admin' }: Props) {
  const [estado, enviar] = useFormState(acao, {})
  const [status, setStatus] = useState<Status>(admissao?.status ?? 'Pendente')
  const [sugerido, setSugerido] = useState(false)

  // Se a data de início for preenchida com status "Pendente",
  // sugere "Data confirmada". O RH pode trocar de volta.
  function aoMudarDataInicio(valor: string) {
    if (valor && status === 'Pendente') {
      setStatus('Data confirmada')
      setSugerido(true)
    } else if (!valor && sugerido) {
      setStatus('Pendente')
      setSugerido(false)
    }
  }

  return (
    <form action={enviar} className="space-y-5">
      <div>
        <label htmlFor="nome" className={classeRotulo}>
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          required
          defaultValue={admissao?.nome}
          autoComplete="off"
          className={classeCampo}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cargo" className={classeRotulo}>
            Cargo
          </label>
          <select id="cargo" name="cargo" required defaultValue={admissao?.cargo ?? ''} className={classeCampo}>
            <option value="" disabled>
              Escolha…
            </option>
            {CARGOS.map((c) => (
              <option key={c} value={c}>
                {c === 'ASL' ? 'ASL (Auxiliar de Loja)' : c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="loja" className={classeRotulo}>
            Loja
          </label>
          <select id="loja" name="loja" required defaultValue={admissao?.loja ?? ''} className={classeCampo}>
            <option value="" disabled>
              Escolha…
            </option>
            {lojas.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="data_aprovacao" className={classeRotulo}>
            Data de aprovação
          </label>
          <input
            id="data_aprovacao"
            name="data_aprovacao"
            type="date"
            required
            defaultValue={admissao?.data_aprovacao ?? hoje}
            className={classeCampo}
          />
        </div>

        <div>
          <label htmlFor="data_inicio" className={classeRotulo}>
            Data de início <span className="font-normal text-stone-500">(opcional)</span>
          </label>
          <input
            id="data_inicio"
            name="data_inicio"
            type="date"
            defaultValue={admissao?.data_inicio ?? ''}
            onChange={(e) => aoMudarDataInicio(e.target.value)}
            className={classeCampo}
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className={classeRotulo}>
          Status
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as Status)
            setSugerido(false)
          }}
          className={classeCampo}
        >
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {sugerido && (
          <p className="mt-1.5 text-sm text-emerald-700">
            Sugerimos “Data confirmada” porque há data de início.
          </p>
        )}
      </div>

      <Aviso erro={estado.erro} />

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link
          href={voltarPara}
          className="rounded-xl px-4 py-2.5 text-center text-sm font-medium text-stone-600 hover:bg-stone-200/60"
        >
          Cancelar
        </Link>
        <BotaoEnviar>{admissao ? 'Salvar alterações' : 'Cadastrar admissão'}</BotaoEnviar>
      </div>
    </form>
  )
}
