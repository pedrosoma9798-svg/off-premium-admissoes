import { Logo } from '@/components/Logo'
import { FormLogin } from './FormLogin'

const MENSAGENS: Record<string, string> = {
  'sem-perfil': 'Sua conta ainda não foi configurada. Fale com o RH.',
}

export default function PaginaLogin({ searchParams }: { searchParams: { erro?: string } }) {
  const erro = searchParams.erro ? MENSAGENS[searchParams.erro] : undefined

  return (
    <main className="flex min-h-screen flex-col bg-marca-grafite">
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-16">
        <Logo altura={44} />
        <p className="mt-4 text-sm text-marca-cinza">Controle de Admissões</p>
      </div>

      <div className="rounded-t-3xl bg-marca-papel px-6 pb-12 pt-8 sm:mx-auto sm:mb-24 sm:w-full sm:max-w-sm sm:rounded-3xl sm:pb-8">
        <h1 className="mb-6 text-xl font-semibold">Entrar</h1>
        <FormLogin erroInicial={erro} />
        <p className="mt-6 text-center text-xs text-stone-500">
          Não tem acesso? Peça ao RH para criar sua conta.
        </p>
      </div>
    </main>
  )
}
