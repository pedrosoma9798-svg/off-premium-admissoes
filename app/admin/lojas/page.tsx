import { LinhaLoja, NovaLoja } from '@/components/LojasGerenciar'
import { TituloPagina } from '@/components/TituloPagina'
import { exigirAdminPagina } from '@/lib/auth'
import { listarLojas } from '@/lib/consultas'

export default async function Lojas() {
  await exigirAdminPagina()
  const lojas = await listarLojas()

  return (
    <div className="mx-auto max-w-3xl">
      <TituloPagina
        titulo="Lojas"
        descricao="Renomear uma loja atualiza as admissões e os acessos vinculados. Loja inativa some dos formulários, mas o histórico continua."
      />

      <section className="mb-6 rounded-xl bg-white p-5 shadow-cartao">
        <h2 className="mb-3 font-medium">Nova loja</h2>
        <NovaLoja />
      </section>

      <ul className="divide-y divide-stone-100 rounded-xl bg-white shadow-cartao">
        {lojas.map((l) => (
          <LinhaLoja key={l.nome} loja={l} />
        ))}
      </ul>
    </div>
  )
}
