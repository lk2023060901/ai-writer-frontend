'use client';

import { Typography } from 'antd';

import type { KnowledgeSearchResult } from '@/types/launchpad';

import { CopyButtonContainer, KnowledgeItemMetadata } from './components';
import { useHighlightText } from './hooks';

const { Paragraph } = Typography;

interface Props {
  item: KnowledgeSearchResult;
  searchKeyword: string;
}

const TextItem: React.FC<Props> = ({ item, searchKeyword }) => {
  const { highlightText } = useHighlightText();

  return (
    <>
      <KnowledgeItemMetadata item={item} />
      <CopyButtonContainer textToCopy={item.pageContent} />
      <Paragraph style={{ userSelect: 'text', marginBottom: 0 }}>
        {highlightText(item.pageContent, searchKeyword)}
      </Paragraph>
    </>
  );
};

export default TextItem;
