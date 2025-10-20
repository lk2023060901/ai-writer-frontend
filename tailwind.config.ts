import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-background-soft)',
        muted: 'var(--color-background-mute)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        'primary-soft': 'var(--color-primary-soft)',
        'primary-muted': 'var(--color-primary-mute)',
        foreground: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        accent: 'var(--color-link)',
        danger: 'var(--color-error)',
      },
    },
  },
  darkMode: 'class',
  plugins: [heroui()],
};

export default config;
