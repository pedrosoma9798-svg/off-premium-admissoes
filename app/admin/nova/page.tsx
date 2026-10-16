import { AdmissaoForm } from '@/components/AdmissaoForm'
import { TituloPagina } from '@/components/TituloPagina'
import { exigirAdminPagina } from '@/lib/auth'
import { listarLojas } from '@/lib/consultas'
import { hojeISO } from '@/lib/datas'
import { criarAdmissao } from '../actions'

export default async function NovaAdmissao() {
  await exigirAdminPagina()
  const lojas = await listarLojas(true)

  return (
    <div className="mx-auto max-w-2xl">
      <TituloPagina titulo="Nova admissão" />
      <div className="rounded-xl bg-white p-5 shadow-cartao sm:p-8">
        <AdmissaoForm acao={criarAdmissao} lojas={lojas.map((l) => l.nome)} hoje={hojeISO()} />
      </div>
    </div>
  )
}
