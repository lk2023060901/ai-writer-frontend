'use client';

import React, { FC } from 'react';
import styled from 'styled-components';
import { Divider, Popover } from 'antd';
import { ArrowUp, Menu } from 'lucide-react';
import { HStack, VStack } from '@/shared/ui/layout/primitives';

interface Props {
  estimateTokenCount?: number;
  inputTokenCount?: number;
  contextCount?: { current: number; max: number };
  onClick?: () => void;
}

const TokenCount: FC<Props> = ({
  estimateTokenCount = 0,
  inputTokenCount = 0,
  contextCount = { current: 0, max: 8000 },
  onClick
}) => {
  const PopoverContent = () => {
    return (
      <VStack style={{ width: '185px' }}>
        <HStack style={{ justifyContent: 'space-between', width: '100%' }}>
          <Text>上下文数量</Text>
          <Text>
            <HStack style={{ alignItems: 'center' }}>
              {contextCount.current}
              <SlashSeparator>/</SlashSeparator>
              {contextCount.max}
            </HStack>
          </Text>
        </HStack>
        <Divider style={{ margin: '5px 0' }} />
        <HStack style={{ justifyContent: 'space-between', width: '100%' }}>
          <Text>估算Token数</Text>
          <Text>{estimateTokenCount}</Text>
        </HStack>
      </VStack>
    );
  };

  return (
    <Container onClick={onClick}>
      <Popover content={PopoverContent} arrow={false}>
        <HStack>
          <HStack style={{ alignItems: 'center' }}>
            <Menu size={12} className="icon" />
            {contextCount.current}
            <SlashSeparator>/</SlashSeparator>
            {contextCount.max}
          </HStack>
          <Divider type="vertical" style={{ marginTop: 3, marginLeft: 5, marginRight: 3 }} />
          <HStack style={{ alignItems: 'center' }}>
            <ArrowUp size={12} className="icon" />
            {inputTokenCount}
            <SlashSeparator>/</SlashSeparator>
            {estimateTokenCount}
          </HStack>
        </HStack>
      </Popover>
    </Container>
  );
};

const Container = styled.div`
  font-size: 11px;
  line-height: 16px;
  color: var(--color-text-secondary);
  z-index: 10;
  padding: 3px 10px;
  user-select: none;
  border-radius: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;

  .icon {
    margin-right: 3px;
  }

  @media (max-width: 800px) {
    display: none;
  }
`;

const Text = styled.div`
  font-size: 12px;
  color: var(--color-text);
`;

const SlashSeparator = styled.span`
  margin-left: 2px;
  margin-right: 2px;
`;

export default TokenCount;
