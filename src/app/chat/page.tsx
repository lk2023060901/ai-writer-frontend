'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Dropdown, Avatar, Badge, App } from 'antd';
import {
  MenuOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { authService } from '@/services/auth';
import Navbar from '@/components/Navbar';
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';

export default function ChatPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [quickQuestionsVisible, setQuickQuestionsVisible] = useState(true);
  const [messageFontSize, setMessageFontSize] = useState(14);
  const [selectedProvider, setSelectedProvider] = useState({
    name: 'Gemini 1.5 Pro',
    service: 'Service Provider',
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      message.warning('Please login first');
      router.push('/login');
    }
  }, [router, message]);

  const providerMenuItems = [
    {
      key: 'gemini',
      label: 'Gemini 1.5 Pro',
      onClick: () => setSelectedProvider({ name: 'Gemini 1.5 Pro', service: 'Google' }),
    },
    {
      key: 'gpt4',
      label: 'GPT-4',
      onClick: () => setSelectedProvider({ name: 'GPT-4', service: 'OpenAI' }),
    },
    {
      key: 'claude',
      label: 'Claude 3',
      onClick: () => setSelectedProvider({ name: 'Claude 3', service: 'Anthropic' }),
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-background-light dark:bg-background-dark">
      {/* Use common Navbar component */}
      <Navbar activeTabKey="home" />

      {/* Main Content */}
      <main className="grid h-full flex-1 grid-cols-12 overflow-hidden">
        {/* Sidebar */}
        {sidebarVisible && (
          <aside className="col-span-3 border-r border-background-dark/10 dark:border-background-light/10">
            <ChatSidebar
              quickQuestionsVisible={quickQuestionsVisible}
              onQuickQuestionsToggle={setQuickQuestionsVisible}
              fontSize={messageFontSize}
              onFontSizeChange={setMessageFontSize}
            />
          </aside>
        )}

        {/* Chat Area */}
        <main className={`flex h-full flex-col ${sidebarVisible ? 'col-span-9' : 'col-span-12'}`}>
          {/* Chat Controls */}
          <div className="flex items-center justify-between px-4 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="flex h-8 w-8 items-center justify-center text-background-dark/60 dark:text-background-light/60"
              />
              <Dropdown menu={{ items: providerMenuItems }}>
                <Button className="flex items-center gap-2 rounded-md bg-background-dark/5 px-3 py-1.5 text-sm font-medium dark:bg-background-light/5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-background-dark dark:text-background-light">{selectedProvider.name}</span>
                  <span className="mx-1 h-4 w-px bg-background-dark/20 dark:bg-background-light/20" />
                  <span className="text-background-dark/60 dark:text-background-light/60">
                    {selectedProvider.service}
                  </span>
                </Button>
              </Dropdown>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="text"
                icon={<HistoryOutlined />}
                className="flex h-8 w-8 items-center justify-center text-background-dark/60 dark:text-background-light/60"
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <ChatMessages quickQuestionsVisible={quickQuestionsVisible} fontSize={messageFontSize} />
          </div>

          {/* Input */}
          <div className="shrink-0 max-h-64 overflow-y-auto border-t border-background-dark/10 px-4 py-4 dark:border-background-light/10">
            <ChatInput />
          </div>
        </main>
      </main>
    </div>
  );
}
