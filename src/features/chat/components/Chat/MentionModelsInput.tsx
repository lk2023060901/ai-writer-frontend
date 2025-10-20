'use client';

import HorizontalScrollContainer from '@/shared/ui/containers/HorizontalScrollContainer';
import CustomTag from '@/shared/ui/tags/CustomTag';
import { FC } from 'react';
import styled from 'styled-components';

export interface Model {
  id: string;
  name: string;
  provider: string;
  providerName?: string;
}

const MentionModelsInput: FC<{
  selectedModels: Model[];
  onRemoveModel: (model: Model) => void;
}> = ({ selectedModels, onRemoveModel }) => {
  if (selectedModels.length === 0) {
    return null;
  }

  return (
    <Container>
      <HorizontalScrollContainer dependencies={[selectedModels]} expandable>
        {selectedModels.map((model) => (
          <CustomTag
            icon={<i className="iconfont icon-at" />}
            color="#1677ff"
            key={model.id}
            closable
            onClose={() => onRemoveModel(model)}>
            {model.name} {model.providerName && `(${model.providerName})`}
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

export default MentionModelsInput;
