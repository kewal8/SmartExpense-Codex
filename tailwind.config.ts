import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'system-ui',
          'sans-serif'
        ],
        mono: ['SF Mono', 'JetBrains Mono', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0, 0, 0, 0.04)',
        medium: '0 4px 24px rgba(0, 0, 0, 0.06)',
        modal: '0 20px 60px rgba(0, 0, 0, 0.12)'
      },
      borderRadius: {
        glass: '16px'
      }
    }
  },
  plugins: []
};

export default config;
