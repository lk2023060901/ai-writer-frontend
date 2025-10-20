/**
 * 主题Provider
 * 基于 Cherry Studio 的主题切换系统
 * 支持 light/dark/system 三种模式
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * 主题模式枚举
 */
export enum ThemeMode {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

/**
 * 主题上下文类型
 */
interface ThemeContextType {
  theme: ThemeMode;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * 获取存储的主题设置
 */
function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return ThemeMode.system;
  const stored = localStorage.getItem('theme-mode') as ThemeMode;
  return stored || ThemeMode.system;
}

/**
 * 获取系统主题
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * 主题Provider组件
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settedTheme, setSettedTheme] = useState<ThemeMode>(ThemeMode.system);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

  // 计算实际主题
  const actualTheme: 'light' | 'dark' =
    settedTheme === ThemeMode.system ? systemTheme : (settedTheme as 'light' | 'dark');

  /**
   * 应用主题到DOM
   */
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // 移除旧主题类
    body.classList.remove('light', 'dark');

    // 添加新主题类
    body.classList.add(actualTheme);

    // 设置主题属性
    root.setAttribute('theme-mode', actualTheme);
    root.style.colorScheme = actualTheme;
  }, [actualTheme]);

  /**
   * 监听系统主题变化
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // 初始化系统主题
    setSystemTheme(getSystemTheme());

    // 监听系统主题变化
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  /**
   * 初始化主题
   */
  useEffect(() => {
    setSettedTheme(getStoredTheme());
  }, []);

  /**
   * 设置主题
   */
  const setTheme = (theme: ThemeMode) => {
    setSettedTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', theme);
    }
  };

  /**
   * 切换主题（循环切换）
   */
  const toggleTheme = () => {
    const nextTheme = {
      [ThemeMode.light]: ThemeMode.dark,
      [ThemeMode.dark]: ThemeMode.system,
      [ThemeMode.system]: ThemeMode.light,
    }[settedTheme];

    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{ theme: settedTheme, actualTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * 使用主题Hook
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
