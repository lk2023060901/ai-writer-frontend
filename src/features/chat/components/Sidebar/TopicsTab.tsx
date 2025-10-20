'use client';

import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { Assistant, Topic } from '@/features/chat/hooks/useMockData';

interface Props {
  assistant: Assistant;
  activeTopic: Topic;
  setActiveTopic: (topic: Topic) => void;
  onAddTopic: () => void;
  onRemoveTopic: (topicId: string) => void;
}

const TopicsTab: FC<Props> = ({ assistant, activeTopic, setActiveTopic, onAddTopic, onRemoveTopic }) => {
  const { t } = useTranslation();
  const topics = assistant.topics || [];
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  const handleDeleteClick = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingTopicId(topicId);
    setTimeout(() => setDeletingTopicId(null), 2000);
  };

  const handleConfirmDelete = (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveTopic(topic.id);
    setDeletingTopicId(null);
  };

  return (
    <Container>
      <AddButton onClick={onAddTopic}>{t('assistants.settings.topics.add', 'Add topic')}</AddButton>
      {topics.map((topic) => {
        const isActive = topic.id === activeTopic.id;
        return (
          <TopicListItem
            key={topic.id}
            isActive={isActive}
            onClick={() => setActiveTopic(topic)}
          >
            <TopicNameContainer>
              <TopicName title={topic.name}>{topic.name}</TopicName>
              <Tooltip
                placement="bottom"
                mouseEnterDelay={0.7}
                title={t(
                  'assistants.settings.topics.removeHint',
                  'Hold Ctrl/⌘ and click to remove this topic immediately.'
                )}
              >
                <MenuButton
                  className="menu"
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      handleConfirmDelete(topic, e);
                    } else if (deletingTopicId === topic.id) {
                      handleConfirmDelete(topic, e);
                    } else {
                      handleDeleteClick(topic.id, e);
                    }
                  }}
                >
                  <X size={14} color={deletingTopicId === topic.id ? 'var(--color-error)' : 'var(--color-text-3)'} />
                </MenuButton>
              </Tooltip>
            </TopicNameContainer>
          </TopicListItem>
        );
      })}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 11px 0 10px 10px;
  overflow-y: auto;
  overflow-x: hidden;
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
  margin-bottom: 8px;

  &:hover {
    background: var(--color-list-item);
  }

  &::before {
    content: '+';
    font-size: 16px;
  }
`;

const TopicListItem = styled.div<{ isActive: boolean }>`
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  width: calc(var(--assistants-width) - 20px);
  margin-bottom: 8px;
  background: ${(props) => (props.isActive ? 'var(--color-list-item)' : 'transparent')};
  box-shadow: ${(props) => (props.isActive ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none')};
  transition: all 0.2s ease;

  .menu {
    opacity: 0;
  }

  &:hover {
    background-color: var(--color-list-item-hover);

    .menu {
      opacity: 1;
    }
  }

  &.active {
    .menu {
      opacity: 1;

      &:hover {
        color: var(--color-text-2);
      }
    }
  }
`;

const TopicNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  height: 20px;
  justify-content: space-between;
`;

const TopicName = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  flex: 1;
  min-width: 0;
`;

const MenuButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
  cursor: pointer;
`;

export default TopicsTab;
