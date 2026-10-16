// Mensagem de erro ou sucesso nos formulários.
export function Aviso({ erro, ok }: { erro?: string; ok?: string }) {
  if (erro) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
        {erro}
      </p>
    )
  }
  if (ok) {
    return (
      <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {ok}
      </p>
    )
  }
  return null
}
