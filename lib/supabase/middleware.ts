import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Renova a sessão do Supabase a cada requisição e barra quem não
// está logado nas áreas protegidas. A checagem de PAPEL (admin x
// gerente) acontece nos layouts, e a de DADOS, no RLS.
export async function atualizarSessao(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesParaGravar) {
          cookiesParaGravar.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesParaGravar.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // getUser() valida o token no servidor do Supabase (getSession não).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const caminho = request.nextUrl.pathname
  const areaProtegida = caminho.startsWith('/admin') || caminho.startsWith('/gerente')

  if (!user && areaProtegida) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (user && caminho === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}
