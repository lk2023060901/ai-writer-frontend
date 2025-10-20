'use client';

import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { Button, Tooltip } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Languages } from 'lucide-react';

interface Props {
  text?: string;
  onTranslated?: (translatedText: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const TranslateButton: FC<Props> = ({ text, onTranslated, disabled, isLoading }) => {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!text?.trim()) return;

    setIsTranslating(true);
    try {
      // TODO: 实现翻译逻辑
      // 模拟翻译延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const translatedText = `[已翻译] ${text}`;
      onTranslated?.(translatedText);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Tooltip placement="top" title="翻译" mouseLeaveDelay={0} arrow>
      <ToolbarButton
        onClick={handleTranslate}
        disabled={disabled || isTranslating || isLoading}
        type="text">
        {isTranslating || isLoading ? <LoadingOutlined spin /> : <Languages size={18} />}
      </ToolbarButton>
    </Tooltip>
  );
};

const ToolbarButton = styled(Button)`
  min-width: 30px;
  height: 30px;
  font-size: 16px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: var(--color-icon);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0;

  &.anticon,
  &.iconfont {
    transition: all 0.3s ease;
    color: var(--color-icon);
  }

  &:hover {
    background-color: var(--color-background-soft);

    .anticon,
    .iconfont {
      color: var(--color-text);
    }
  }

  &.active {
    background-color: var(--color-primary) !important;

    .anticon,
    .iconfont {
      color: white;
    }

    &:hover {
      background-color: var(--color-primary);
    }
  }
`;

export default TranslateButton;
