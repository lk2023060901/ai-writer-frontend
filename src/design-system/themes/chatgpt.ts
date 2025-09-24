/**
 * ChatGPT 主题设计令牌
 * 基于OpenAI ChatGPT的设计风格
 */

import { type DesignTokens, type Theme, baseTokens } from '../tokens';

// ChatGPT 亮色主题
export const chatgptLightTokens: DesignTokens = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f7f7f8',
      tertiary: '#ececec',
      elevated: '#ffffff',
    },
    text: {
      primary: '#374151',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
      disabled: '#d1d5db',
    },
    border: {
      default: '#e5e5e5',
      subtle: '#f3f4f6',
      strong: '#d1d5db',
      focus: '#10a37f',
    },
    accent: {
      primary: '#10a37f',
      secondary: '#0d8f6c',
      hover: '#0d9574',
      pressed: '#0a7c64',
      subtle: 'rgba(16, 163, 127, 0.1)',
    },
    status: {
      success: '#10a37f',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  ...baseTokens,
  dimensions: {
    ...baseTokens.dimensions,
    sidebar: {
      width: '260px',
      collapsedWidth: '60px',
    },
  },
};

// ChatGPT 暗色主题
export const chatgptDarkTokens: DesignTokens = {
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#2d2d2d',
      tertiary: '#404040',
      elevated: '#2d2d2d',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.5)',
      inverse: '#000000',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      subtle: 'rgba(255, 255, 255, 0.05)',
      strong: 'rgba(255, 255, 255, 0.2)',
      focus: '#10a37f',
    },
    accent: {
      primary: '#10a37f',
      secondary: '#0d8f6c',
      hover: '#0d9574',
      pressed: '#0a7c64',
      subtle: 'rgba(16, 163, 127, 0.15)',
    },
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  ...baseTokens,
  dimensions: {
    ...baseTokens.dimensions,
    sidebar: {
      width: '260px',
      collapsedWidth: '60px',
    },
  },
};

// ChatGPT 主题导出
export const chatgptLight: Theme = {
  name: 'ChatGPT Light',
  variant: 'chatgpt',
  mode: 'light',
  tokens: chatgptLightTokens,
};

export const chatgptDark: Theme = {
  name: 'ChatGPT Dark',
  variant: 'chatgpt',
  mode: 'dark',
  tokens: chatgptDarkTokens,
};