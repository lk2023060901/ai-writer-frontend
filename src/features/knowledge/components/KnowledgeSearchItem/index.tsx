'use client';

import styled from 'styled-components';

import type { KnowledgeSearchResult } from '@/types/launchpad';

import TextItem from './TextItem';

interface Props {
  item: KnowledgeSearchResult;
  searchKeyword: string;
}

const KnowledgeSearchItem: React.FC<Props> = ({ item, searchKeyword }) => {
  return (
    <ResultItem>
      <TextItem item={item} searchKeyword={searchKeyword} />
    </ResultItem>
  );
};

export default KnowledgeSearchItem;

const ResultItem = styled.div`
  width: 100%;
  position: relative;
  padding: 16px;
  background: var(--color-background-soft);
  border-radius: 12px;
  border: 0.5px solid var(--color-border);

  &:hover {
    .knowledge-search-tag-container {
      opacity: 1 !important;
    }
  }
`;
