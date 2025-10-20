'use client';

import React, { FC, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { Avatar, Tooltip } from 'antd';
import {
  Home,
  Plus,
  Bell,
  Moon,
  Sun,
  Settings,
  X
} from 'lucide-react';
import { useTabs } from '@/shared/context/TabsContext';

const UserAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

const Navbar: FC = () => {
  const router = useRouter();
  const [theme, setTheme] = React.useState('dark');
  const { tabs, activeTabId, addTab, removeTab, setActiveTab, reorderTabs } = useTabs();

  // Initialize with home tab
  useEffect(() => {
    if (tabs.length === 0) {
      addTab({
        id: 'chat',
        name: '首页',
        icon: <Home size={14} />,
        path: '/chat',
        closable: false
      });
    }
  }, [tabs.length, addTab]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    document.documentElement.setAttribute('theme-mode', theme === 'dark' ? 'light' : 'dark');
  };

  const handleTabClick = (tab: { id: string; path: string }) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    removeTab(tabId);
  };

  const handleAddTab = () => {
    router.push('/launchpad');
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, tabId: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', tabId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, tabId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');
    if (sourceId) {
      reorderTabs(sourceId, tabId);
    }
  };

  return (
    <Container id="app-navbar">
      {/* Left section - Tabs */}
      <TabsSection>
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            $active={activeTabId === tab.id}
            onClick={() => handleTabClick(tab)}
            draggable
            onDragStart={(event) => handleDragStart(event, tab.id)}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, tab.id)}
          >
            <TabIcon>{tab.icon}</TabIcon>
            <TabName>{tab.name}</TabName>
            {tab.closable && (
              <CloseButton onClick={(e) => handleCloseTab(e, tab.id)}>
                <X size={12} />
              </CloseButton>
            )}
          </TabItem>
        ))}
        <AddTabButton onClick={handleAddTab}>
          <Plus size={16} />
        </AddTabButton>
      </TabsSection>

      {/* Right section - Actions */}
      <ActionsSection>
        <Tooltip title="Notifications" mouseEnterDelay={0.8}>
          <ActionIcon theme={theme}>
            <Bell size={18} className="icon" />
          </ActionIcon>
        </Tooltip>
        <Tooltip title={`Theme: ${theme}`} mouseEnterDelay={0.8}>
          <ActionIcon theme={theme} onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Moon size={18} className="icon" />
            ) : (
              <Sun size={18} className="icon" />
            )}
          </ActionIcon>
        </Tooltip>
        <Tooltip title="Settings" mouseEnterDelay={0.8}>
          <ActionIcon theme={theme} onClick={() => router.push('/settings')}>
            <Settings size={18} className="icon" />
          </ActionIcon>
        </Tooltip>
        <AvatarImg src={UserAvatar} draggable={false} />
      </ActionsSection>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: var(--navbar-height);
  width: 100%;
  background-color: var(--navbar-background);
  border-bottom: 0.5px solid var(--color-border);
  padding: 0 12px;
  gap: 16px;
`;

const TabsSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 0;
  }
`;

const TabItem = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  height: 28px;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? 'var(--color-background-soft)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--color-text)' : 'var(--color-text-secondary)')};
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: all 0.2s ease;
  border: 0.5px solid ${({ $active }) => ($active ? 'var(--color-border)' : 'transparent')};

  &:hover {
    background: var(--color-background-soft);
    color: var(--color-text);
  }
`;

const TabIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TabName = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

const CloseButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  opacity: 0.6;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    background: var(--color-background-mute);
  }
`;

const AddTabButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: var(--color-icon);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--color-background-soft);
    color: var(--color-icon-white);
  }
`;

const ActionsSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ActionIcon = styled.div<{ theme: string }>`
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: var(--color-icon);

  &:hover {
    background-color: var(--color-background-soft);
    color: var(--color-icon-white);
  }

  .icon {
    color: inherit;
  }
`;

const AvatarImg = styled(Avatar)`
  width: 28px;
  height: 28px;
  background-color: var(--color-background-soft);
  border: none;
  cursor: pointer;
  flex-shrink: 0;
`;

export default Navbar;
