'use client';

import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { Modal, Menu } from 'antd';
import { useTranslation } from 'react-i18next';

import { Assistant, AssistantSettings } from '@/features/chat/hooks/useMockData';
import { useChatSettings } from '@/features/chat/context/ChatContext';
import AssistantPromptSettings from './AssistantSettings/AssistantPromptSettings';
import AssistantModelSettings from './AssistantSettings/AssistantModelSettings';
import AssistantKnowledgeBaseSettings from './AssistantSettings/AssistantKnowledgeBaseSettings';
import AssistantMCPSettings from './AssistantSettings/AssistantMCPSettings';
import AssistantRegularPromptsSettings from './AssistantSettings/AssistantRegularPromptsSettings';
import AssistantMemorySettings from './AssistantSettings/AssistantMemorySettings';

interface Props {
  open: boolean;
  assistant: Assistant;
  onCancel: () => void;
  defaultTab?: AssistantSettingTab;
}

type AssistantSettingTab = 'prompt' | 'model' | 'knowledge_base' | 'mcp' | 'regular_phrases' | 'memory';

const AssistantSettingsModal: FC<Props> = ({ open, assistant, onCancel, defaultTab = 'prompt' }) => {
  const [selectedTab, setSelectedTab] = useState<AssistantSettingTab>(defaultTab);
  const { t } = useTranslation();
  const { updateAssistant, updateAssistantSettings, updateCustomParameters } = useChatSettings();
  const assistantId = assistant.id;

  const handleUpdateAssistant = (updates: Partial<Assistant>) => updateAssistant(assistantId, updates);
  const handleUpdateAssistantSettings = (updates: Partial<AssistantSettings>) =>
    updateAssistantSettings(assistantId, updates);

  const menuItems = [
    {
      key: 'prompt',
      label: t('assistants.settings.tabs.prompt', 'Prompt')
    },
    {
      key: 'model',
      label: t('assistants.settings.tabs.model', 'Model')
    },
    {
      key: 'knowledge_base',
      label: t('assistants.settings.tabs.knowledge', 'Knowledge base')
    },
    {
      key: 'mcp',
      label: t('assistants.settings.tabs.mcp', 'MCP')
    },
    {
      key: 'regular_phrases',
      label: t('assistants.settings.tabs.prompts', 'Regular prompts')
    },
    {
      key: 'memory',
      label: t('assistants.settings.tabs.memory', 'Memory')
    }
  ];

  return (
    <StyledModal
      open={open}
      onCancel={onCancel}
      maskClosable={false}
      footer={null}
      title={assistant.name}
      width="min(800px, 70vw)"
      centered
      styles={{
        content: {
          padding: 0,
          overflow: 'hidden'
        },
        header: {
          padding: '10px 15px',
          borderBottom: '0.5px solid var(--color-border)',
          margin: 0,
          borderRadius: 0
        },
        body: {
          padding: 0
        }
      }}>
      <ContentContainer>
        <LeftMenu>
          <StyledMenu
            defaultSelectedKeys={[defaultTab]}
            mode="vertical"
            items={menuItems}
            onSelect={({ key }) => setSelectedTab(key as AssistantSettingTab)}
          />
        </LeftMenu>
        <SettingsContent>
          {selectedTab === 'prompt' && (
            <AssistantPromptSettings assistant={assistant} updateAssistant={handleUpdateAssistant} />
          )}
          {selectedTab === 'model' && (
            <AssistantModelSettings
              assistant={assistant}
              updateAssistant={handleUpdateAssistant}
              updateAssistantSettings={handleUpdateAssistantSettings}
              updateCustomParameters={(updater) => updateCustomParameters(assistantId, updater)}
            />
          )}
          {selectedTab === 'knowledge_base' && (
            <AssistantKnowledgeBaseSettings
              assistant={assistant}
              updateAssistant={handleUpdateAssistant}
            />
          )}
          {selectedTab === 'mcp' && (
            <AssistantMCPSettings assistant={assistant} updateAssistant={handleUpdateAssistant} />
          )}
          {selectedTab === 'regular_phrases' && (
            <AssistantRegularPromptsSettings
              assistant={assistant}
              updateAssistant={handleUpdateAssistant}
            />
          )}
          {selectedTab === 'memory' && (
            <AssistantMemorySettings assistant={assistant} updateAssistant={handleUpdateAssistant} />
          )}
        </SettingsContent>
      </ContentContainer>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  .ant-modal-title {
    font-size: 14px;
  }
  .ant-modal-close {
    top: 4px;
    right: 4px;
  }
  .ant-modal-close-x {
    width: 44px;
    height: 44px;
    line-height: 44px;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  height: 80vh;
  max-height: 80vh;
`;

const LeftMenu = styled.div`
  height: 100%;
  border-right: 0.5px solid var(--color-border);
`;

const StyledMenu = styled(Menu)`
  width: 220px;
  padding: 5px;
  background: transparent;
  margin-top: 2px;
  border: none;

  .ant-menu-item {
    height: 36px;
    color: var(--color-text-2);
    display: flex;
    align-items: center;
    border: 0.5px solid transparent;
    border-radius: 6px;
    margin-bottom: 7px;

    .ant-menu-title-content {
      line-height: 36px;
    }
  }

  .ant-menu-item-active {
    background-color: var(--color-background-soft) !important;
    transition: none;
  }

  .ant-menu-item-selected {
    background-color: var(--color-background-soft);
    border: 0.5px solid var(--color-border);

    .ant-menu-title-content {
      color: var(--color-text-1);
      font-weight: 500;
    }
  }
`;

const SettingsContent = styled.div`
  flex: 1;
  padding: 16px;
  height: 100%;
  overflow-y: auto;
`;

export default AssistantSettingsModal;
