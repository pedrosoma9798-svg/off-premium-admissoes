'use client'

import { useFormStatus } from 'react-dom'

// Botão de envio que se desabilita enquanto a server action roda.
export function BotaoEnviar({
  children,
  carregando = 'Salvando…',
  className = '',
}: {
  children: React.ReactNode
  carregando?: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-xl bg-marca-grafite px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60 ${className}`}
    >
      {pending ? carregando : children}
    </button>
  )
}
