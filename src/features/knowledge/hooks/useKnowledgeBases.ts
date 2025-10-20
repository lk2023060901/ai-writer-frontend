'use client';

import { useCallback } from 'react';
import { useLaunchpad } from '@/features/launchpad/hooks/useLaunchpad';
import type { KnowledgeBase } from '@/types/launchpad';

export const useKnowledgeBases = () => {
  const {
    knowledgeBases,
    renameKnowledgeBase,
    deleteKnowledgeBase,
    addKnowledgeBase,
    setKnowledgeBasesOrder,
    updateKnowledgeBase,
  } = useLaunchpad();

  const updateKnowledgeBases = useCallback(
    (next: KnowledgeBase[]) => {
      setKnowledgeBasesOrder(next);
    },
    [setKnowledgeBasesOrder]
  );

  return {
    bases: knowledgeBases,
    renameKnowledgeBase,
    deleteKnowledgeBase,
    addKnowledgeBase,
    updateKnowledgeBases,
    updateKnowledgeBase,
  };
};
