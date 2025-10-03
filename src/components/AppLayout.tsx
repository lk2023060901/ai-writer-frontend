'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Avatar, Button, Dropdown } from 'antd';
import {
  HomeOutlined,
  MessageOutlined,
  ApiOutlined,
  RobotOutlined,
  DatabaseOutlined,
  SettingOutlined,
  BellOutlined,
  BulbOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { authService } from '@/services/auth';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    authService.clearTokens();
    router.push('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: <Link href="/dashboard">Home</Link>,
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: <Link href="/chat">Chat</Link>,
    },
    {
      key: '/providers',
      icon: <ApiOutlined />,
      label: <Link href="/providers">Providers</Link>,
    },
    {
      key: '/agents',
      icon: <RobotOutlined />,
      label: <Link href="/agents">Agents</Link>,
    },
    {
      key: '/knowledge-bases',
      icon: <DatabaseOutlined />,
      label: <Link href="/knowledge-bases">Knowledge Bases</Link>,
    },
  ];

  const bottomMenuItems = [
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">Settings</Link>,
    },
  ];

  return (
    <Layout className="h-screen">
      <Header className="sticky top-0 z-30 flex items-center justify-between border-b border-background-dark/10 bg-background-light/80 px-4 backdrop-blur-sm dark:border-background-light/10 dark:bg-background-dark/80 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary dark:bg-primary/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
              </svg>
              <span>ConnectHub</span>
            </div>
          </Link>
          <Button
            type="text"
            icon={<PlusOutlined />}
            className="flex h-9 w-9 items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
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
            icon={<BulbOutlined />}
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
      </Header>

      <Layout>
        <Sider
          width={200}
          className="overflow-y-auto border-r border-background-dark/10 bg-background-light dark:border-background-light/10 dark:bg-background-dark/50"
        >
          <div className="p-4">
            <div className="rounded-lg bg-card-light p-2 dark:bg-card-dark">
              <Menu
                mode="inline"
                selectedKeys={[pathname]}
                items={menuItems}
                className="border-none bg-transparent"
              />
              <div className="my-3 border-t border-background-dark/10 dark:border-background-light/10" />
              <Menu
                mode="inline"
                selectedKeys={[pathname]}
                items={bottomMenuItems}
                className="border-none bg-transparent"
              />
            </div>
          </div>
        </Sider>

        <Content className="overflow-y-auto bg-background-light dark:bg-background-dark">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
