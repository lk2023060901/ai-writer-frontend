/**
 * Antd Provider
 * 基于 Cherry Studio 的 Antd 配置
 */

'use client';

import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { useTheme } from './ThemeProvider';
import { useTranslation } from 'react-i18next';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import type { LanguageVarious } from '@/i18n';

/**
 * 获取 Antd 语言包
 */
function getAntdLocale(language: LanguageVarious) {
  switch (language) {
    case 'zh-CN':
      return zhCN;
    case 'en-US':
      return enUS;
    default:
      return zhCN;
  }
}

/**
 * Antd Provider 组件
 */
export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { actualTheme } = useTheme();
  const { i18n } = useTranslation();

  // 获取当前主色
  const colorPrimary =
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement)
          .getPropertyValue('--color-primary')
          .trim() || '#00b96b'
      : '#00b96b';

  return (
    <ConfigProvider
      locale={getAntdLocale(i18n.language as LanguageVarious)}
      theme={{
        cssVar: true,
        hashed: false,
        algorithm: [
          actualTheme === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        ],
        components: {
          Button: {
            boxShadow: 'none',
            controlHeight: 30,
            paddingInline: 10,
            borderRadius: 6,
          },
          Input: {
            controlHeight: 30,
            colorBorder: 'var(--color-border)',
            borderRadius: 6,
          },
          Select: {
            controlHeight: 30,
            borderRadius: 6,
          },
          Modal: {
            colorBgElevated: 'var(--modal-background)',
            borderRadiusLG: 10,
          },
          Dropdown: {
            borderRadiusLG: 10,
            borderRadiusSM: 8,
            paddingXS: 4,
          },
          Card: {
            borderRadiusLG: 10,
          },
          Table: {
            borderRadius: 10,
          },
          Tabs: {
            borderRadius: 8,
          },
          Tooltip: {
            borderRadius: 6,
          },
          Popover: {
            borderRadius: 8,
          },
          Menu: {
            borderRadius: 8,
          },
        },
        token: {
          colorPrimary: colorPrimary,
          fontFamily: 'var(--font-family)',
          fontSize: 14,
          borderRadius: 6,
          colorBgContainer:
            actualTheme === 'dark' ? '#1a1a1a' : '#ffffff',
          colorBorder: 'var(--color-border)',
          colorText: 'var(--color-text-1)',
          colorTextSecondary: 'var(--color-text-2)',
          colorTextTertiary: 'var(--color-text-3)',
          colorTextQuaternary: 'var(--color-text-4)',
          colorBgLayout: 'var(--color-background)',
          colorBgElevated:
            actualTheme === 'dark' ? '#1f1f1f' : '#ffffff',
          // 动画速度
          motionDurationMid: '0.1s',
          motionDurationSlow: '0.2s',
        },
      }}>
      {children}
    </ConfigProvider>
  );
}
