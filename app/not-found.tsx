import Link from 'next/link'

export default function NaoEncontrado() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 text-stone-600">O registro pode ter sido excluído.</p>
      <Link href="/" className="mt-6 inline-block font-medium underline underline-offset-4">
        Voltar ao início
      </Link>
    </main>
  )
}
