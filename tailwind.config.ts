import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: '#3D1F8C', 2: '#5B2FB5', deep: '#2B1470' },
        violet: { DEFAULT: '#7C3AFF', soft: '#9B6BFF' },
        lilac: { DEFAULT: '#D9C8FF', 2: '#F3EDFF', 3: '#B9A6EA' },
        body: '#C6B8EA',
        ink: '#1E1145',
        gold: { DEFAULT: '#FFC93C', soft: '#FFE39A' },
        rose: { soft: '#E9A0B4', muted: '#D9788F' },
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 22px 40px -24px rgba(20,4,70,.55)',
        cta: '0 18px 40px -14px rgba(124,58,255,.9)',
      },
    },
  },
  plugins: [],
};
export default config;
