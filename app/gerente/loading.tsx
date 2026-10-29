import { Barra } from '@/components/Esqueleto'

export default function Carregando() {
  return (
    <div className="animate-pulse rounded-xl bg-white shadow-cartao">
      <div className="border-b border-stone-100 px-5 py-5">
        <Barra className="h-3 w-20" />
        <Barra className="mt-2 h-5 w-3/4" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="border-b border-stone-100 px-5 py-5 last:border-0">
          <Barra className="h-3 w-48" />
          <Barra className="mt-3 h-8 w-2/3" />
          <Barra className="mt-2 h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
