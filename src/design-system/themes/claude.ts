/**
 * Claude 主题设计令牌
 * 基于Anthropic Claude的设计风格
 */

import { type DesignTokens, type Theme, baseTokens } from '../tokens';

// Claude 亮色主题
export const claudeLightTokens: DesignTokens = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#e9ecef',
      elevated: '#ffffff',
    },
    text: {
      primary: '#2d3748',
      secondary: '#4a5568',
      tertiary: '#718096',
      inverse: '#ffffff',
      disabled: '#a0aec0',
    },
    border: {
      default: '#e1e5e9',
      subtle: '#f7fafc',
      strong: '#cbd5e0',
      focus: '#d97706',
    },
    accent: {
      primary: '#d97706',
      secondary: '#b45309',
      hover: '#c05621',
      pressed: '#92400e',
      subtle: 'rgba(217, 119, 6, 0.1)',
    },
    status: {
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb',
    },
  },
  ...baseTokens,
  dimensions: {
    ...baseTokens.dimensions,
    sidebar: {
      width: '280px',
      collapsedWidth: '60px',
    },
  },
};

// Claude 暗色主题
export const claudeDarkTokens: DesignTokens = {
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
      focus: '#d97706',
    },
    accent: {
      primary: '#d97706',
      secondary: '#b45309',
      hover: '#c05621',
      pressed: '#92400e',
      subtle: 'rgba(217, 119, 6, 0.15)',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f87171',
      info: '#60a5fa',
    },
  },
  ...baseTokens,
  dimensions: {
    ...baseTokens.dimensions,
    sidebar: {
      width: '280px',
      collapsedWidth: '60px',
    },
  },
};

// Claude 主题导出
export const claudeLight: Theme = {
  name: 'Claude Light',
  variant: 'claude',
  mode: 'light',
  tokens: claudeLightTokens,
};

export const claudeDark: Theme = {
  name: 'Claude Dark',
  variant: 'claude',
  mode: 'dark',
  tokens: claudeDarkTokens,
};