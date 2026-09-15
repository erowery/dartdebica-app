import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e0202a',
          dark: '#a8141c',
          darker: '#7a0e14',
          light: '#ff4b54',
        },
        gold: {
          DEFAULT: '#f2b134',
          light: '#ffd166',
        },
        ink: {
          950: '#07080d',
          900: '#0c0e16',
          800: '#12141f',
          700: '#1a1d2b',
        },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(224,32,42,0.45)',
        goldGlow: '0 0 25px -8px rgba(242,177,52,0.5)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(circle at 50% 0%, rgba(224,32,42,0.18), transparent 60%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
