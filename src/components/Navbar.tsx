'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Dropdown, Avatar, Tabs, App } from 'antd';
import {
  BellOutlined,
  SettingOutlined,
  BulbOutlined,
  PlusOutlined,
  HomeOutlined,
  RobotOutlined,
  DatabaseOutlined,
  ApiOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { authService } from '@/services/auth';

interface TabItem {
  key: string;
  label: React.ReactNode;
  closable: boolean;
}

interface NavbarProps {
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
}

// Tab configurations
const tabConfigs: Record<string, { label: React.ReactNode; icon: React.ReactNode }> = {
  agents: {
    label: 'Agents',
    icon: <RobotOutlined />,
  },
  knowledge: {
    label: 'Knowledge Base',
    icon: <DatabaseOutlined />,
  },
  providers: {
    label: 'Providers',
    icon: <ApiOutlined />,
  },
  // apps 不需要创建标签页
};

// Global tabs state (persisted across component re-renders)
let globalTabs: TabItem[] = [
  {
    key: 'home',
    label: (
      <span className="flex items-center gap-1">
        <HomeOutlined />
        <span>首页</span>
      </span>
    ),
    closable: false,
  },
];

export default function Navbar({ activeTabKey = 'home', onTabChange }: NavbarProps) {
  const router = useRouter();
  const { message } = App.useApp();
  const [darkMode, setDarkMode] = useState(false);
  const [internalActiveKey, setInternalActiveKey] = useState(activeTabKey);
  const [tabs, setTabs] = useState<TabItem[]>(globalTabs);

  // Add tab based on activeTabKey when component mounts or activeTabKey changes
  useEffect(() => {
    // Only add tab if it's not 'home' and not 'apps' (apps page doesn't need a tab)
    if (activeTabKey !== 'home' && activeTabKey !== 'apps' && tabConfigs[activeTabKey]) {
      setTabs(prevTabs => {
        const existingTab = prevTabs.find(tab => tab.key === activeTabKey);
        if (!existingTab) {
          const config = tabConfigs[activeTabKey];
          const newTab: TabItem = {
            key: activeTabKey,
            label: (
              <span className="flex items-center gap-1">
                {config.icon}
                <span>{config.label}</span>
              </span>
            ),
            closable: true,
          };
          const updatedTabs = [...prevTabs, newTab];
          globalTabs = updatedTabs; // Update global state
          return updatedTabs;
        }
        return prevTabs;
      });
    }
    // Set active key even for apps page, just don't create a tab
    if (activeTabKey === 'apps') {
      setInternalActiveKey('home'); // Keep home tab active when on apps page
    } else {
      setInternalActiveKey(activeTabKey);
    }
  }, [activeTabKey]);

  const handleLogout = () => {
    authService.clearTokens();
    message.success('Logged out successfully');
    router.push('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleTabChange = (key: string) => {
    setInternalActiveKey(key);
    if (onTabChange) {
      onTabChange(key);
    }

    // Navigate based on tab key
    if (key === 'home') {
      router.push('/chat');
    } else if (key === 'agents') {
      router.push('/agents');
    } else if (key === 'knowledge') {
      router.push('/knowledge-bases');
    } else if (key === 'apps') {
      router.push('/apps');
    }
  };

  const handleTabEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove' && typeof targetKey === 'string') {
      const newTabs = tabs.filter(tab => tab.key !== targetKey);
      setTabs(newTabs);
      globalTabs = newTabs; // Update global state

      // If removing current active tab, switch to home
      if (targetKey === internalActiveKey) {
        setInternalActiveKey('home');
        handleTabChange('home');
      }
    }
  };

  const handleAddClick = () => {
    // Navigate to apps page
    router.push('/apps');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-background-dark/10 bg-background-light/80 backdrop-blur-sm dark:border-background-light/10 dark:bg-background-dark/80">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Tab Items */}
          <Tabs
            type="editable-card"
            activeKey={internalActiveKey}
            onChange={handleTabChange}
            onEdit={handleTabEdit}
            hideAdd
            items={tabs.map(tab => ({
              key: tab.key,
              label: tab.key === 'home' ? (
                <div
                  onClick={() => router.push('/chat')}
                  className="cursor-pointer"
                >
                  {tab.label}
                </div>
              ) : tab.label,
              closable: tab.closable,
            }))}
            className="apps-tabs"
          />
          {/* Add button */}
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={handleAddClick}
            className="flex h-9 w-9 items-center justify-center text-background-dark/60 dark:text-background-light/60"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<BellOutlined />}
            className="flex h-9 w-9 items-center justify-center text-background-dark/60 dark:text-background-light/60"
          />
          <Button
            type="text"
            icon={darkMode ? <BulbOutlined /> : <BulbOutlined />}
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center text-background-dark/60 dark:text-background-light/60"
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            className="flex h-9 w-9 items-center justify-center text-background-dark/60 dark:text-background-light/60"
          />
          <Dropdown
            menu={{
              items: [
                { key: 'profile', label: 'Profile' },
                { key: 'settings', label: 'Settings' },
                { type: 'divider' },
                { key: 'logout', label: 'Logout', onClick: handleLogout },
              ],
            }}
          >
            <Avatar
              size={40}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8GKP6ra-5KwJvQTEiKL-Yhdu0bPWeRbgMJ3wP3baXJveeUjW2JKF1zKclSU4FMPCKVczlG_9RxfLx50BkotDBJFgpz0owV0cVXKJgiVxU06al6SJ2XkGoGCgQQBKmdlgTS0oY54uzfupOkc7MNnnS54kPjSKANt4mh1BIMYqyGOJ_k6PIv8XK03Ls4QVg2T_aZqv7ssY9oVHTHvPrfbdYFD_j0s0E6-8S25184CdtA0JCGqLADPDEIGqT7DFZFNPNMOTqBSXD2yo"
              className="cursor-pointer"
            />
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
