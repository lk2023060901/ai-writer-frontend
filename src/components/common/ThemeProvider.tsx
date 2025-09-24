import React, { useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { getThemeClassName } from '@/design-system';

interface ThemeProviderProps {
  children: React.ReactNode;
}

// 旧CSS变量映射（向后兼容）
const legacyVariableMap = {
  '--ds-bg-primary': '--bg-primary',
  '--ds-bg-secondary': '--bg-secondary',
  '--ds-bg-tertiary': '--bg-tertiary',
  '--ds-text-primary': '--text-primary',
  '--ds-text-secondary': '--text-secondary',
  '--ds-text-tertiary': '--text-muted',
  '--ds-border-default': '--border-color',
  '--ds-accent-primary': '--color-primary',
  '--ds-accent-hover': '--color-primary-hover',
  '--ds-accent-subtle': '--color-primary-light',
  '--ds-sidebar-width': '--sidebar-width',
  '--ds-header-height': '--header-height',
};

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, darkMode } = useAppSelector(state => state.ui);

  useEffect(() => {
    const root = document.documentElement;

    // 移除所有主题类
    root.classList.remove(
      'theme-chatgpt-light',
      'theme-chatgpt-dark',
      'theme-claude-light',
      'theme-claude-dark',
      'theme-chatgpt', // 旧格式
      'theme-claude',   // 旧格式
      'dark'
    );

    // 获取新的主题类名
    const themeClassName = getThemeClassName(theme, darkMode ? 'dark' : 'light');

    // 应用新主题类
    root.classList.add(themeClassName);

    // 添加暗色模式类（兼容性）
    if (darkMode) {
      root.classList.add('dark');
    }

    // 同步新CSS变量到旧CSS变量（向后兼容）
    requestAnimationFrame(() => {
      const computedStyle = getComputedStyle(root);

      Object.entries(legacyVariableMap).forEach(([newVar, oldVar]) => {
        const value = computedStyle.getPropertyValue(newVar);
        if (value) {
          root.style.setProperty(oldVar, value);
        }
      });
    });
  }, [theme, darkMode]);

  return <>{children}</>;
};

export default ThemeProvider;