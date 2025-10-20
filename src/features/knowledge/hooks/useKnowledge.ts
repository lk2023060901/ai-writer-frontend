'use client';

import { useMemo } from 'react';
import { useLaunchpad } from '@/features/launchpad/hooks/useLaunchpad';
import type {
  KnowledgeBase,
  KnowledgeDirectoryItem,
  KnowledgeFileItem,
  KnowledgeNoteItem,
  KnowledgeSitemapItem,
  KnowledgeUrlItem,
} from '@/types/launchpad';

interface KnowledgeResult {
  base: KnowledgeBase | undefined;
  fileItems: KnowledgeFileItem[];
  noteItems: KnowledgeNoteItem[];
  directoryItems: KnowledgeDirectoryItem[];
  urlItems: KnowledgeUrlItem[];
  sitemapItems: KnowledgeSitemapItem[];
}

export const useKnowledge = (baseId: string | undefined): KnowledgeResult => {
  const { knowledgeBases } = useLaunchpad();

  return useMemo(() => {
    const base = knowledgeBases.find((item) => item.id === baseId);
    return {
      base,
      fileItems: base?.files ?? [],
      noteItems: base?.notes ?? [],
      directoryItems: base?.directories ?? [],
      urlItems: base?.urls ?? [],
      sitemapItems: base?.sitemaps ?? [],
    };
  }, [knowledgeBases, baseId]);
};
