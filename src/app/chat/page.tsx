'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, App } from 'antd';
import {
  MenuOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { authService } from '@/services/auth';
import Navbar from '@/components/Navbar';
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import ModelSelectorModal from '@/components/ModelSelectorModal';

export default function ChatPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [quickQuestionsVisible, setQuickQuestionsVisible] = useState(true);
  const [messageFontSize, setMessageFontSize] = useState(14);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isNewConversation, setIsNewConversation] = useState(false);
  const [pendingAssistantId, setPendingAssistantId] = useState<string | null>(null);
  const [modelSelectorVisible, setModelSelectorVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<{
    modelName: string;
    providerName: string;
    providerId: string;
    modelId: string;
  } | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<{
    content: string;
    isStreaming: boolean;
  } | null>(null);
  const [messagesRefreshKey, setMessagesRefreshKey] = useState(0);

  const handleNewConversation = (agentId: string) => {
    setIsNewConversation(true);
    setPendingAssistantId(agentId);
    setSelectedTopic(null);
  };

  const handleTopicCreated = (topicId: string) => {
    setSelectedTopic(topicId);
    setIsNewConversation(false);
    setPendingAssistantId(null);
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      message.warning('Please login first');
      router.push('/login');
    }
  }, [router, message]);

  const handleSelectModel = (providerId: string, modelId: string, displayName: string, providerName: string) => {
    setSelectedModel({
      modelName: displayName,
      providerName: providerName,
      providerId: providerId,
      modelId: modelId,
    });
  };

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
              onAgentChange={setSelectedAgent}
              onTopicChange={setSelectedTopic}
              onNewConversation={handleNewConversation}
              onTopicModelChange={(model) => {
                if (model) {
                  setSelectedModel(model);
                  console.log('✅ [ChatPage] Updated selected model from topic:', model);
                }
              }}
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
              <Button
                onClick={() => setModelSelectorVisible(true)}
                className="flex items-center gap-2 rounded-md bg-background-dark/5 px-3 py-1.5 text-sm font-medium dark:bg-background-light/5"
              >
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-background-dark dark:text-background-light">
                  {selectedModel ? selectedModel.modelName : '选择模型'}
                </span>
                <span className="mx-1 h-4 w-px bg-background-dark/20 dark:bg-background-light/20" />
                <span className="text-background-dark/60 dark:text-background-light/60">
                  {selectedModel ? selectedModel.providerName : '未选择'}
                </span>
              </Button>
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
            {selectedTopic ? (
              <ChatMessages
                topicId={selectedTopic}
                quickQuestionsVisible={quickQuestionsVisible}
                fontSize={messageFontSize}
                streamingMessage={streamingMessage}
                refreshKey={messagesRefreshKey}
              />
            ) : isNewConversation ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined mb-4 text-6xl text-primary">
                  chat
                </span>
                <h3 className="text-lg font-semibold text-background-dark dark:text-background-light">
                  New Conversation
                </h3>
                <p className="mt-2 text-sm text-background-dark-60 dark:text-background-light-60">
                  Type your message below to start chatting
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined mb-4 text-6xl text-background-dark-30 dark:text-background-light-30">
                  chat_bubble_outline
                </span>
                <h3 className="text-lg font-semibold text-background-dark dark:text-background-light">
                  No conversation selected
                </h3>
                <p className="mt-2 text-sm text-background-dark-60 dark:text-background-light-60">
                  Select an assistant to start a new conversation
                </p>
              </div>
            )}
          </div>

          {/* Input */}
          {(selectedTopic || isNewConversation) && (
            <div className="relative shrink-0 border-t border-background-dark/10 px-4 py-4 dark:border-background-light/10">
              <ChatInput
                topicId={selectedTopic}
                assistantId={pendingAssistantId}
                selectedModel={selectedModel}
                onTopicCreated={handleTopicCreated}
                onMessageStart={() => {
                  console.log('Message streaming started');
                  setStreamingMessage({ content: '', isStreaming: true });
                }}
                onMessageComplete={() => {
                  console.log('Message streaming completed');
                  setStreamingMessage(null);
                  // Trigger messages reload
                  setMessagesRefreshKey(prev => prev + 1);
                }}
                onToken={(content) => {
                  setStreamingMessage((prev) => ({
                    content: (prev?.content || '') + content,
                    isStreaming: true,
                  }));
                }}
              />
            </div>
          )}
        </main>
      </main>

      {/* Model Selector Modal */}
      <ModelSelectorModal
        open={modelSelectorVisible}
        onCancel={() => setModelSelectorVisible(false)}
        onSelect={handleSelectModel}
        currentProvider={selectedModel?.providerId}
        currentModel={selectedModel?.modelId}
      />
    </div>
  );
}
