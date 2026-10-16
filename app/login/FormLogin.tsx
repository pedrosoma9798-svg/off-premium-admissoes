'use client'

import { useFormState } from 'react-dom'
import { entrar } from './actions'
import { BotaoEnviar } from '@/components/BotaoEnviar'
import { Aviso } from '@/components/Aviso'
import { classeCampo, classeRotulo } from '@/components/campos'

export function FormLogin({ erroInicial }: { erroInicial?: string }) {
  const [estado, acao] = useFormState(entrar, { erro: erroInicial })

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label htmlFor="email" className={classeRotulo}>
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={classeCampo} />
      </div>
      <div>
        <label htmlFor="senha" className={classeRotulo}>
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className={classeCampo}
        />
      </div>
      <Aviso erro={estado.erro} />
      <BotaoEnviar carregando="Entrando…" className="w-full">
        Entrar
      </BotaoEnviar>
    </form>
  )
}
