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
          DEFAULT: '#2dd6a7',
          dark: '#1f9f7c',
          darker: '#166f57',
          light: '#5eead4',
        },
        gold: {
          DEFAULT: '#f2b134',
          light: '#ffd166',
        },
        ink: {
          950: '#000000',
          900: '#0a0a0c',
          800: '#121316',
          700: '#1e1f24',
        },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(45,214,167,0.45)',
        goldGlow: '0 0 25px -8px rgba(242,177,52,0.5)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(circle at 50% 0%, rgba(45,214,167,0.16), transparent 60%)',
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
