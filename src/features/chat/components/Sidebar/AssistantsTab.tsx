'use client';

import React, { FC } from 'react';
import styled from 'styled-components';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Assistant } from '@/features/chat/hooks/useMockData';

interface Props {
  assistants: Assistant[];
  activeAssistant: Assistant;
  setActiveAssistant: (assistant: Assistant) => void;
}

const AssistantsTab: FC<Props> = ({ assistants, activeAssistant, setActiveAssistant }) => {
  const { t } = useTranslation();
  return (
    <Container>
      {assistants.map((assistant) => (
        <AssistantItem
          key={assistant.id}
          isActive={assistant.id === activeAssistant.id}
          onClick={() => setActiveAssistant(assistant)}
        >
          <AssistantNameRow title={assistant.name}>
            <ModelAvatar>
              <Sparkles size={16} />
            </ModelAvatar>
            <AssistantName className="text-nowrap">{assistant.name}</AssistantName>
          </AssistantNameRow>
          {assistant.id === activeAssistant.id && (
            <TopicCountBadge>
              <TopicCount>{assistant.topics.length}</TopicCount>
            </TopicCountBadge>
          )}
        </AssistantItem>
      ))}
      <AddButton>{t('assistants.settings.assistants.add', 'Add assistant')}</AddButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const AssistantItem = styled.div<{ isActive: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 37px;
  width: calc(var(--assistants-width) - 20px);
  cursor: pointer;
  border-radius: 8px;
  border: 0.5px solid transparent;
  padding: 0 8px;
  background: ${(props) => (props.isActive ? 'var(--color-list-item)' : 'transparent')};
  box-shadow: ${(props) => (props.isActive ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none')};
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-list-item-hover);
  }
`;

const AssistantNameRow = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text);
`;

const ModelAvatar = styled.div`
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 6px;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const AssistantName = styled.div`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
`;

const TopicCountBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 9px;
  display: flex;
  height: 22px;
  min-height: 22px;
  min-width: 22px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  border: 0.5px solid var(--color-border);
  background: var(--color-background);
  padding: 0 5px;
`;

const TopicCount = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 10px;
  color: var(--color-text);
`;

const AddButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  height: 36px;
  width: calc(var(--assistants-width) - 20px);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
  margin-bottom: 4px;

  &:hover {
    background: var(--color-list-item);
  }

  &::before {
    content: '+';
    font-size: 16px;
  }
`;

export default AssistantsTab;
