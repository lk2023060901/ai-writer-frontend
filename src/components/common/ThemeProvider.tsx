import React, { useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';

// 临时类型定义

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, darkMode } = useAppSelector(state => state.ui);

  useEffect(() => {
    // 移除之前的主题类
    document.documentElement.classList.remove('theme-chatgpt', 'theme-claude', 'dark');

    // 添加当前主题类
    document.documentElement.classList.add(`theme-${theme}`);

    // 添加暗色模式类
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }

    // 设置CSS变量
    const root = document.documentElement;

    if (theme === 'chatgpt') {
      if (darkMode) {
        // ChatGPT 暗色主题
        root.style.setProperty('--bg-primary', '#1a1a1a');
        root.style.setProperty('--bg-secondary', '#2d2d2d');
        root.style.setProperty('--bg-tertiary', '#404040');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.7)');
        root.style.setProperty('--text-tertiary', 'rgba(255, 255, 255, 0.5)');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--accent-color', '#10a37f');
        root.style.setProperty('--sidebar-width', '260px');
        root.style.setProperty('--header-height', '48px');
      } else {
        // ChatGPT 亮色主题
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f7f7f8');
        root.style.setProperty('--bg-tertiary', '#ececec');
        root.style.setProperty('--text-primary', '#374151');
        root.style.setProperty('--text-secondary', '#6b7280');
        root.style.setProperty('--text-tertiary', '#9ca3af');
        root.style.setProperty('--border-color', '#e5e5e5');
        root.style.setProperty('--accent-color', '#10a37f');
        root.style.setProperty('--sidebar-width', '260px');
        root.style.setProperty('--header-height', '48px');
      }
    } else if (theme === 'claude') {
      if (darkMode) {
        // Claude 暗色主题
        root.style.setProperty('--bg-primary', '#1a1a1a');
        root.style.setProperty('--bg-secondary', '#2d2d2d');
        root.style.setProperty('--bg-tertiary', '#404040');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.7)');
        root.style.setProperty('--text-tertiary', 'rgba(255, 255, 255, 0.5)');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--accent-color', '#d97706');
        root.style.setProperty('--sidebar-width', '280px');
        root.style.setProperty('--header-height', '48px');
      } else {
        // Claude 亮色主题
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8f9fa');
        root.style.setProperty('--bg-tertiary', '#e9ecef');
        root.style.setProperty('--text-primary', '#2d3748');
        root.style.setProperty('--text-secondary', '#4a5568');
        root.style.setProperty('--text-tertiary', '#718096');
        root.style.setProperty('--border-color', '#e1e5e9');
        root.style.setProperty('--accent-color', '#d97706');
        root.style.setProperty('--sidebar-width', '280px');
        root.style.setProperty('--header-height', '48px');
      }
    }
  }, [theme, darkMode]);

  return <>{children}</>;
};

export default ThemeProvider;