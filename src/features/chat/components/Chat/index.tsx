'use client';

import React, { FC, useState, useRef } from 'react';
import styled from 'styled-components';
import { Flex } from 'antd';
import { HStack } from '@/shared/ui/layout/primitives';
import { Assistant, Topic } from '@/features/chat/hooks/useMockData';
import ChatNavbar from './ChatNavbar';
import Messages from './Messages';
import Inputbar from './Inputbar';
import ContentSearch from './ContentSearch';
import ChatNavigation from './ChatNavigation';
import { nanoid } from 'nanoid';

interface Props {
  assistant: Assistant;
  activeTopic: Topic;
  setActiveTopic: (topic: Topic) => void;
  createTopic: (name?: string) => Topic;
  updateTopic: (assistantId: string, topic: Topic) => void;
  showAssistants: boolean;
  toggleShowAssistants: () => void;
}

const Chat: FC<Props> = ({
  assistant,
  activeTopic,
  setActiveTopic,
  createTopic,
  updateTopic,
  showAssistants,
  toggleShowAssistants,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchMatch, setCurrentSearchMatch] = useState(0);
  const [totalSearchMatches, setTotalSearchMatches] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  // ChatNavbar 始终显示在聊天区域顶部
  const showChatNavbar = true;

  // 动态计算最大宽度 - 如果侧边栏显示，需要减去侧边栏宽度
  const chatMaxWidth = showAssistants ? 'calc(100vw - var(--assistants-width))' : '100vw';

  const handleAddNewTopic = () => {
    const topic = createTopic();
    setActiveTopic(topic);
  };

  const handleClearTopic = () => {
    console.log('清空话题');
    const clearedTopic = {
      ...activeTopic,
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setActiveTopic(clearedTopic);
    updateTopic(assistant.id, clearedTopic);
  };

  const handleNewContext = () => {
    const topic = createTopic(`${activeTopic.name} - New context`);
    setActiveTopic(topic);
  };

  const handlePause = () => {
    console.log('暂停生成');
    setIsGenerating(false);
  };

  const handleSendMessage = (content: string) => {
    const userMessage = {
      id: nanoid(),
      role: 'user' as const,
      content,
      createdAt: new Date().toISOString()
    };

    const updatedTopic = {
      ...activeTopic,
      messages: [...activeTopic.messages, userMessage],
      updatedAt: new Date().toISOString()
    };

    setActiveTopic(updatedTopic);
    updateTopic(assistant.id, updatedTopic);

    setIsGenerating(true);
    setTimeout(() => {
      const assistantMessage = {
        id: nanoid(),
        role: 'assistant' as const,
        content: `This is a simulated response to: "${content}"`,
        createdAt: new Date().toISOString()
      };

      const topicWithAssistantReply = {
        ...updatedTopic,
        messages: [...updatedTopic.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      };
      setActiveTopic(topicWithAssistantReply);
      updateTopic(assistant.id, topicWithAssistantReply);
      setIsGenerating(false);
    }, 1000);
  };

  // Search handlers
  const handleToggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setCurrentSearchMatch(0);
      setTotalSearchMatches(0);
    }
  };

  const handleSearch = (query: string) => {
    // TODO: Implement actual search logic
    // This would search through messages and highlight matches
    if (query) {
      // Mock search results
      setTotalSearchMatches(3);
      setCurrentSearchMatch(1);
    } else {
      setTotalSearchMatches(0);
      setCurrentSearchMatch(0);
    }
  };

  const handleSearchNext = () => {
    if (currentSearchMatch < totalSearchMatches) {
      setCurrentSearchMatch(currentSearchMatch + 1);
    } else {
      setCurrentSearchMatch(1);
    }
  };

  const handleSearchPrevious = () => {
    if (currentSearchMatch > 1) {
      setCurrentSearchMatch(currentSearchMatch - 1);
    } else {
      setCurrentSearchMatch(totalSearchMatches);
    }
  };


  return (
    <Container id="chat">
      {showChatNavbar && (
        <ChatNavbar
          assistant={assistant}
          showAssistants={showAssistants}
          toggleShowAssistants={toggleShowAssistants}
        />
      )}
      <HStack style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Main
          ref={mainRef}
          id="chat-main"
          vertical
          flex={1}
          justify="space-between"
          style={{ maxWidth: chatMaxWidth, height: '100%', position: 'relative' }}>
          <MessagesWrapper>
            <Messages
              messages={activeTopic.messages}
              assistant={assistant}
              topic={activeTopic}
              showPrompt={true}
            />
          </MessagesWrapper>

          {/* Content Search Component */}
          <ContentSearch
            isSearching={isSearching}
            onClose={handleToggleSearch}
            onSearch={handleSearch}
            onNext={handleSearchNext}
            onPrevious={handleSearchPrevious}
            currentMatch={currentSearchMatch}
            totalMatches={totalSearchMatches}
          />

          {/* Chat Navigation Component */}
          <ChatNavigation containerId="messages" />

          <Inputbar
            onSendMessage={handleSendMessage}
            disabled={isGenerating}
            loading={isGenerating}
            addNewTopic={handleAddNewTopic}
            clearTopic={handleClearTopic}
            onNewContext={handleNewContext}
            onPause={handlePause}
          />
        </Main>
      </HStack>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--navbar-height));
  flex: 1;
  overflow: hidden;
`;

const Main = styled(Flex)`
  transform: translateZ(0);
  position: relative;
`;

const MessagesWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

export default Chat;
