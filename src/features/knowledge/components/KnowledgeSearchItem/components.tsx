'use client';

import { CopyOutlined } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import styled from 'styled-components';

import { useCopyText, useKnowledgeItemMetadata } from './hooks';

const { Text } = Typography;

export const KnowledgeItemMetadata = ({
  item,
}: {
  item: {
    metadata: { source: string };
    file?: { originName: string; path?: string } | null;
    score: number;
  };
}) => {
  const { getSourceLink } = useKnowledgeItemMetadata();
  const source = getSourceLink(item);

  return (
    <MetadataContainer>
      <Text type="secondary">
        来源：
        <a href={source.href} target="_blank" rel="noreferrer">
          {source.text}
        </a>
      </Text>
      {item.score ? <ScoreTag>Score: {(item.score * 100).toFixed(1)}%</ScoreTag> : null}
    </MetadataContainer>
  );
};

export const CopyButtonContainer = ({ textToCopy }: { textToCopy: string }) => {
  const { handleCopy } = useCopyText();

  return (
    <TagContainer className="knowledge-search-tag-container">
      <Tooltip title="复制文本">
        <CopyButton onClick={() => handleCopy(textToCopy)}>
          <CopyOutlined />
        </CopyButton>
      </Tooltip>
    </TagContainer>
  );
};

export const MetadataContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
`;

export const ScoreTag = styled.div`
  padding: 2px 8px;
  background: var(--color-primary);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  flex-shrink: 0;
`;

export const TagContainer = styled.div`
  position: absolute;
  top: 58px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
`;

export const CopyButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-background-mute);
  color: var(--color-text);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary);
    color: #fff;
  }
`;
