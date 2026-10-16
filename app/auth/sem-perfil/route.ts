import { NextResponse, type NextRequest } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/server'

// Usuário existe no Auth mas não tem linha em "profiles".
// Encerra a sessão (só um route handler pode apagar cookies aqui)
// e volta ao login com a explicação.
export async function GET(request: NextRequest) {
  const supabase = criarClienteServidor()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login?erro=sem-perfil', request.url))
}
