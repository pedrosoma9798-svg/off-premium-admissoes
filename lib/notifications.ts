import type { Admissao } from './types'

// ─────────────────────────────────────────────────────────────
// Gancho de notificação (fase 2).
//
// Hoje só registra no log do servidor (Vercel → projeto → Logs).
// É chamado ao criar uma admissão e ao alterar data de início ou
// status. Para enviar e-mail de verdade com o Resend, veja a seção
// "Notificações por e-mail" do README.
// ─────────────────────────────────────────────────────────────

export type MotivoNotificacao = 'criada' | 'atualizada'

export async function notificarGerente(
  admissao: Admissao,
  motivo: MotivoNotificacao = 'atualizada',
): Promise<void> {
  console.log('[notificarGerente]', motivo, {
    loja: admissao.loja,
    nome: admissao.nome,
    cargo: admissao.cargo,
    status: admissao.status,
    data_inicio: admissao.data_inicio,
  })
}
