import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta da marca (logo): grafite, cinza do "OFF" e fundo de página
        marca: {
          grafite: '#1a1a1a',
          cinza: '#8a8a8a',
          papel: '#f5f5f4',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Sombra sutil dos cards: uma linha de contato + difusão leve
        cartao: '0 1px 2px rgba(26,26,26,0.06), 0 4px 16px -8px rgba(26,26,26,0.10)',
      },
    },
  },
  plugins: [],
}

export default config
