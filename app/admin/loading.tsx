import { EsqueletoLista, EsqueletoTitulo, Barra } from '@/components/Esqueleto'

// Aparece no instante do clique, enquanto o servidor busca os dados.
// Vale para /admin e todas as rotas abaixo dela que não tenham o próprio.
export default function Carregando() {
  return (
    <>
      <EsqueletoTitulo />
      <div className="mb-6 grid animate-pulse gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Barra className="h-11" />
        <Barra className="h-11" />
        <Barra className="h-11" />
        <Barra className="h-11" />
      </div>
      <EsqueletoLista />
    </>
  )
}
