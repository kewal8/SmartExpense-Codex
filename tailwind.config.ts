import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Bricolage Grotesque', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-deep': 'var(--bg-deep)',
        section: 'var(--section)',
        card: {
          DEFAULT: 'var(--card)',
          2: 'var(--card-2)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
          4: 'var(--ink-4)',
          5: 'var(--ink-5)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          2: 'var(--accent-2)',
          soft: 'var(--accent-soft)',
          border: 'var(--accent-border)',
          glow: 'var(--accent-glow)',
        },
        semantic: {
          red: 'var(--red)',
          'red-soft': 'var(--red-soft)',
          'red-border': 'var(--red-border)',
          green: 'var(--green)',
          'green-soft': 'var(--green-soft)',
          'green-border': 'var(--green-border)',
          amber: 'var(--amber)',
          'amber-soft': 'var(--amber-soft)',
          'amber-border': 'var(--amber-border)',
        },
        stroke: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
        },
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        float: 'var(--shadow-float)',
        hover: 'var(--shadow-hover)',
      },
      borderRadius: {
        card: '14px',
        section: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
