'use client';

import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { Assistant, Topic } from '@/features/chat/hooks/useMockData';
import AssistantsTab from './AssistantsTab';
import TopicsTab from './TopicsTab';
import SettingsTab from './SettingsTab';

interface Props {
  assistants: Assistant[];
  activeAssistant: Assistant;
  activeTopic: Topic;
  setActiveAssistant: (assistant: Assistant) => void;
  setActiveTopic: (topic: Topic) => void;
  onAddTopic: () => void;
  onRemoveTopic: (topicId: string) => void;
  position: 'left' | 'right';
}

type Tab = 'assistants' | 'topic' | 'settings';

const Sidebar: FC<Props> = ({
  assistants,
  activeAssistant,
  activeTopic,
  setActiveAssistant,
  setActiveTopic,
  onAddTopic,
  onRemoveTopic,
  position,
}) => {
  const [tab, setTab] = useState<Tab>('assistants');
  const borderStyle = '0.5px solid var(--color-border)';
  const border = position === 'left'
    ? { borderRight: borderStyle }
    : { borderLeft: borderStyle, borderTopLeftRadius: 0 };

  const showTab = position === 'left';

  return (
    <Container style={border} className={position === 'right' ? 'right' : ''}>
      {showTab && (
        <CustomTabs>
          <TabItem active={tab === 'assistants'} onClick={() => setTab('assistants')}>
            Assistants
          </TabItem>
          <TabItem active={tab === 'topic'} onClick={() => setTab('topic')}>
            Topics
          </TabItem>
          <TabItem active={tab === 'settings'} onClick={() => setTab('settings')}>
            Settings
          </TabItem>
        </CustomTabs>
      )}

      <TabContent className="home-tabs-content">
        {tab === 'assistants' && (
          <AssistantsTab
            assistants={assistants}
            activeAssistant={activeAssistant}
            setActiveAssistant={setActiveAssistant}
          />
        )}
        {tab === 'topic' && (
          <TopicsTab
            assistant={activeAssistant}
            activeTopic={activeTopic}
            setActiveTopic={setActiveTopic}
            onAddTopic={onAddTopic}
            onRemoveTopic={onRemoveTopic}
          />
        )}
        {tab === 'settings' && <SettingsTab assistant={activeAssistant} />}
      </TabContent>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: var(--assistants-width);
  transition: width 0.3s;
  height: calc(100vh - var(--navbar-height));
  background-color: var(--color-background);
  overflow: hidden;

  &.right {
    height: calc(100vh - var(--navbar-height));
  }
`;

const TabContent = styled.div`
  display: flex;
  transition: width 0.3s;
  flex: 1;
  flex-direction: column;
  overflow-y: hidden;
  overflow-x: hidden;
`;

const CustomTabs = styled.div`
  display: flex;
  margin: 0 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
`;

const TabItem = styled.button<{ active: boolean }>`
  flex: 1;
  height: 30px;
  border: none;
  background: transparent;
  color: ${(props) => (props.active ? 'var(--color-text)' : 'var(--color-text-secondary)')};
  font-size: 13px;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  cursor: pointer;
  border-radius: 8px;
  margin: 0 2px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-text);
  }

  &:active {
    transform: scale(0.98);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: ${(props) => (props.active ? '30px' : '0')};
    height: 3px;
    background: var(--color-primary);
    border-radius: 1px;
    transition: all 0.2s ease;
  }

  &:hover::after {
    width: ${(props) => (props.active ? '30px' : '16px')};
    background: ${(props) => (props.active ? 'var(--color-primary)' : 'var(--color-primary-soft)')};
  }
`;

export default Sidebar;
