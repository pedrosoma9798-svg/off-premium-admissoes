import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export const metadata: Metadata = {
  title: 'OFF Premium — Controle de Admissões',
  description: 'Acompanhamento das admissões das lojas OFF Premium',
  robots: { index: false, follow: false }, // app interno
  // Faz o iPhone abrir em tela cheia quando adicionado à tela de início
  appleWebApp: {
    capable: true,
    title: 'Admissões',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1a1a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
