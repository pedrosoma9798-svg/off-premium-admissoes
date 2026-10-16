import Link from 'next/link'
import { TituloPagina } from '@/components/TituloPagina'
import { exigirAdminPagina } from '@/lib/auth'
import { ROTULO_ROLE } from '@/lib/constants'
import { criarClienteServidor } from '@/lib/supabase/server'
import type { Perfil } from '@/lib/types'

export default async function Usuarios() {
  const eu = await exigirAdminPagina()
  const supabase = criarClienteServidor()
  // Leitura pelo cliente normal: o RLS libera tudo para admin.
  const { data } = await supabase.from('profiles').select('*').order('role').order('nome')
  const usuarios = (data ?? []) as Perfil[]

  return (
    <>
      <TituloPagina
        titulo="Usuários"
        descricao="Quem acessa o sistema e quais lojas cada pessoa vê."
        acao={
          <Link
            href="/admin/usuarios/novo"
            className="rounded-xl bg-marca-grafite px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-black"
          >
            Novo usuário
          </Link>
        }
      />

      <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl bg-white shadow-cartao">
        {usuarios.map((u) => (
          <li key={u.id}>
            <Link
              href={`/admin/usuarios/${u.id}`}
              className="flex flex-col gap-1 px-4 py-4 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="min-w-0 sm:w-64">
                <p className="truncate font-medium">
                  {u.nome}
                  {u.id === eu.id && <span className="ml-2 text-sm font-normal text-stone-500">(você)</span>}
                </p>
                <p className="truncate text-sm text-stone-500">{u.email}</p>
              </div>
              <p className="text-sm text-stone-700 sm:w-28">{ROTULO_ROLE[u.role]}</p>
              <p className="flex-1 text-sm text-stone-600">
                {u.role === 'admin'
                  ? 'Todas as lojas'
                  : u.lojas.length === 0
                    ? 'Nenhuma loja vinculada'
                    : u.lojas.map((l) => l.replace(/^OFF PREMIUM - /, '')).join(', ')}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
