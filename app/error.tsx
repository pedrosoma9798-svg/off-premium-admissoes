'use client'

// Aparece quando uma consulta ou ação falha (ex.: sem conexão).
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Algo não funcionou</h1>
      <p className="mt-2 text-stone-600">
        {error.message && !error.digest ? error.message : 'Verifique a conexão e tente de novo.'}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-marca-grafite px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
      >
        Tentar de novo
      </button>
    </main>
  )
}
