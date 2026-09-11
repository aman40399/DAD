/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        'background-light': '#ffffff',
        'background-dark': '#1a1a1a',
        paper: '#fafaf7',
        'paper-subtle': '#f3f2ec',
        ink: '#14130f',
        'ink-mute': '#6b6a62',
        rule: '#d9d8d1',
        accent: '#8a5e1f',
        'dark-paper': '#121210',
        'dark-subtle': '#1c1c19',
        'dark-ink': '#f5f4ef',
        'dark-mute': '#9e9d95',
        'dark-rule': '#2a2924',
        'dark-accent': '#c48c3b',
      },
      fontFamily: {
        display: ['var(--font-source-serif)', 'var(--font-playfair)', 'serif'],
        body: ['var(--font-source-serif)', 'var(--font-merriweather)', 'serif'],
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'var(--font-roboto)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        playfair: ['var(--font-playfair)', 'serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
