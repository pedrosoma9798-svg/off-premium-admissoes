// Blocos cinza que aparecem instantaneamente enquanto os dados chegam.
// animate-pulse dá o efeito de respiração que sinaliza "carregando".

export function Barra({ className = '' }: { className?: string }) {
  return <div className={`rounded bg-stone-200 ${className}`} />
}

/** Esqueleto de uma lista de admissões (cards no celular, tabela no desktop). */
export function EsqueletoLista({ linhas = 4 }: { linhas?: number }) {
  return (
    <div className="animate-pulse">
      {/* Celular */}
      <ul className="space-y-3 md:hidden">
        {Array.from({ length: linhas }).map((_, i) => (
          <li key={i} className="rounded-xl bg-white p-4 shadow-cartao">
            <div className="flex items-start justify-between gap-3">
              <div className="w-full space-y-2">
                <Barra className="h-4 w-2/5" />
                <Barra className="h-3 w-1/4" />
              </div>
              <Barra className="h-5 w-20 shrink-0 rounded-full" />
            </div>
            <Barra className="mt-3 h-3 w-1/3" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Barra className="h-8" />
              <Barra className="h-8" />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <div className="hidden rounded-xl bg-white p-4 shadow-cartao md:block">
        <Barra className="mb-4 h-4 w-full" />
        <div className="space-y-4">
          {Array.from({ length: linhas }).map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-4">
              <Barra className="col-span-2 h-4" />
              <Barra className="h-4" />
              <Barra className="h-4" />
              <Barra className="h-4" />
              <Barra className="h-5 rounded-full" />
              <Barra className="h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Esqueleto do cabeçalho de página (título + descrição). */
export function EsqueletoTitulo() {
  return (
    <div className="mb-6 animate-pulse space-y-2">
      <Barra className="h-8 w-56" />
      <Barra className="h-4 w-32" />
    </div>
  )
}
