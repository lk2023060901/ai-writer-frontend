#!/usr/bin/env node

/**
 * 主题CSS生成脚本
 * 将设计令牌编译为静态CSS文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设计令牌数据（直接包含，避免复杂的导入）
const themes = {
  'chatgpt-light': {
    name: 'ChatGPT Light',
    className: 'theme-chatgpt-light',
    tokens: {
      '--ds-bg-primary': '#ffffff',
      '--ds-bg-secondary': '#f7f7f8',
      '--ds-bg-tertiary': '#ececec',
      '--ds-bg-elevated': '#ffffff',
      '--ds-text-primary': '#374151',
      '--ds-text-secondary': '#6b7280',
      '--ds-text-tertiary': '#9ca3af',
      '--ds-text-inverse': '#ffffff',
      '--ds-text-disabled': '#d1d5db',
      '--ds-border-default': '#e5e5e5',
      '--ds-border-subtle': '#f3f4f6',
      '--ds-border-strong': '#d1d5db',
      '--ds-border-focus': '#10a37f',
      '--ds-accent-primary': '#10a37f',
      '--ds-accent-secondary': '#0d8f6c',
      '--ds-accent-hover': '#0d9574',
      '--ds-accent-pressed': '#0a7c64',
      '--ds-accent-subtle': 'rgba(16, 163, 127, 0.1)',
      '--ds-status-success': '#10a37f',
      '--ds-status-warning': '#f59e0b',
      '--ds-status-error': '#ef4444',
      '--ds-status-info': '#3b82f6',
      '--ds-spacing-xs': '4px',
      '--ds-spacing-sm': '8px',
      '--ds-spacing-md': '16px',
      '--ds-spacing-lg': '24px',
      '--ds-spacing-xl': '32px',
      '--ds-spacing-2xl': '48px',
      '--ds-spacing-3xl': '64px',
      '--ds-spacing-4xl': '96px',
      '--ds-font-size-xs': '12px',
      '--ds-font-size-sm': '14px',
      '--ds-font-size-base': '16px',
      '--ds-font-size-lg': '18px',
      '--ds-font-size-xl': '20px',
      '--ds-font-size-2xl': '24px',
      '--ds-font-size-3xl': '30px',
      '--ds-font-size-4xl': '36px',
      '--ds-radius-none': '0',
      '--ds-radius-sm': '4px',
      '--ds-radius-md': '6px',
      '--ds-radius-lg': '8px',
      '--ds-radius-xl': '12px',
      '--ds-radius-full': '9999px',
      '--ds-shadow-none': 'none',
      '--ds-shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '--ds-shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '--ds-shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '--ds-shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '--ds-sidebar-width': '260px',
      '--ds-sidebar-collapsed-width': '60px',
      '--ds-header-height': '48px',
      '--ds-content-max-width': '1200px',
    },
  },

  'chatgpt-dark': {
    name: 'ChatGPT Dark',
    className: 'theme-chatgpt-dark',
    tokens: {
      '--ds-bg-primary': '#1a1a1a',
      '--ds-bg-secondary': '#2d2d2d',
      '--ds-bg-tertiary': '#404040',
      '--ds-bg-elevated': '#2d2d2d',
      '--ds-text-primary': '#ffffff',
      '--ds-text-secondary': 'rgba(255, 255, 255, 0.7)',
      '--ds-text-tertiary': 'rgba(255, 255, 255, 0.5)',
      '--ds-text-inverse': '#000000',
      '--ds-text-disabled': 'rgba(255, 255, 255, 0.3)',
      '--ds-border-default': 'rgba(255, 255, 255, 0.1)',
      '--ds-border-subtle': 'rgba(255, 255, 255, 0.05)',
      '--ds-border-strong': 'rgba(255, 255, 255, 0.2)',
      '--ds-border-focus': '#10a37f',
      '--ds-accent-primary': '#10a37f',
      '--ds-accent-secondary': '#0d8f6c',
      '--ds-accent-hover': '#0d9574',
      '--ds-accent-pressed': '#0a7c64',
      '--ds-accent-subtle': 'rgba(16, 163, 127, 0.15)',
      '--ds-status-success': '#22c55e',
      '--ds-status-warning': '#f59e0b',
      '--ds-status-error': '#ef4444',
      '--ds-status-info': '#3b82f6',
      '--ds-spacing-xs': '4px',
      '--ds-spacing-sm': '8px',
      '--ds-spacing-md': '16px',
      '--ds-spacing-lg': '24px',
      '--ds-spacing-xl': '32px',
      '--ds-spacing-2xl': '48px',
      '--ds-spacing-3xl': '64px',
      '--ds-spacing-4xl': '96px',
      '--ds-font-size-xs': '12px',
      '--ds-font-size-sm': '14px',
      '--ds-font-size-base': '16px',
      '--ds-font-size-lg': '18px',
      '--ds-font-size-xl': '20px',
      '--ds-font-size-2xl': '24px',
      '--ds-font-size-3xl': '30px',
      '--ds-font-size-4xl': '36px',
      '--ds-radius-none': '0',
      '--ds-radius-sm': '4px',
      '--ds-radius-md': '6px',
      '--ds-radius-lg': '8px',
      '--ds-radius-xl': '12px',
      '--ds-radius-full': '9999px',
      '--ds-shadow-none': 'none',
      '--ds-shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '--ds-shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '--ds-shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '--ds-shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '--ds-sidebar-width': '260px',
      '--ds-sidebar-collapsed-width': '60px',
      '--ds-header-height': '48px',
      '--ds-content-max-width': '1200px',
    },
  },

  'claude-light': {
    name: 'Claude Light',
    className: 'theme-claude-light',
    tokens: {
      '--ds-bg-primary': '#ffffff',
      '--ds-bg-secondary': '#f8f9fa',
      '--ds-bg-tertiary': '#e9ecef',
      '--ds-bg-elevated': '#ffffff',
      '--ds-text-primary': '#2d3748',
      '--ds-text-secondary': '#4a5568',
      '--ds-text-tertiary': '#718096',
      '--ds-text-inverse': '#ffffff',
      '--ds-text-disabled': '#a0aec0',
      '--ds-border-default': '#e1e5e9',
      '--ds-border-subtle': '#f7fafc',
      '--ds-border-strong': '#cbd5e0',
      '--ds-border-focus': '#d97706',
      '--ds-accent-primary': '#d97706',
      '--ds-accent-secondary': '#b45309',
      '--ds-accent-hover': '#c05621',
      '--ds-accent-pressed': '#92400e',
      '--ds-accent-subtle': 'rgba(217, 119, 6, 0.1)',
      '--ds-status-success': '#059669',
      '--ds-status-warning': '#d97706',
      '--ds-status-error': '#dc2626',
      '--ds-status-info': '#2563eb',
      '--ds-spacing-xs': '4px',
      '--ds-spacing-sm': '8px',
      '--ds-spacing-md': '16px',
      '--ds-spacing-lg': '24px',
      '--ds-spacing-xl': '32px',
      '--ds-spacing-2xl': '48px',
      '--ds-spacing-3xl': '64px',
      '--ds-spacing-4xl': '96px',
      '--ds-font-size-xs': '12px',
      '--ds-font-size-sm': '14px',
      '--ds-font-size-base': '16px',
      '--ds-font-size-lg': '18px',
      '--ds-font-size-xl': '20px',
      '--ds-font-size-2xl': '24px',
      '--ds-font-size-3xl': '30px',
      '--ds-font-size-4xl': '36px',
      '--ds-radius-none': '0',
      '--ds-radius-sm': '4px',
      '--ds-radius-md': '6px',
      '--ds-radius-lg': '8px',
      '--ds-radius-xl': '12px',
      '--ds-radius-full': '9999px',
      '--ds-shadow-none': 'none',
      '--ds-shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '--ds-shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '--ds-shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '--ds-shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '--ds-sidebar-width': '280px',
      '--ds-sidebar-collapsed-width': '60px',
      '--ds-header-height': '48px',
      '--ds-content-max-width': '1200px',
    },
  },

  'claude-dark': {
    name: 'Claude Dark',
    className: 'theme-claude-dark',
    tokens: {
      '--ds-bg-primary': '#1a1a1a',
      '--ds-bg-secondary': '#2d2d2d',
      '--ds-bg-tertiary': '#404040',
      '--ds-bg-elevated': '#2d2d2d',
      '--ds-text-primary': '#ffffff',
      '--ds-text-secondary': 'rgba(255, 255, 255, 0.7)',
      '--ds-text-tertiary': 'rgba(255, 255, 255, 0.5)',
      '--ds-text-inverse': '#000000',
      '--ds-text-disabled': 'rgba(255, 255, 255, 0.3)',
      '--ds-border-default': 'rgba(255, 255, 255, 0.1)',
      '--ds-border-subtle': 'rgba(255, 255, 255, 0.05)',
      '--ds-border-strong': 'rgba(255, 255, 255, 0.2)',
      '--ds-border-focus': '#d97706',
      '--ds-accent-primary': '#d97706',
      '--ds-accent-secondary': '#b45309',
      '--ds-accent-hover': '#c05621',
      '--ds-accent-pressed': '#92400e',
      '--ds-accent-subtle': 'rgba(217, 119, 6, 0.15)',
      '--ds-status-success': '#10b981',
      '--ds-status-warning': '#f59e0b',
      '--ds-status-error': '#f87171',
      '--ds-status-info': '#60a5fa',
      '--ds-spacing-xs': '4px',
      '--ds-spacing-sm': '8px',
      '--ds-spacing-md': '16px',
      '--ds-spacing-lg': '24px',
      '--ds-spacing-xl': '32px',
      '--ds-spacing-2xl': '48px',
      '--ds-spacing-3xl': '64px',
      '--ds-spacing-4xl': '96px',
      '--ds-font-size-xs': '12px',
      '--ds-font-size-sm': '14px',
      '--ds-font-size-base': '16px',
      '--ds-font-size-lg': '18px',
      '--ds-font-size-xl': '20px',
      '--ds-font-size-2xl': '24px',
      '--ds-font-size-3xl': '30px',
      '--ds-font-size-4xl': '36px',
      '--ds-radius-none': '0',
      '--ds-radius-sm': '4px',
      '--ds-radius-md': '6px',
      '--ds-radius-lg': '8px',
      '--ds-radius-xl': '12px',
      '--ds-radius-full': '9999px',
      '--ds-shadow-none': 'none',
      '--ds-shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '--ds-shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '--ds-shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '--ds-shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '--ds-sidebar-width': '280px',
      '--ds-sidebar-collapsed-width': '60px',
      '--ds-header-height': '48px',
      '--ds-content-max-width': '1200px',
    },
  },
};

// 生成单个主题的CSS
function generateThemeCSS(theme) {
  const rules = Object.entries(theme.tokens)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');

  return `.${theme.className} {\n${rules}\n}`;
}

// 生成所有主题的CSS
function generateAllThemesCSS() {
  const header = `/**
 * 设计系统主题样式
 * 由脚本自动生成，请勿手动修改
 * 生成时间: ${new Date().toISOString()}
 */\n\n`;

  const themesCSS = Object.values(themes)
    .map(theme => generateThemeCSS(theme))
    .join('\n\n');

  return header + themesCSS;
}

// 确保输出目录存在
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 主执行函数
function main() {
  const srcDir = path.resolve(__dirname, '../src');
  const outputDir = path.resolve(srcDir, 'design-system/generated');

  // 确保输出目录存在
  ensureDirectoryExists(outputDir);

  // 生成统一的主题CSS文件
  const allThemesCSS = generateAllThemesCSS();
  const outputPath = path.join(outputDir, 'themes.css');

  fs.writeFileSync(outputPath, allThemesCSS, 'utf8');

  console.log(`✅ 主题CSS文件已生成: ${outputPath}`);
  console.log(`📦 包含 ${Object.keys(themes).length} 个主题`);

  // 生成主题配置JSON（可选，用于运行时）
  const configPath = path.join(outputDir, 'themes.json');
  const themeConfig = {
    generated: new Date().toISOString(),
    themes: Object.fromEntries(
      Object.entries(themes).map(([key, theme]) => [
        key,
        {
          name: theme.name,
          className: theme.className,
        }
      ])
    ),
  };

  fs.writeFileSync(configPath, JSON.stringify(themeConfig, null, 2), 'utf8');
  console.log(`📋 主题配置已生成: ${configPath}`);
}

// 执行脚本
main();