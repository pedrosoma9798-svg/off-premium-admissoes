'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFormState } from 'react-dom'
import { ROLES, ROTULO_ROLE, type Role } from '@/lib/constants'
import type { EstadoForm, Perfil } from '@/lib/types'
import { Aviso } from './Aviso'
import { BotaoEnviar } from './BotaoEnviar'
import { classeCampo, classeRotulo } from './campos'

interface Props {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>
  lojas: { nome: string; ativa: boolean }[]
  usuario?: Perfil
}

export function UsuarioForm({ acao, lojas, usuario }: Props) {
  const [estado, enviar] = useFormState(acao, {})
  const [role, setRole] = useState<Role>(usuario?.role ?? 'gerente')
  const editando = Boolean(usuario)

  return (
    <form action={enviar} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className={classeRotulo}>
            Nome
          </label>
          <input id="nome" name="nome" required defaultValue={usuario?.nome} className={classeCampo} />
        </div>
        <div>
          <label htmlFor="email" className={classeRotulo}>
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="off"
            defaultValue={usuario?.email}
            className={classeCampo}
          />
        </div>
      </div>

      <div>
        <label htmlFor="senha" className={classeRotulo}>
          {editando ? 'Nova senha' : 'Senha'}{' '}
          {editando && <span className="font-normal text-stone-500">(deixe em branco para manter)</span>}
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required={!editando}
          className={classeCampo}
        />
        <p className="mt-1.5 text-sm text-stone-500">Mínimo de 8 caracteres. Envie à pessoa por um canal privado.</p>
      </div>

      <fieldset>
        <legend className={classeRotulo}>Papel</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {ROLES.map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                role === r ? 'border-marca-grafite bg-white' : 'border-stone-300 bg-white/60'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                className="accent-marca-grafite"
              />
              {ROTULO_ROLE[r]}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-sm text-stone-500">
          {role === 'admin' && 'Acesso total: cadastra admissões, usuários e lojas.'}
          {role === 'gerente' && 'Vê somente as admissões da(s) loja(s) marcada(s) abaixo.'}
          {role === 'supervisor' && 'Vê várias lojas e escolhe qual acompanhar no topo do painel.'}
        </p>
      </fieldset>

      {role !== 'admin' && (
        <fieldset>
          <legend className={classeRotulo}>Lojas vinculadas</legend>
          <div className="grid max-h-80 gap-1 overflow-y-auto rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-2">
            {lojas.map((l) => (
              <label key={l.nome} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-stone-50">
                <input
                  type="checkbox"
                  name="lojas"
                  value={l.nome}
                  defaultChecked={usuario?.lojas.includes(l.nome)}
                  className="h-4 w-4 accent-marca-grafite"
                />
                <span className={l.ativa ? '' : 'text-stone-400'}>
                  {l.nome.replace(/^OFF PREMIUM - /, '')}
                  {!l.ativa && ' (inativa)'}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <Aviso erro={estado.erro} />

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link
          href="/admin/usuarios"
          className="rounded-xl px-4 py-2.5 text-center text-sm font-medium text-stone-600 hover:bg-stone-200/60"
        >
          Cancelar
        </Link>
        <BotaoEnviar>{editando ? 'Salvar alterações' : 'Criar usuário'}</BotaoEnviar>
      </div>
    </form>
  )
}
