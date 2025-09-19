import React from 'react';
import { Layout } from 'antd';
import styled from 'styled-components';
import { useAppSelector } from '@/hooks/redux';
import TopNavigation from './TopNavigation';
import SidePanel from './SidePanel';
import MainContent from './MainContent';

const StyledLayout = styled(Layout)`
  height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
  color: var(--text-primary);

  .ant-layout {
    background: transparent;
  }
`;

const ContentLayout = styled(Layout)`
  height: calc(100vh - var(--header-height));
`;

const AppLayout: React.FC = () => {
  const { theme } = useAppSelector(state => state.ui);

  return (
    <StyledLayout className={`theme-${theme}`}>
      {/* 顶部导航 - 在所有主题下都显示 */}
      <TopNavigation />

      {/* 主要内容区域 */}
      <ContentLayout className={`theme-${theme}`}>
        {/* 左侧面板 */}
        <SidePanel />

        {/* 主要内容 */}
        <MainContent />
      </ContentLayout>
    </StyledLayout>
  );
};

export default AppLayout;