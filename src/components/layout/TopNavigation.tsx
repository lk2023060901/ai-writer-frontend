import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useAppTracking, useUITracking, useComponentTracking } from '@/hooks/useTracking';
import { removeTab, setActiveTab, toggleAppLauncher, toggleDarkMode, toggleSettingsPanel } from '@/store/slices/uiSlice';
import {
  HomeOutlined,
  MoonOutlined,
  PlusOutlined,
  SettingOutlined,
  SunOutlined
} from '@ant-design/icons';
import { Button, Layout, Tabs } from 'antd';
import React from 'react';
import styled from 'styled-components';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  height: 48px;
  padding: 0 8px 0 0;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1001; /* 确保在所有其他元素之上 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  .ant-tabs {
    flex: 1;
    height: 48px;
    display: flex;
    align-items: center;

    .ant-tabs-nav {
      margin: 0;
      padding: 0;
      height: 48px;
      display: flex;
      align-items: center;
      width: 100%;
      overflow: visible;

      &::before {
        border: none;
      }
    }

    .ant-tabs-nav-list {
      display: flex;
      align-items: center;
      height: 48px;
      overflow: visible;
      width: 100%;
    }

    .ant-tabs-content-holder {
      display: none !important;
    }

    .ant-tabs-ink-bar {
      display: none !important;
    }

    /* Tab间距和背景样式 */
    .ant-tabs-tab {
      margin: 0 4px;
      padding: 0 12px;
      background: transparent;
      transition: background-color 0.2s ease;
      height: 36px;
      min-height: 36px;
      display: flex;
      align-items: center;
      overflow: visible;
      box-sizing: border-box;

      &:hover {
        background: rgba(0, 0, 0, 0.08);
        border-radius: 8px;
      }

      &.ant-tabs-tab-active {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 8px !important;

        &::after, &::before {
          display: none !important;
        }
      }

      /* 深色模式下的背景 */
      [data-theme="dark"] & {
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        &.ant-tabs-tab-active {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px !important;
        }
      }

      .ant-tabs-tab-btn {
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 100%;
        min-height: 36px;
        overflow: visible;
        width: 100%;
      }
    }


    /* 「+」按钮样式统一 - 强制覆盖所有状态 */
    .ant-tabs-nav-add {
      margin: 0 4px;
      padding: 0 12px;
      background: transparent !important;
      background-color: transparent !important;
      border: none !important;
      border-radius: 0 !important;
      transition: background-color 0.2s ease;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;

      &::before, &::after {
        display: none !important;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.08) !important;
        background-color: rgba(0, 0, 0, 0.08) !important;
        border-radius: 8px !important;
      }

      &:focus, &:active {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }

      /* 深色模式下的背景 */
      [data-theme="dark"] & {
        &:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
        }
      }

      button {
        padding: 0;
        border: none !important;
        background: transparent !important;
        background-color: transparent !important;
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        outline: none !important;
        box-shadow: none !important;

        &::before, &::after {
          display: none !important;
        }

        &:hover, &:focus, &:active {
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
      }
    }

  }
`;

const ActionButton = styled(Button) <{ $active?: boolean }>`
  /* 彻底清除所有默认样式 */
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  color: var(--text-secondary);

  /* 与"+"按钮保持完全一致的尺寸和间距 */
  height: 36px;
  min-width: 44px; /* 与"+"按钮悬停宽度一致 */
  margin: 0 4px;
  padding: 0 12px; /* 恢复与"+"按钮相同的padding */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  border-radius: 0; /* 默认无圆角 */

  /* 清除所有状态下的默认样式 */
  &:focus, &:active, &:visited {
    box-shadow: none !important;
    outline: none !important;
    border: none !important;
    background: transparent !important;
  }

  /* 清除伪元素 */
  &::before, &::after {
    display: none !important;
  }

  /* 选中状态 - 与悬停效果一致 */
  ${props => props.$active && `
    background: rgba(0, 0, 0, 0.08) !important;
    background-color: rgba(0, 0, 0, 0.08) !important;
    border-radius: 8px !important;
    color: var(--text-primary);
  `}

  /* 悬停效果 - 与"+"按钮完全一致 */
  &:hover {
    background: rgba(0, 0, 0, 0.08) !important;
    background-color: rgba(0, 0, 0, 0.08) !important;
    border-radius: 8px !important;
    color: var(--text-primary);
    box-shadow: none !important;
    outline: none !important;
    border: none !important;
  }

  /* 深色模式下的背景 */
  [data-theme="dark"] & {
    /* 深色模式下的选中状态 */
    ${props => props.$active && `
      background: rgba(255, 255, 255, 0.1) !important;
      background-color: rgba(255, 255, 255, 0.1) !important;
      border-radius: 8px !important;
      color: var(--text-primary);
    `}

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      background-color: rgba(255, 255, 255, 0.1) !important;
      border-radius: 8px !important;
      color: var(--text-primary);
    }

    &:focus, &:active, &:visited {
      background: transparent !important;
    }
  }
`;



const TopNavigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tabs, activeTabId, darkMode } = useAppSelector(state => state.ui);

  // 埋点hooks
  const appTracking = useAppTracking();
  const uiTracking = useUITracking();
  useComponentTracking('TopNavigation');

  const handleTabChange = (key: string) => {
    const fromTab = activeTabId;
    const toTab = key;
    const tabType = tabs.find(tab => tab.id === key)?.type || 'chat';

    // 埋点：标签页切换
    appTracking.trackTabSwitch(fromTab, toTab, tabType, 'click');

    dispatch(setActiveTab(key));
  };

  const handleTabEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      const tabId = targetKey as string;
      const tab = tabs.find(t => t.id === tabId);

      // 埋点：标签页关闭
      if (tab) {
        appTracking.trackTabClose(tabId, tab.type);
      }

      dispatch(removeTab(tabId));
    } else if (action === 'add') {
      // 埋点：应用启动器打开
      appTracking.trackAppLaunch('app_launcher', '应用启动器', false);

      // 切换应用启动器显示状态
      dispatch(toggleAppLauncher());
    }
  };



  const tabItems = tabs.map(tab => ({
    key: tab.id,
    label: tab.id === 'home' ? (
      <>
        <HomeOutlined /> 首页
      </>
    ) : (
      <>
        {tab.title}
      </>
    ),
    closable: tab.closable
  }));


  return (
    <StyledHeader>
      {/* 标签页（包含首页和添加按钮） */}
      <Tabs
        type="editable-card"
        activeKey={activeTabId}
        items={tabItems}
        onChange={handleTabChange}
        onEdit={handleTabEdit}
        hideAdd={false}
        addIcon={<PlusOutlined />}
        size="small"
        style={{
          width: '100%'
        }}
        tabBarStyle={{
          margin: 0,
          minHeight: '48px'
        }}
        tabBarGutter={0}
      />

      {/* 主题切换按钮 */}
      <ActionButton
        icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
        onClick={() => dispatch(toggleDarkMode())}
        title={darkMode ? "切换到浅色模式" : "切换到深色模式"}
      />

      {/* 设置按钮 */}
      <ActionButton
        icon={<SettingOutlined />}
        onClick={() => dispatch(toggleSettingsPanel())}
        title="设置"
      />
    </StyledHeader>
  );
};

export default TopNavigation;