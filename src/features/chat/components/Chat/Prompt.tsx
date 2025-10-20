'use client';

import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Assistant, Topic } from '@/features/chat/hooks/useMockData';

interface Props {
  assistant: Assistant;
  topic?: Topic;
}

const Prompt: FC<Props> = ({ assistant, topic }) => {
  const prompt = assistant.prompt || '我是一个智能助手，可以帮助你解答各种问题。';
  const topicPrompt = topic?.prompt || '';

  // 用于控制显示的状态
  const [displayText, setDisplayText] = useState(prompt);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 直接显示处理后的内容
    setDisplayText(prompt);
    setIsVisible(true);
  }, [prompt]);

  if (!prompt && !topicPrompt) {
    return null;
  }

  const handleClick = () => {
    // TODO: 打开助手设置弹窗
    console.log('打开助手设置', assistant);
  };

  return (
    <Container className="system-prompt" onClick={handleClick}>
      <Text $isVisible={isVisible}>{displayText}</Text>
    </Container>
  );
};

const Container = styled.div`
  padding: 11px 16px;
  border-radius: 10px;
  cursor: pointer;
  border: 0.5px solid var(--color-border);
  margin: 15px 20px;
  margin-bottom: 0;
  background-color: var(--color-background-soft);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-background-mute);
    border-color: var(--color-border-soft);
  }
`;

const Text = styled.div<{ $isVisible: boolean }>`
  color: var(--color-text-2);
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  user-select: none;
  line-height: 1.5;

  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

export default Prompt;