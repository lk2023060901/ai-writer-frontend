/**
 * 设计系统工具函数
 * 提供主题切换、CSS生成等实用功能
 */

import type { Theme, DesignTokens, ColorTokens } from './tokens';
import { themes, getTheme, getThemeClassName, themeClassNames } from './themes';

// CSS属性映射
const cssPropertyMap = {
  // 颜色映射
  'background.primary': '--ds-bg-primary',
  'background.secondary': '--ds-bg-secondary',
  'background.tertiary': '--ds-bg-tertiary',
  'background.elevated': '--ds-bg-elevated',

  'text.primary': '--ds-text-primary',
  'text.secondary': '--ds-text-secondary',
  'text.tertiary': '--ds-text-tertiary',
  'text.inverse': '--ds-text-inverse',
  'text.disabled': '--ds-text-disabled',

  'border.default': '--ds-border-default',
  'border.subtle': '--ds-border-subtle',
  'border.strong': '--ds-border-strong',
  'border.focus': '--ds-border-focus',

  'accent.primary': '--ds-accent-primary',
  'accent.secondary': '--ds-accent-secondary',
  'accent.hover': '--ds-accent-hover',
  'accent.pressed': '--ds-accent-pressed',
  'accent.subtle': '--ds-accent-subtle',

  'status.success': '--ds-status-success',
  'status.warning': '--ds-status-warning',
  'status.error': '--ds-status-error',
  'status.info': '--ds-status-info',

  // 间距映射
  'spacing.xs': '--ds-spacing-xs',
  'spacing.sm': '--ds-spacing-sm',
  'spacing.md': '--ds-spacing-md',
  'spacing.lg': '--ds-spacing-lg',
  'spacing.xl': '--ds-spacing-xl',
  'spacing.2xl': '--ds-spacing-2xl',
  'spacing.3xl': '--ds-spacing-3xl',
  'spacing.4xl': '--ds-spacing-4xl',

  // 字体映射
  'typography.fontSize.xs': '--ds-font-size-xs',
  'typography.fontSize.sm': '--ds-font-size-sm',
  'typography.fontSize.base': '--ds-font-size-base',
  'typography.fontSize.lg': '--ds-font-size-lg',
  'typography.fontSize.xl': '--ds-font-size-xl',
  'typography.fontSize.2xl': '--ds-font-size-2xl',
  'typography.fontSize.3xl': '--ds-font-size-3xl',
  'typography.fontSize.4xl': '--ds-font-size-4xl',

  // 圆角映射
  'radius.none': '--ds-radius-none',
  'radius.sm': '--ds-radius-sm',
  'radius.md': '--ds-radius-md',
  'radius.lg': '--ds-radius-lg',
  'radius.xl': '--ds-radius-xl',
  'radius.full': '--ds-radius-full',

  // 阴影映射
  'shadows.none': '--ds-shadow-none',
  'shadows.sm': '--ds-shadow-sm',
  'shadows.md': '--ds-shadow-md',
  'shadows.lg': '--ds-shadow-lg',
  'shadows.xl': '--ds-shadow-xl',

  // 尺寸映射
  'dimensions.sidebar.width': '--ds-sidebar-width',
  'dimensions.sidebar.collapsedWidth': '--ds-sidebar-collapsed-width',
  'dimensions.header.height': '--ds-header-height',
  'dimensions.content.maxWidth': '--ds-content-max-width',
} as const;

// 生成CSS变量字符串
export function generateCSSVariables(tokens: DesignTokens): string {
  const cssRules: string[] = [];

  // 颜色变量
  Object.entries(tokens.colors).forEach(([category, colors]) => {
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = cssPropertyMap[`${category}.${key}` as keyof typeof cssPropertyMap];
      if (cssVar) {
        cssRules.push(`  ${cssVar}: ${value};`);
      }
    });
  });

  // 间距变量
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    const cssVar = cssPropertyMap[`spacing.${key}` as keyof typeof cssPropertyMap];
    if (cssVar) {
      cssRules.push(`  ${cssVar}: ${value};`);
    }
  });

  // 字体变量
  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    const cssVar = cssPropertyMap[`typography.fontSize.${key}` as keyof typeof cssPropertyMap];
    if (cssVar) {
      cssRules.push(`  ${cssVar}: ${value};`);
    }
  });

  // 圆角变量
  Object.entries(tokens.radius).forEach(([key, value]) => {
    const cssVar = cssPropertyMap[`radius.${key}` as keyof typeof cssPropertyMap];
    if (cssVar) {
      cssRules.push(`  ${cssVar}: ${value};`);
    }
  });

  // 阴影变量
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    const cssVar = cssPropertyMap[`shadows.${key}` as keyof typeof cssPropertyMap];
    if (cssVar) {
      cssRules.push(`  ${cssVar}: ${value};`);
    }
  });

  // 尺寸变量
  Object.entries(tokens.dimensions).forEach(([category, dimensions]) => {
    Object.entries(dimensions).forEach(([key, value]) => {
      const cssVar = cssPropertyMap[`dimensions.${category}.${key}` as keyof typeof cssPropertyMap];
      if (cssVar) {
        cssRules.push(`  ${cssVar}: ${value};`);
      }
    });
  });

  return cssRules.join('\\n');
}

