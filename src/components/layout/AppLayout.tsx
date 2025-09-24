import { useAppSelector } from '@/hooks/redux';
import { Layout } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import AppLauncher from '../pages/AppLauncher';
// import MainContent from './MainContent';
import { MainContentRefactored as MainContent } from '../main-content';
// import SidePanel from './SidePanel';
import { SidePanelRefactored as SidePanel } from './sidebar';
import TopNavigation from './TopNavigation';
import SettingsPanel from '../settings/SettingsPanel';

const StyledLayout = styled(Layout)`
  height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;

  .ant-layout {
    background: transparent;
  }
`;

const ContentLayout = styled(Layout)`
  height: calc(100vh - 48px);
  overflow: hidden;
`;



const DrawerOverlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
  display: ${props => props.$visible ? 'block' : 'none'};
  transition: opacity 0.3s;
`;

const StyledDrawer = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: var(--header-height);
  left: 0;
  width: var(--sidebar-width);
  height: calc(100vh - var(--header-height));
  background: var(--bg-secondary);
  transform: translateX(${props => props.$visible ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  overflow: auto;
`;

const AppLayout: React.FC = () => {
  const { theme, sidebarCollapsed, showAppLauncher, showSettingsPanel, tabs, activeTabId } = useAppSelector(state => state.ui);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // 检查当前标签是否为应用标签（非聊天标签）
  const currentTab = tabs.find(tab => tab.id === activeTabId);
  const isApplicationTab = currentTab && ['knowledge', 'assistant'].includes(currentTab.type);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && drawerVisible) {
        setDrawerVisible(false);
      }
    };

    if (drawerVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [drawerVisible]);

  return (
    <StyledLayout className={`theme-${theme}`}>
      {/* 顶部导航 - 在所有主题下都显示 */}
      <TopNavigation />

      {/* 条件渲染：设置面板、应用启动器或正常布局 */}
      {showSettingsPanel ? (
        /* 设置面板 - 在ContentLayout内显示 */
        <ContentLayout className={`theme-${theme}`}>
          <SettingsPanel />
        </ContentLayout>
      ) : showAppLauncher ? (
        /* 应用启动器页面 - 全屏显示 */
        <ContentLayout className={`theme-${theme}`}>
          <AppLauncher />
        </ContentLayout>
      ) : (
        /* 正常布局 - 侧边栏 + 主内容 */
        <>
          <ContentLayout className={`theme-${theme}`}>
            {/* 左侧面板 - 只在非应用标签且侧边栏未收起时显示 */}
            {!isApplicationTab && !sidebarCollapsed && (
              <SidePanel key="main-sidebar" />
            )}

            {/* 主要内容 */}
            <MainContent onDrawerOpen={() => setDrawerVisible(true)} />
          </ContentLayout>

          {/* 抽屉遮罩层 - 只在非应用标签且侧边栏收起时显示 */}
          {!isApplicationTab && sidebarCollapsed && (
            <DrawerOverlay
              $visible={drawerVisible}
              onClick={() => setDrawerVisible(false)}
            />
          )}

          {/* 自定义抽屉式侧边栏 - 只在非应用标签且侧边栏收起时显示 */}
          {!isApplicationTab && sidebarCollapsed && (
            <StyledDrawer
              $visible={drawerVisible}
              ref={drawerRef}
            >
              <SidePanel key="drawer-sidebar" inDrawer={true} />
            </StyledDrawer>
          )}
        </>
      )}
    </StyledLayout>
  );
};

export default AppLayout;