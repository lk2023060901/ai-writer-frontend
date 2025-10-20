import type { KnowledgeBase, KnowledgeSearchResult } from '@/types/launchpad';
import { knowledgeSearchDataset } from '@/features/knowledge/data/search';

const wait = (duration = 280) => new Promise((resolve) => setTimeout(resolve, duration));

export const searchKnowledgeBase = async (
  keyword: string,
  base: KnowledgeBase
): Promise<KnowledgeSearchResult[]> => {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return [];
  }

  await wait();

  const dataset = knowledgeSearchDataset[base.id] ?? [];
  const lowerKeyword = trimmed.toLowerCase();

  return dataset
    .filter((item) => {
      const haystacks = [item.title, item.pageContent, item.metadata.source];
      return haystacks.some((value) => value.toLowerCase().includes(lowerKeyword));
    })
    .map((item) => ({
      ...item,
      score: item.score ?? 0,
    }));
};
