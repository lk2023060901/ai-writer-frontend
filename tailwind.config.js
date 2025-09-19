/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主题色彩系统
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // ChatGPT风格色彩
        chatgpt: {
          bg: '#ffffff',
          sidebar: '#f7f7f8',
          border: '#e5e5e5',
          text: '#374151',
          accent: '#10a37f',
        },
        // Claude风格色彩
        claude: {
          bg: '#ffffff',
          sidebar: '#f8f9fa',
          border: '#e1e5e9',
          text: '#2d3748',
          accent: '#d97706',
        },
        // 深色主题
        dark: {
          bg: '#1a1a1a',
          sidebar: '#2d2d2d',
          border: '#404040',
          text: '#ffffff',
          accent: '#3b82f6',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}