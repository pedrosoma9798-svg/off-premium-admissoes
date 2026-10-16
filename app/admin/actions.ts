'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { exigirAdmin } from '@/lib/auth'
import { ehCargo, ehStatus, type Status } from '@/lib/constants'
import { ehDataValida } from '@/lib/datas'
import { notificarGerente } from '@/lib/notifications'
import { criarClienteServidor } from '@/lib/supabase/server'
import type { Admissao, EstadoForm } from '@/lib/types'

// Todas as actions usam o cliente do usuário logado: o RLS do banco
// é a proteção final. exigirAdmin() existe para dar uma mensagem
// clara e não depender só do banco.

type DadosAdmissao = Pick<Admissao, 'nome' | 'cargo' | 'loja' | 'data_aprovacao' | 'data_inicio' | 'status'>

// Lê e valida o formulário. Os enums são validados aqui E no banco.
function lerFormulario(formData: FormData): { dados?: DadosAdmissao; erro?: string } {
  const nome = String(formData.get('nome') ?? '').trim().replace(/\s+/g, ' ')
  const cargo = String(formData.get('cargo') ?? '')
  const loja = String(formData.get('loja') ?? '')
  const data_aprovacao = String(formData.get('data_aprovacao') ?? '')
  const dataInicioBruta = String(formData.get('data_inicio') ?? '')
  const status = String(formData.get('status') ?? '')

  if (!nome) return { erro: 'Informe o nome.' }
  if (!ehCargo(cargo)) return { erro: 'Escolha um cargo válido.' }
  if (!loja) return { erro: 'Escolha a loja.' }
  if (!ehDataValida(data_aprovacao)) return { erro: 'Informe uma data de aprovação válida.' }
  if (dataInicioBruta && !ehDataValida(dataInicioBruta)) return { erro: 'Data de início inválida.' }
  if (!ehStatus(status)) return { erro: 'Escolha um status válido.' }

  return {
    dados: {
      nome,
      cargo,
      loja,
      data_aprovacao,
      data_inicio: dataInicioBruta || null,
      status,
    },
  }
}

// Traduz erros do Postgres para mensagens úteis.
function mensagemDeErro(codigo?: string): string {
  if (codigo === '23503') return 'Essa loja não existe mais. Recarregue a página e escolha outra.'
  if (codigo === '23514') return 'Algum campo tem um valor que o sistema não aceita.'
  if (codigo === '42501') return 'Sem permissão para alterar admissões.'
  return 'Não foi possível salvar. Tente de novo.'
}

function revalidarTudo() {
  revalidatePath('/admin')
  revalidatePath('/admin/historico')
  revalidatePath('/gerente')
}

export async function criarAdmissao(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  try {
    await exigirAdmin()
  } catch (e) {
    return { erro: (e as Error).message }
  }

  const { dados, erro } = lerFormulario(formData)
  if (!dados) return { erro }

  const supabase = criarClienteServidor()
  const { data, error } = await supabase.from('admissoes').insert(dados).select().single()
  if (error) return { erro: mensagemDeErro(error.code) }

  await notificarGerente(data as Admissao, 'criada')
  revalidarTudo()
  redirect('/admin')
}

export async function atualizarAdmissao(
  id: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  try {
    await exigirAdmin()
  } catch (e) {
    return { erro: (e as Error).message }
  }

  const { dados, erro } = lerFormulario(formData)
  if (!dados) return { erro }

  const supabase = criarClienteServidor()

  // Lê o estado anterior para saber se vale notificar.
  const { data: anterior } = await supabase
    .from('admissoes')
    .select('data_inicio, status')
    .eq('id', id)
    .maybeSingle()
  if (!anterior) return { erro: 'Admissão não encontrada.' }

  const { data, error } = await supabase.from('admissoes').update(dados).eq('id', id).select().single()
  if (error) return { erro: mensagemDeErro(error.code) }

  if (anterior.data_inicio !== dados.data_inicio || anterior.status !== dados.status) {
    await notificarGerente(data as Admissao, 'atualizada')
  }

  revalidarTudo()
  redirect(dados.status === 'Iniciado' ? '/admin/historico' : '/admin')
}

// Ações rápidas da lista: "marcar como iniciado" e "marcar como desistente".
export async function mudarStatus(formData: FormData): Promise<void> {
  await exigirAdmin()

  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !ehStatus(status)) throw new Error('Dados inválidos.')

  const supabase = criarClienteServidor()
  const { data, error } = await supabase
    .from('admissoes')
    .update({ status: status as Status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(mensagemDeErro(error.code))

  await notificarGerente(data as Admissao, 'atualizada')
  revalidarTudo()
}

export async function excluirAdmissao(formData: FormData): Promise<void> {
  await exigirAdmin()

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('Dados inválidos.')

  const supabase = criarClienteServidor()
  const { error } = await supabase.from('admissoes').delete().eq('id', id)
  if (error) throw new Error(mensagemDeErro(error.code))

  revalidarTudo()
}
