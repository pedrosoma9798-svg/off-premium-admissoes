import 'server-only'
import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────
// Cliente com a SERVICE ROLE KEY. Ignora todo o RLS.
//
// Regras:
// - Só importar em server actions (o 'server-only' acima faz o
//   build falhar se alguém importar isto num Client Component).
// - Toda action que usa este cliente DEVE chamar exigirAdmin()
//   antes, porque aqui o banco não protege mais nada.
// ─────────────────────────────────────────────────────────────
export function criarClienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !chave) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada (veja .env.local.example).')
  }
  return createClient(url, chave, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
