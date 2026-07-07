import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3A86FF',
          accent: '#06D6A0',
        },
      },
      boxShadow: {
        soft: '0 18px 45px -18px rgba(15, 23, 42, 0.24)',
      },
    },
  },
  plugins: [],
} satisfies Config;
