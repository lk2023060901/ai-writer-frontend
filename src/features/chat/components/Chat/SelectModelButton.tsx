'use client';

import React, { FC } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { ChevronsUpDown, Sparkles } from 'lucide-react';

interface Props {
  modelName?: string;
  providerName?: string;
  onSelect?: () => void;
}

const SelectModelButton: FC<Props> = ({
  modelName = 'GPT-4',
  providerName = 'OpenAI',
  onSelect
}) => {
  return (
    <DropdownButton size="small" type="text" onClick={onSelect}>
      <ButtonContent>
        <ModelAvatar>
          <Sparkles size={16} />
        </ModelAvatar>
        <ModelName>
          {modelName} {providerName ? ' | ' + providerName : ''}
        </ModelName>
      </ButtonContent>
      <ChevronsUpDown size={14} color="var(--color-icon)" />
    </DropdownButton>
  );
};

const DropdownButton = styled(Button)`
  font-size: 11px;
  border-radius: 15px;
  padding: 13px 5px;
  -webkit-app-region: none;
  box-shadow: none;
  background-color: transparent;
  border: 1px solid transparent;
  margin-top: 1px;
  color: var(--color-text);

  &:hover {
    background-color: var(--color-background-mute);
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ModelAvatar = styled.div`
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 4px;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ModelName = styled.span`
  font-weight: 500;
  margin-right: -2px;
  color: var(--color-text);
`;

export default SelectModelButton;
