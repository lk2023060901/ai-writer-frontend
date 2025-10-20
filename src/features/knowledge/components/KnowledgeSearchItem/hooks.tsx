'use client';

import { message } from 'antd';
import { useCallback } from 'react';

const escapeRegExp = (input: string) => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const useHighlightText = () => {
  const highlightText = useCallback((text: string, keyword: string) => {
    if (!keyword.trim()) {
      return [text];
    }

    const escapedKeyword = escapeRegExp(keyword);
    const parts = text.split(new RegExp(`(${escapedKeyword})`, 'gi'));

    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <mark key={index}>{part}</mark>
      ) : (
        part
      )
    );
  }, []);

  return { highlightText };
};

export const useCopyText = () => {
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('已复制到剪贴板');
    } catch {
      message.error('复制失败，请重试');
    }
  }, []);

  return { handleCopy };
};

const isValidUrl = (input: string) => /^https?:\/\//i.test(input);

export const useKnowledgeItemMetadata = () => {
  const getSourceLink = useCallback((item: { metadata: { source: string }; file?: { originName: string; path?: string } | null }) => {
    if (item.file) {
      return {
        href: item.file.path ? `file://${item.file.path}` : '#',
        text: item.file.originName,
      };
    }

    if (isValidUrl(item.metadata.source)) {
      return {
        href: item.metadata.source,
        text: item.metadata.source,
      };
    }

    return {
      href: '#',
      text: item.metadata.source,
    };
  }, []);

  return { getSourceLink };
};
