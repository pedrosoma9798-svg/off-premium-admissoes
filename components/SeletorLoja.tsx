'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { classeCampo } from './campos'

export const TODAS = 'todas'

// Seletor do supervisor: uma loja por vez ou todas.
export function SeletorLoja({ lojas, atual }: { lojas: string[]; atual: string }) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()

  return (
    <div className={pendente ? 'opacity-70' : ''}>
      <label htmlFor="seletor-loja" className="sr-only">
        Escolher loja
      </label>
      <select
        id="seletor-loja"
        value={atual}
        onChange={(e) => iniciar(() => router.replace(`/gerente?loja=${encodeURIComponent(e.target.value)}`))}
        className={classeCampo}
      >
        <option value={TODAS}>Todas as lojas</option>
        {lojas.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </div>
  )
}
