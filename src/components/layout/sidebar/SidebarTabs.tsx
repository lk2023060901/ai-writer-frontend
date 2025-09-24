/**
 * 侧边栏标签页组件
 * 从SidePanel.tsx中抽离的标签页切换功能
 */

import React from 'react';
import styled from 'styled-components';
import { Tabs } from 'antd';
import type { SidebarTabsProps, SidebarTab } from './types';

// 样式组件
const SidebarTabsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;

  /* 只针对sidebar-tabs内的元素，避免影响其他Tabs组件 */
  .ant-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    .ant-tabs-nav {
      margin: 0;
      padding: 8px;
      background: transparent;
      box-sizing: border-box;
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;

      &::before {
        border: none;
      }
    }

    .ant-tabs-tab {
      padding: 8px 12px;
      margin: 0;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      position: relative;
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;

      /* 创建悬停时的下划线动画 */
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        height: 2px;
        background: var(--accent-color);
        transform: translateX(-50%) scaleX(0);
        transform-origin: center;
        transition: transform 0.3s ease;
        width: calc(100% - 16px);
      }

      /* 为所有 Tab 创建自定义下划线 */
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: calc(100% - 16px);
        height: 2px;
        background: var(--accent-color);
        transform: translateX(-50%) scaleX(0);
        transform-origin: center;
        transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
        z-index: 1;
      }

      &:hover {
        color: var(--text-primary);
        background: transparent;

        &::after {
          transform: translateX(-50%) scaleX(1);
        }
      }

      &.ant-tabs-tab-active {
        color: var(--accent-color);
        background: transparent;

        &::before {
          transform: translateX(-50%) scaleX(1);
        }

        &::after {
          transform: translateX(-50%) scaleX(0);
        }

        &:hover::after {
          transform: translateX(-50%) scaleX(0);
        }
      }

      .ant-tabs-tab-btn {
        font-size: 14px;
        font-weight: 500;
        color: inherit;
        transition: color 0.3s ease;
      }
    }

    .ant-tabs-ink-bar {
      display: none;
    }

    .ant-tabs-content-holder {
      flex: 1;
      overflow: hidden;
    }

    .ant-tabs-content {
      height: 100%;
    }

    .ant-tabs-tabpane {
      height: 100%;
      overflow: hidden;
    }
  }
`;

// 标签页配置
const tabItems = [
  {
    key: 'assistants' as SidebarTab,
    label: '助手',
  },
  {
    key: 'topics' as SidebarTab,
    label: '话题',
  },
  {
    key: 'settings' as SidebarTab,
    label: '设置',
  },
];

// 主组件
const SidebarTabs: React.FC<SidebarTabsProps> = ({
  activeTab,
  onTabChange,
  inDrawer = false,
}) => {
  return (
    <SidebarTabsContainer>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => onTabChange(key as SidebarTab)}
        items={tabItems}
        size="small"
        centered={!inDrawer}
      />
    </SidebarTabsContainer>
  );
};

export default SidebarTabs;