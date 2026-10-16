export function TituloPagina({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao?: React.ReactNode
  acao?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{titulo}</h1>
        {descricao && <p className="mt-1 text-stone-600">{descricao}</p>}
      </div>
      {acao}
    </div>
  )
}