// 生成主题CSS类
export function generateThemeCSS(theme: Theme): string {
  const className = getThemeClassName(theme.variant, theme.mode);
  const variables = generateCSSVariables(theme.tokens);

  return `.${className} {
${variables}
}`;
}

// 生成所有主题的CSS
export function generateAllThemesCSS(): string {
  const cssBlocks: string[] = [];

  Object.values(themes).forEach(theme => {
    cssBlocks.push(generateThemeCSS(theme));
  });

  return cssBlocks.join('\\n\\n');
}

// 应用主题到文档
export function applyTheme(variant: string, mode: string): void {
  const theme = getTheme(variant as any, mode as any);
  const className = getThemeClassName(theme.variant, theme.mode);

  // 移除所有主题类
  const themeClasses = Object.values(themeClassNames);
  document.documentElement.classList.remove(...themeClasses);

  // 添加新主题类
  document.documentElement.classList.add(className);
}

// 获取当前主题
export function getCurrentTheme(): string | null {
  const classList = document.documentElement.classList;

  for (const className of classList) {
    if (className.startsWith('theme-')) {
      return className;
    }
  }

  return null;
}

// CSS变量访问器（用于组件中直接访问）
export const cssVars = {
  // 背景色
  bg: {
    primary: 'var(--ds-bg-primary)',
    secondary: 'var(--ds-bg-secondary)',
    tertiary: 'var(--ds-bg-tertiary)',
    elevated: 'var(--ds-bg-elevated)',
  },

  // 文本色
  text: {
    primary: 'var(--ds-text-primary)',
    secondary: 'var(--ds-text-secondary)',
    tertiary: 'var(--ds-text-tertiary)',
    inverse: 'var(--ds-text-inverse)',
    disabled: 'var(--ds-text-disabled)',
  },

  // 边框色
  border: {
    default: 'var(--ds-border-default)',
    subtle: 'var(--ds-border-subtle)',
    strong: 'var(--ds-border-strong)',
    focus: 'var(--ds-border-focus)',
  },

  // 强调色
  accent: {
    primary: 'var(--ds-accent-primary)',
    secondary: 'var(--ds-accent-secondary)',
    hover: 'var(--ds-accent-hover)',
    pressed: 'var(--ds-accent-pressed)',
    subtle: 'var(--ds-accent-subtle)',
  },

  // 状态色
  status: {
    success: 'var(--ds-status-success)',
    warning: 'var(--ds-status-warning)',
    error: 'var(--ds-status-error)',
    info: 'var(--ds-status-info)',
  },

  // 间距
  spacing: {
    xs: 'var(--ds-spacing-xs)',
    sm: 'var(--ds-spacing-sm)',
    md: 'var(--ds-spacing-md)',
    lg: 'var(--ds-spacing-lg)',
    xl: 'var(--ds-spacing-xl)',
    '2xl': 'var(--ds-spacing-2xl)',
    '3xl': 'var(--ds-spacing-3xl)',
    '4xl': 'var(--ds-spacing-4xl)',
  },

  // 字体大小
  fontSize: {
    xs: 'var(--ds-font-size-xs)',
    sm: 'var(--ds-font-size-sm)',
    base: 'var(--ds-font-size-base)',
    lg: 'var(--ds-font-size-lg)',
    xl: 'var(--ds-font-size-xl)',
    '2xl': 'var(--ds-font-size-2xl)',
    '3xl': 'var(--ds-font-size-3xl)',
    '4xl': 'var(--ds-font-size-4xl)',
  },

  // 圆角
  radius: {
    none: 'var(--ds-radius-none)',
    sm: 'var(--ds-radius-sm)',
    md: 'var(--ds-radius-md)',
    lg: 'var(--ds-radius-lg)',
    xl: 'var(--ds-radius-xl)',
    full: 'var(--ds-radius-full)',
  },

  // 阴影
  shadow: {
    none: 'var(--ds-shadow-none)',
    sm: 'var(--ds-shadow-sm)',
    md: 'var(--ds-shadow-md)',
    lg: 'var(--ds-shadow-lg)',
    xl: 'var(--ds-shadow-xl)',
  },

  // 尺寸
  sidebar: {
    width: 'var(--ds-sidebar-width)',
    collapsedWidth: 'var(--ds-sidebar-collapsed-width)',
  },
  header: {
    height: 'var(--ds-header-height)',
  },
  content: {
    maxWidth: 'var(--ds-content-max-width)',
  },
} as const;