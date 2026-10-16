import { FUSO } from './constants'

// ─────────────────────────────────────────────────────────────
// Datas no fuso de Brasília.
//
// Dois cuidados que este arquivo resolve:
// 1) A Vercel roda em UTC. Entre 21h e 23h59 de Brasília, o "hoje"
//    do servidor já seria amanhã. Por isso "hoje" é sempre calculado
//    em America/Sao_Paulo.
// 2) Colunas "date" chegam como "AAAA-MM-DD". new Date("2026-10-15")
//    vira meia-noite UTC = 21h do dia 14 no Brasil. Por isso essas
//    datas são formatadas cortando a string, sem passar por Date.
// ─────────────────────────────────────────────────────────────

/** Data de hoje em Brasília, no formato "AAAA-MM-DD". */
export function hojeISO(): string {
  // en-CA formata como AAAA-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** "2026-10-15" → "15/10/2026" */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

/** "2026-10-15" → "15/10" */
export function formatarDiaMes(iso: string): string {
  const [, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}`
}

/** Dia da semana abreviado de uma data "AAAA-MM-DD" (ex.: "qui"). */
export function diaDaSemana(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  // Meio-dia UTC: seguro contra qualquer fuso do Brasil
  const d = new Date(Date.UTC(ano, mes - 1, dia, 12))
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
    .format(d)
    .replace('.', '')
}

/** Agora, em Brasília: "15/10/2026 14:32" */
export function agoraFormatado(): string {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date())
  const p = (t: string) => partes.find((x) => x.type === t)?.value ?? ''
  return `${p('day')}/${p('month')}/${p('year')} ${p('hour')}:${p('minute')}`
}

/** Valida "AAAA-MM-DD" e se a data existe no calendário. */
export function ehDataValida(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const [ano, mes, dia] = v.split('-').map(Number)
  const d = new Date(Date.UTC(ano, mes - 1, dia))
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia
}
