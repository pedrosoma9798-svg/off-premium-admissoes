import Image from 'next/image'

// Logo em /public/logo.png (720×200, fundo #1a1a1a).
// Para trocar pela oficial, substitua o arquivo mantendo a proporção.
export function Logo({ altura = 28 }: { altura?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="OFF Premium"
      width={Math.round((altura * 720) / 200)}
      height={altura}
      priority
    />
  )
}
