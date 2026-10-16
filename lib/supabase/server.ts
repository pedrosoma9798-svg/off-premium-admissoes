import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente para Server Components e Server Actions.
// Age em nome do usuário logado (cookie de sessão) → passa pelo RLS.
export function criarClienteServidor() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesParaGravar) {
          try {
            cookiesParaGravar.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Components não podem gravar cookies. Tudo bem:
            // o middleware já renova a sessão a cada requisição.
          }
        },
      },
    },
  )
}
