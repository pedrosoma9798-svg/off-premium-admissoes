import { notFound } from 'next/navigation'
import { AdmissaoForm } from '@/components/AdmissaoForm'
import { TituloPagina } from '@/components/TituloPagina'
import { exigirAdminPagina } from '@/lib/auth'
import { listarLojas } from '@/lib/consultas'
import { hojeISO } from '@/lib/datas'
import { criarClienteServidor } from '@/lib/supabase/server'
import type { Admissao } from '@/lib/types'
import { atualizarAdmissao } from '../../actions'

export default async function EditarAdmissao({ params }: { params: { id: string } }) {
  await exigirAdminPagina()

  // Evita erro do Postgres com id malformado na URL
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound()

  const supabase = criarClienteServidor()
  const [{ data }, lojas] = await Promise.all([
    supabase.from('admissoes').select('*').eq('id', params.id).maybeSingle(),
    listarLojas(true),
  ])
  if (!data) notFound()
  const admissao = data as Admissao

  // Se a loja da admissão foi desativada, ela continua no select.
  const nomes = lojas.map((l) => l.nome)
  if (!nomes.includes(admissao.loja)) nomes.unshift(admissao.loja)

  return (
    <div className="mx-auto max-w-2xl">
      <TituloPagina titulo="Editar admissão" descricao={admissao.nome} />
      <div className="rounded-xl bg-white p-5 shadow-cartao sm:p-8">
        <AdmissaoForm
          acao={atualizarAdmissao.bind(null, admissao.id)}
          lojas={nomes}
          admissao={admissao}
          hoje={hojeISO()}
          voltarPara={admissao.status === 'Iniciado' ? '/admin/historico' : '/admin'}
        />
      </div>
    </div>
  )
}
