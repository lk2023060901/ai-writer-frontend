/**
 * 设计系统主入口
 * 统一导出所有设计系统相关功能
 */

// 类型定义
export type {
  DesignTokens,
  ColorTokens,
  SpacingTokens,
  TypographyTokens,
  RadiusTokens,
  ShadowTokens,
  DimensionTokens,
  Theme,
  ThemeVariant,
  ThemeMode,
} from './tokens';

// 基础令牌
export { baseTokens } from './tokens';

// 主题系统
export {
  themes,
  themeMap,
  getTheme,
  getAllThemes,
  getDefaultTheme,
  themeClassNames,
  getThemeClassName,
  chatgptLight,
  chatgptDark,
  claudeLight,
  claudeDark,
} from './themes';

// 工具函数
export {
  generateCSSVariables,
  generateThemeCSS,
  generateAllThemesCSS,
  applyTheme,
  getCurrentTheme,
  cssVars,
} from './utils';

// 为便捷访问器导入所需的模块
import {
  themes,
  getTheme,
} from './themes';
import {
  generateAllThemesCSS,
  applyTheme,
  getCurrentTheme,
  cssVars,
} from './utils';

// 便捷访问器（简化导入）
export const ds = {
  // 主题相关
  themes,
  getTheme,
  applyTheme,
  getCurrentTheme,

  // CSS变量
  vars: cssVars,

  // 生成器
  generateCSS: generateAllThemesCSS,
} as const;