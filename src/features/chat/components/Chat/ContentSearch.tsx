'use client';

import React, { FC, useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Input, Button, Space } from 'antd';
import type { InputRef } from 'antd';
import { SearchOutlined, CloseOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';

interface Props {
  isSearching: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentMatch?: number;
  totalMatches?: number;
}

const ContentSearch: FC<Props> = ({
  isSearching,
  onClose,
  onSearch,
  onNext,
  onPrevious,
  currentMatch = 0,
  totalMatches = 0
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<InputRef | null>(null);

  useEffect(() => {
    if (isSearching) {
      inputRef.current?.focus();
    }
  }, [isSearching]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        onPrevious();
      } else {
        onNext();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isSearching) {
    return null;
  }

  return (
    <Container>
      <SearchWrapper>
        <SearchInput>
          <Input
            ref={inputRef}
            placeholder="搜索消息..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            prefix={<SearchOutlined />}
            suffix={
              searchQuery && (
                <SearchCount>
                  {totalMatches > 0 ? `${currentMatch}/${totalMatches}` : '0/0'}
                </SearchCount>
              )
            }
          />
        </SearchInput>
        <ButtonGroup>
          <NavButton
            icon={<UpOutlined />}
            onClick={onPrevious}
            disabled={totalMatches === 0}
            size="small"
          />
          <NavButton
            icon={<DownOutlined />}
            onClick={onNext}
            disabled={totalMatches === 0}
            size="small"
          />
          <CloseButton
            icon={<CloseOutlined />}
            onClick={onClose}
            size="small"
          />
        </ButtonGroup>
      </SearchWrapper>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  top: 10px;
  right: 20px;
  z-index: 100;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchInput = styled.div`
  width: 300px;

  .ant-input-affix-wrapper {
    background: var(--color-background-soft);
    border-color: var(--color-border);

    &:hover,
    &:focus-within {
      border-color: var(--color-primary);
    }
  }

  .ant-input {
    background: transparent;
    color: var(--color-text);
  }
`;

const SearchCount = styled.span`
  color: var(--color-text-secondary);
  font-size: 12px;
  margin-right: 4px;
`;

const ButtonGroup = styled(Space)`
  display: flex;
`;

const NavButton = styled(Button)`
  &.ant-btn {
    background: var(--color-background-soft);
    border-color: var(--color-border);
    color: var(--color-text);

    &:hover:not(:disabled) {
      background: var(--color-background-mute);
      border-color: var(--color-border-soft);
    }

    &:disabled {
      opacity: 0.4;
    }
  }
`;

const CloseButton = styled(Button)`
  &.ant-btn {
    background: var(--color-background-soft);
    border-color: var(--color-border);
    color: var(--color-text);

    &:hover {
      background: var(--color-background-mute);
      border-color: var(--color-border-soft);
    }
  }
`;

export default ContentSearch;
