/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 设计系统颜色（使用CSS变量）
        ds: {
          // 背景色
          'bg-primary': 'var(--ds-bg-primary)',
          'bg-secondary': 'var(--ds-bg-secondary)',
          'bg-tertiary': 'var(--ds-bg-tertiary)',
          'bg-elevated': 'var(--ds-bg-elevated)',

          // 文本色
          'text-primary': 'var(--ds-text-primary)',
          'text-secondary': 'var(--ds-text-secondary)',
          'text-tertiary': 'var(--ds-text-tertiary)',
          'text-inverse': 'var(--ds-text-inverse)',
          'text-disabled': 'var(--ds-text-disabled)',

          // 边框色
          'border-default': 'var(--ds-border-default)',
          'border-subtle': 'var(--ds-border-subtle)',
          'border-strong': 'var(--ds-border-strong)',
          'border-focus': 'var(--ds-border-focus)',

          // 强调色
          'accent-primary': 'var(--ds-accent-primary)',
          'accent-secondary': 'var(--ds-accent-secondary)',
          'accent-hover': 'var(--ds-accent-hover)',
          'accent-pressed': 'var(--ds-accent-pressed)',
          'accent-subtle': 'var(--ds-accent-subtle)',

          // 状态色
          'status-success': 'var(--ds-status-success)',
          'status-warning': 'var(--ds-status-warning)',
          'status-error': 'var(--ds-status-error)',
          'status-info': 'var(--ds-status-info)',
        },

        // 保留原有颜色以防兼容性问题
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },

      spacing: {
        // 设计系统间距
        'ds-xs': 'var(--ds-spacing-xs)',
        'ds-sm': 'var(--ds-spacing-sm)',
        'ds-md': 'var(--ds-spacing-md)',
        'ds-lg': 'var(--ds-spacing-lg)',
        'ds-xl': 'var(--ds-spacing-xl)',
        'ds-2xl': 'var(--ds-spacing-2xl)',
        'ds-3xl': 'var(--ds-spacing-3xl)',
        'ds-4xl': 'var(--ds-spacing-4xl)',

        // 保留原有间距
        '18': '4.5rem',
        '88': '22rem',
      },

      fontSize: {
        // 设计系统字体大小
        'ds-xs': 'var(--ds-font-size-xs)',
        'ds-sm': 'var(--ds-font-size-sm)',
        'ds-base': 'var(--ds-font-size-base)',
        'ds-lg': 'var(--ds-font-size-lg)',
        'ds-xl': 'var(--ds-font-size-xl)',
        'ds-2xl': 'var(--ds-font-size-2xl)',
        'ds-3xl': 'var(--ds-font-size-3xl)',
        'ds-4xl': 'var(--ds-font-size-4xl)',
      },

      borderRadius: {
        // 设计系统圆角
        'ds-none': 'var(--ds-radius-none)',
        'ds-sm': 'var(--ds-radius-sm)',
        'ds-md': 'var(--ds-radius-md)',
        'ds-lg': 'var(--ds-radius-lg)',
        'ds-xl': 'var(--ds-radius-xl)',
        'ds-full': 'var(--ds-radius-full)',
      },

      boxShadow: {
        // 设计系统阴影
        'ds-none': 'var(--ds-shadow-none)',
        'ds-sm': 'var(--ds-shadow-sm)',
        'ds-md': 'var(--ds-shadow-md)',
        'ds-lg': 'var(--ds-shadow-lg)',
        'ds-xl': 'var(--ds-shadow-xl)',
      },

      width: {
        // 设计系统宽度
        'ds-sidebar': 'var(--ds-sidebar-width)',
        'ds-sidebar-collapsed': 'var(--ds-sidebar-collapsed-width)',
        'ds-content-max': 'var(--ds-content-max-width)',
      },

      height: {
        // 设计系统高度
        'ds-header': 'var(--ds-header-height)',
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