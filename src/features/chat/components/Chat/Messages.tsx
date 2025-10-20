'use client';

import React, { FC, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Message, Assistant, Topic } from '@/features/chat/hooks/useMockData';
import Prompt from './Prompt';
import MessageMenubar from './MessageMenubar';

interface Props {
  messages: Message[];
  assistant?: Assistant;
  topic?: Topic;
  showPrompt?: boolean;
}

const Messages: FC<Props> = ({ messages, assistant, topic, showPrompt = true }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 滚动到底部
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0; // 因为是 flex-direction: column-reverse
    }
  }, [messages]);

  // 按照 Cherry Studio 的方式,消息倒序显示
  const displayMessages = [...messages].reverse();

  return (
    <MessagesContainer id="messages" className="messages-container" ref={scrollContainerRef}>
      <NarrowLayout>
        <ScrollContainer>
          {displayMessages.length === 0 ? (
            <EmptyState>
              <EmptyIcon>💬</EmptyIcon>
              <EmptyTitle>开始对话</EmptyTitle>
              <EmptyDesc>发送消息开始聊天</EmptyDesc>
            </EmptyState>
          ) : (
            displayMessages.map((message, index) => (
              <MessageWrapper key={message.id} className={`message message-${message.role}`}>
                <MessageHeader className="message-header">
                  <MessageRole>{message.role === 'user' ? '你' : '助手'}</MessageRole>
                </MessageHeader>
                <MessageContent className="message-content-container">
                  {message.content}
                </MessageContent>
                <MessageMenubar
                  message={message}
                  isLastMessage={index === 0}
                  onCopy={() => {
                    navigator.clipboard.writeText(message.content);
                    console.log('已复制');
                  }}
                  onRegenerate={() => console.log('重新生成', message.id)}
                  onEdit={() => console.log('编辑', message.id)}
                  onDelete={() => console.log('删除', message.id)}
                />
              </MessageWrapper>
            ))
          )}
        </ScrollContainer>
        {showPrompt && assistant && <Prompt assistant={assistant} topic={topic} />}
      </NarrowLayout>
    </MessagesContainer>
  );
};

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 1;
  position: relative;
  flex: 1;

  /* 自定义滚动条样式 - 匹配 Cherry Studio */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-icon);
  }
`;

const NarrowLayout = styled.div`
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
`;

const ScrollContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  padding: 10px 10px 20px;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0.6;
  min-height: 400px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const EmptyTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
`;

const EmptyDesc = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  padding: 10px;
  border-radius: 10px;
  transition: background-color 0.3s ease;

  &.message-user {
    align-items: flex-end;
  }

  &.message-assistant {
    align-items: flex-start;
  }

  /* 菜单栏默认隐藏 */
  .menubar {
    opacity: 0;
    transition: opacity 0.2s ease;

    /* 最后一条消息始终显示 */
    &.show {
      opacity: 1;
    }
  }

  /* 鼠标悬停时显示菜单栏 */
  &:hover .menubar {
    opacity: 1;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
  margin-bottom: 4px;
`;

const MessageRole = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
`;

const MessageContent = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text);
  word-wrap: break-word;
  white-space: pre-wrap;

  .message-user & {
    background-color: var(--chat-background-user);
  }

  .message-assistant & {
    background-color: var(--color-background-soft);
  }
`;

export default Messages;
