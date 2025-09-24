/**
 * 设计令牌 (Design Tokens) 系统
 * 定义所有UI设计的基础变量，支持多主题和类型安全
 */

// 基础设计令牌接口
export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  dimensions: DimensionTokens;
}

// 颜色令牌
export interface ColorTokens {
  // 背景颜色
  background: {
    primary: string;    // 主要背景色
    secondary: string;  // 次要背景色
    tertiary: string;   // 第三级背景色
    elevated: string;   // 悬浮背景色
  };

  // 文本颜色
  text: {
    primary: string;    // 主要文本色
    secondary: string;  // 次要文本色
    tertiary: string;   // 第三级文本色
    inverse: string;    // 反色文本
    disabled: string;   // 禁用文本色
  };

  // 边框颜色
  border: {
    default: string;    // 默认边框色
    subtle: string;     // 微妙边框色
    strong: string;     // 强调边框色
    focus: string;      // 焦点边框色
  };

  // 主题色
  accent: {
    primary: string;    // 主强调色
    secondary: string;  // 次强调色
    hover: string;      // 悬停色
    pressed: string;    // 按下色
    subtle: string;     // 微妙强调色
  };

  // 状态颜色
  status: {
    success: string;    // 成功色
    warning: string;    // 警告色
    error: string;      // 错误色
    info: string;       // 信息色
  };
}

// 间距令牌
export interface SpacingTokens {
  xs: string;    // 4px
  sm: string;    // 8px
  md: string;    // 16px
  lg: string;    // 24px
  xl: string;    // 32px
  '2xl': string; // 48px
  '3xl': string; // 64px
  '4xl': string; // 96px
}

// 字体令牌
export interface TypographyTokens {
  fontFamily: {
    sans: string;
    mono: string;
  };

  fontSize: {
    xs: string;    // 12px
    sm: string;    // 14px
    base: string;  // 16px
    lg: string;    // 18px
    xl: string;    // 20px
    '2xl': string; // 24px
    '3xl': string; // 30px
    '4xl': string; // 36px
  };

  fontWeight: {
    normal: string;   // 400
    medium: string;   // 500
    semibold: string; // 600
    bold: string;     // 700
  };

  lineHeight: {
    tight: string;   // 1.25
    normal: string;  // 1.5
    relaxed: string; // 1.75
  };
}

// 圆角令牌
export interface RadiusTokens {
  none: string;   // 0
  sm: string;     // 4px
  md: string;     // 6px
  lg: string;     // 8px
  xl: string;     // 12px
  full: string;   // 9999px
}

// 阴影令牌
export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

// 尺寸令牌
export interface DimensionTokens {
  sidebar: {
    width: string;
    collapsedWidth: string;
  };
  header: {
    height: string;
  };
  content: {
    maxWidth: string;
  };
}

// 主题类型定义
export type ThemeMode = 'light' | 'dark';
export type ThemeVariant = 'chatgpt' | 'claude';

export interface Theme {
  name: string;
  variant: ThemeVariant;
  mode: ThemeMode;
  tokens: DesignTokens;
}

// 基础令牌（不依赖主题）
export const baseTokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  } as SpacingTokens,

  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  } as TypographyTokens,

  radius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  } as RadiusTokens,

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  } as ShadowTokens,

  dimensions: {
    sidebar: {
      width: '280px',
      collapsedWidth: '60px',
    },
    header: {
      height: '48px',
    },
    content: {
      maxWidth: '1200px',
    },
  } as DimensionTokens,
};