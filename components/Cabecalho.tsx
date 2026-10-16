'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'
import { sair } from '@/app/login/actions'

interface ItemMenu {
  href: string
  rotulo: string
}

// Cabeçalho escuro com a logo. No celular o menu vira uma faixa
// rolável logo abaixo, para caber em 375 px.
export function Cabecalho({ nome, menu = [] }: { nome: string; menu?: ItemMenu[] }) {
  const caminho = usePathname()

  const ativo = (href: string) =>
    href === '/admin' ? caminho === '/admin' || caminho.startsWith('/admin/nova') || /^\/admin\/[^/]+\/editar/.test(caminho) : caminho.startsWith(href)

  return (
    <header className="bg-marca-grafite text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Início" className="shrink-0">
          <Logo altura={26} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                ativo(item.href) ? 'bg-white/10 text-white' : 'text-marca-cinza hover:text-white'
              }`}
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-[12rem] truncate text-sm text-marca-cinza sm:block">{nome}</span>
          <form action={sair}>
            <button
              type="submit"
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/90 transition hover:bg-white/10"
            >
              Sair
            </button>
          </form>
        </div>
      </div>

      {menu.length > 0 && (
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 md:hidden">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm ${
                ativo(item.href) ? 'bg-white/10 text-white' : 'text-marca-cinza'
              }`}
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
