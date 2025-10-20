'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import { Input, List, Spin } from 'antd';
import type { InputRef } from 'antd';
import { Search } from 'lucide-react';

import type { KnowledgeBase, KnowledgeSearchResult } from '@/types/launchpad';
import KnowledgeSearchItem from './KnowledgeSearchItem';
import { searchKnowledgeBase } from '@/features/knowledge/services/searchKnowledge';

interface ShowParams {
  base: KnowledgeBase;
}

interface PopupProps extends ShowParams {
  onClose: () => void;
}

const MODAL_WIDTH = 700;

const PopupContainer = ({ base, onClose }: PopupProps) => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const inputRef = useRef<InputRef>(null);

  const performSearch = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchKnowledgeBase(trimmed, base);
        setResults(data);
      } finally {
        setLoading(false);
      }
    },
    [base]
  );

  const handleSubmit = useCallback(() => {
    performSearch(keyword);
  }, [keyword, performSearch]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    const value = event.target.value;
    setKeyword(value);
    if (!value.trim()) {
      setResults([]);
    }
  }, []);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const handleAfterClose = useCallback(() => {
    onClose();
    KnowledgeSearchPopup.hide = () => currentUnmount?.();
  }, [onClose]);

  KnowledgeSearchPopup.hide = handleCancel;

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = '';
    };
  }, [open, handleCancel]);

  useEffect(() => {
    if (!open) {
      handleAfterClose();
    }
  }, [open, handleAfterClose]);

  if (!open) {
    return null;
  }

  return (
    <Overlay onMouseDown={handleCancel}>
      <Dialog
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}>
        <SearchBar>
          <Input
            ref={inputRef}
            prefix={
              <SearchIcon>
                <Search size={15} />
              </SearchIcon>
            }
            allowClear
            spellCheck={false}
            value={keyword}
            placeholder="搜索知识库"
            variant="borderless"
            size="middle"
            autoFocus
            style={{ paddingLeft: 0 }}
            onChange={handleChange}
            onPressEnter={handleSubmit}
          />
        </SearchBar>
        <Divider />
        <ResultsContainer>
          {loading ? (
            <LoadingContainer>
              <Spin size="large" />
            </LoadingContainer>
          ) : results.length > 0 ? (
            <List
              split={false}
              dataSource={results}
              renderItem={(item) => (
                <List.Item key={item.id} style={{ padding: '12px 0' }}>
                  <KnowledgeSearchItem item={item} searchKeyword={keyword} />
                </List.Item>
              )}
            />
          ) : keyword.trim() ? (
            <EmptyHint>未找到匹配结果，请调整关键字后重试。</EmptyHint>
          ) : (
            <EmptyHint>输入关键词以检索该知识库。</EmptyHint>
          )}
        </ResultsContainer>
      </Dialog>
    </Overlay>
  );
};

const ResultsContainer = styled.div`
  padding: 0 16px;
  max-height: 70vh;
  overflow-y: auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
`;

const EmptyHint = styled.div`
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-2);
  font-size: 14px;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 9999;
`;

const Dialog = styled.div`
  width: ${MODAL_WIDTH}px;
  max-width: 90vw;
  max-height: 80vh;
  background: var(--color-background);
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px 0;
`;

const Divider = styled.div`
  height: 1px;
  margin: 4px 0 0;
  background: var(--color-border);
`;

const SearchIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-soft);
  margin-right: 2px;
`;

let currentUnmount: (() => void) | null = null;

const KnowledgeSearchPopup = {
  show: ({ base }: ShowParams) => {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    return new Promise<void>((resolve) => {
      const cleanup = () => {
        root.unmount();
        container.parentNode?.removeChild(container);
        if (currentUnmount === cleanup) {
          currentUnmount = null;
        }
        resolve();
      };

      currentUnmount = cleanup;

      root.render(<PopupContainer base={base} onClose={cleanup} />);
    });
  },
  hide: () => {
    currentUnmount?.();
  },
};

export default KnowledgeSearchPopup;
