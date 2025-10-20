'use client';

import { FileSearchOutlined } from '@ant-design/icons';
import HorizontalScrollContainer from '@/shared/ui/containers/HorizontalScrollContainer';
import CustomTag from '@/shared/ui/tags/CustomTag';
import { FC } from 'react';
import styled from 'styled-components';

export interface KnowledgeBase {
  id: string;
  name: string;
}

const KnowledgeBaseInput: FC<{
  selectedKnowledgeBases: KnowledgeBase[];
  onRemoveKnowledgeBase: (knowledgeBase: KnowledgeBase) => void;
}> = ({ selectedKnowledgeBases, onRemoveKnowledgeBase }) => {
  if (selectedKnowledgeBases.length === 0) {
    return null;
  }

  return (
    <Container>
      <HorizontalScrollContainer dependencies={[selectedKnowledgeBases]} expandable>
        {selectedKnowledgeBases.map((knowledgeBase) => (
          <CustomTag
            icon={<FileSearchOutlined />}
            color="#3d9d0f"
            key={knowledgeBase.id}
            closable
            onClose={() => onRemoveKnowledgeBase(knowledgeBase)}>
            {knowledgeBase.name}
          </CustomTag>
        ))}
      </HorizontalScrollContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  padding: 5px 15px 5px 15px;
`;

export default KnowledgeBaseInput;
