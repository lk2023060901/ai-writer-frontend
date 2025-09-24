/**
 * 主题系统统一导出
 * 管理所有可用主题并提供便捷的访问方法
 */

import { chatgptLight, chatgptDark } from './chatgpt';
import { claudeLight, claudeDark } from './claude';
import type { Theme, ThemeVariant, ThemeMode } from '../tokens';

// 所有可用主题
export const themes = {
  chatgptLight,
  chatgptDark,
  claudeLight,
  claudeDark,
} as const;

// 主题映射
export const themeMap = new Map([
  ['chatgpt-light', chatgptLight],
  ['chatgpt-dark', chatgptDark],
  ['claude-light', claudeLight],
  ['claude-dark', claudeDark],
]);

// 获取主题的便捷方法
export function getTheme(variant: ThemeVariant, mode: ThemeMode): Theme {
  const key = `${variant}-${mode}` as const;
  const theme = themeMap.get(key);

  if (!theme) {
    throw new Error(`Theme not found: ${key}`);
  }

  return theme;
}

// 获取所有主题列表
export function getAllThemes(): Theme[] {
  return Array.from(themeMap.values());
}

// 获取默认主题
export function getDefaultTheme(): Theme {
  return claudeLight;
}

// 主题变量名映射（用于CSS类名）
export const themeClassNames = {
  'chatgpt-light': 'theme-chatgpt-light',
  'chatgpt-dark': 'theme-chatgpt-dark',
  'claude-light': 'theme-claude-light',
  'claude-dark': 'theme-claude-dark',
} as const;

// 根据主题获取CSS类名
export function getThemeClassName(variant: ThemeVariant, mode: ThemeMode): string {
  const key = `${variant}-${mode}` as const;
  return themeClassNames[key];
}

// 导出主题
export { chatgptLight, chatgptDark, claudeLight, claudeDark };
export type { Theme, ThemeVariant, ThemeMode };