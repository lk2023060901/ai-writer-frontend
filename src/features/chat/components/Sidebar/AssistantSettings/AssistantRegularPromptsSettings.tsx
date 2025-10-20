'use client';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Assistant } from '@/features/chat/hooks/useMockData';
import { Button, Input, Modal, Popconfirm, Space } from 'antd';
import { PlusIcon, Trash2, Edit2 } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { nanoid } from 'nanoid';

const { TextArea } = Input;

interface QuickPhrase {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface AssistantRegularPromptsSettingsProps {
  assistant: Assistant;
  updateAssistant: (updates: Partial<Assistant>) => void;
}

const AssistantRegularPromptsSettings: FC<AssistantRegularPromptsSettingsProps> = ({ assistant, updateAssistant }) => {
  const { t } = useTranslation();
  const [promptsList, setPromptsList] = useState<QuickPhrase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<QuickPhrase | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    setPromptsList(assistant.regularPhrases || []);
  }, [assistant.regularPhrases]);

  const handleAdd = () => {
    setEditingPrompt(null);
    setFormData({ title: '', content: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (prompt: QuickPhrase) => {
    setEditingPrompt(prompt);
    setFormData({ title: prompt.title, content: prompt.content });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const updatedPrompts = promptsList.filter((prompt) => prompt.id !== id);
    setPromptsList(updatedPrompts);
    updateAssistant({ regularPhrases: updatedPrompts });
  };

  const handleModalOk = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    let updatedPrompts: QuickPhrase[];
    if (editingPrompt) {
      updatedPrompts = promptsList.map((prompt) =>
        prompt.id === editingPrompt.id ? { ...prompt, ...formData, updatedAt: Date.now() } : prompt
      );
    } else {
      const newPrompt: QuickPhrase = {
        id: nanoid(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...formData
      };
      updatedPrompts = [...promptsList, newPrompt];
    }
    setPromptsList(updatedPrompts);
    updateAssistant({ regularPhrases: updatedPrompts });
    setIsModalOpen(false);
  };

  return (
    <Container>
      <SettingTitle>
        {t('assistants.settings.regular_phrases.title', 'Regular prompts')}
        <Button type="text" icon={<PlusIcon size={18} />} onClick={handleAdd} />
      </SettingTitle>
      <SettingDivider />
      <SettingRow>
        <StyledPromptList>
          {promptsList.length > 0 ? (
            promptsList.map((prompt) => (
              <PromptItemCard key={prompt.id}>
                <PromptHeader>
                  <PromptTitle>{prompt.title}</PromptTitle>
                  <ActionButtons>
                    <Button
                      type="text"
                      size="small"
                      icon={<Edit2 size={14} />}
                      onClick={() => handleEdit(prompt)}
                      style={{ opacity: 0.6 }}
                    />
                    <Popconfirm
                      title={t('assistants.settings.regular_phrases.delete', 'Delete prompt')}
                      description={t(
                        'assistants.settings.regular_phrases.deleteConfirm',
                        'Are you sure you want to delete this prompt?'
                      )}
                      okText={t('common.confirm', 'Confirm')}
                      cancelText={t('common.cancel', 'Cancel')}
                      onConfirm={() => handleDelete(prompt.id)}
                      icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}>
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<Trash2 size={14} />}
                        style={{ opacity: 0.6 }}
                      />
                    </Popconfirm>
                  </ActionButtons>
                </PromptHeader>
                <PromptContent>{prompt.content}</PromptContent>
              </PromptItemCard>
            ))
          ) : (
            <EmptyPrompt>
              {t('assistants.settings.regular_phrases.empty', 'No saved prompts yet. Click “+” to add your first one.')}
            </EmptyPrompt>
          )}
        </StyledPromptList>
      </SettingRow>

      <Modal
        title={
          editingPrompt
            ? t('assistants.settings.regular_phrases.edit', 'Edit prompt')
            : t('assistants.settings.regular_phrases.add', 'Add prompt')
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={520}
        centered>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Label>{t('assistants.settings.regular_phrases.titleLabel', 'Title')}</Label>
            <Input
              placeholder={t('assistants.settings.regular_phrases.titlePlaceholder', 'Enter title')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('assistants.settings.regular_phrases.contentLabel', 'Content')}</Label>
            <TextArea
              placeholder={t('assistants.settings.regular_phrases.contentPlaceholder', 'Enter content')}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              style={{ resize: 'none' }}
            />
          </div>
        </Space>
      </Modal>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const SettingTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
`;

const SettingDivider = styled.div`
  height: 1px;
  background: var(--color-border);
  margin: 10px 0;
`;

const SettingRow = styled.div`
  width: 100%;
`;

const Label = styled.div`
  font-size: 14px;
  color: var(--color-text);
  margin-bottom: 8px;
`;

const StyledPromptList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PromptItemCard = styled.div`
  padding: 12px;
  border-radius: 8px;
  background-color: var(--color-background-mute);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
  }
`;

const PromptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PromptTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const PromptContent = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
  line-height: 1.5;
`;

const EmptyPrompt = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-3);
  font-size: 14px;
`;

export default AssistantRegularPromptsSettings;
