/**
 * 创建助手模态框组件
 * 从 AssistantManager.tsx 中抽离的创建助手表单
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Input, Modal, Select, Tooltip } from 'antd';
import {
  CloseOutlined,
  DownOutlined,
  RedoOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import type { AssistantCreateModalProps, AssistantForm } from './types';

// 样式组件
const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }

  .ant-modal-header {
    background: transparent;
    border-bottom: 1px solid var(--border-color);
    padding: 16px 24px;
  }

  .ant-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .ant-modal-body {
    padding: 24px;
  }

  .ant-modal-close {
    color: var(--text-secondary);
  }

  .dark & {
    .ant-modal-content {
      background: #2d2d2d;
    }
  }
`;

const FormItem = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 60px;
  text-align: right;

  &::after {
    content: '*';
    color: #ff4d4f;
    margin-left: 4px;
  }
`;

const FormLabelOptional = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 60px;
  text-align: right;
`;

const EmojiButton = styled(Button)`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  min-width: 80px;

  &:hover {
    border-color: var(--accent-color) !important;
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
  }
`;

const StyledInput = styled(Input)`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;

  &:focus, &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const PromptContainer = styled.div`
  position: relative;
  flex: 1;
`;

const StyledTextArea = styled(Input.TextArea)`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  min-height: 180px;
  padding-right: 80px;
  padding-bottom: 32px;

  &:focus, &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: var(--text-secondary);
  }

  .ant-input-data-count {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-size: 12px;
    color: var(--text-secondary);
  }
`;

const PromptActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  z-index: 10;
  align-items: center;
`;

const PromptBottomActions = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`;

const TokenCount = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const ActionIcon = styled(Button)`
  background: rgba(0, 0, 0, 0.04);
  border: none;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 0, 0, 0.08) !important;
    color: var(--text-primary) !important;
  }
`;

const UndoIcon = styled(ActionIcon)`
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
`;

const OptimizeIcon = styled(ActionIcon)`
  background: rgba(255, 69, 0, 0.2);
  border: 1px solid rgba(255, 69, 0, 0.4);
`;

const StyledSelect = styled(Select)`
  .ant-select-selector {
    background: var(--bg-secondary) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px;
  }

  .ant-select-selection-placeholder {
    color: var(--text-secondary);
  }

  .ant-select-selection-item {
    color: var(--text-primary);
  }

  .ant-select-arrow {
    color: var(--text-secondary);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled(Button)`
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 8px;

  &:hover {
    background: var(--bg-secondary) !important;
    border-color: var(--accent-color) !important;
    color: var(--text-primary) !important;
  }
`;

const SubmitButton = styled(Button)`
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
  border-radius: 8px;
  font-weight: 500;

  &:hover {
    background: var(--accent-color) !important;
    border-color: var(--accent-color) !important;
    opacity: 0.9;
  }

  &:disabled {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-secondary) !important;
    opacity: 0.6;
  }
`;

const AssistantCreateModal: React.FC<AssistantCreateModalProps> = ({
  visible,
  onClose,
  onSubmit,
  knowledgeBaseOptions
}) => {
  const [assistantForm, setAssistantForm] = useState<AssistantForm>({
    emoji: '',
    name: '',
    prompt: '',
    knowledgeBase: []
  });
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const handleFormChange = (key: keyof AssistantForm, value: string | string[]) => {
    if (key === 'prompt' && typeof value === 'string') {
      // 保存提示词历史
      if (assistantForm.prompt !== value && assistantForm.prompt.trim() !== '') {
        setPromptHistory(prev => [assistantForm.prompt, ...prev.slice(0, 9)]);
      }
    }

    setAssistantForm(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleUndoPrompt = () => {
    if (promptHistory.length > 0) {
      const [lastPrompt, ...restHistory] = promptHistory;
      setAssistantForm(prev => ({ ...prev, prompt: lastPrompt }));
      setPromptHistory(restHistory);
    }
  };

  const handleOptimizePrompt = () => {
    console.log('优化提示词:', assistantForm.prompt);
  };

  const handleSubmit = () => {
    onSubmit(assistantForm);
    handleClose();
  };

  const handleClose = () => {
    setAssistantForm({
      emoji: '',
      name: '',
      prompt: '',
      knowledgeBase: []
    });
    setPromptHistory([]);
    onClose();
  };

  const isFormValid = assistantForm.name.trim() !== '' && assistantForm.prompt.trim() !== '';

  return (
    <StyledModal
      title="创建智能体"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={680}
      centered
      destroyOnClose
      closeIcon={<CloseOutlined style={{ color: 'var(--text-secondary)' }} />}
    >
      <FormItem>
        <FormRow>
          <FormLabelOptional>Emoji</FormLabelOptional>
          <EmojiButton
            onClick={() => {
              console.log('选择emoji');
            }}
          >
            {assistantForm.emoji || '选择'}
          </EmojiButton>
        </FormRow>
      </FormItem>

      <FormItem>
        <FormRow>
          <FormLabel>名称</FormLabel>
          <StyledInput
            placeholder="输入名称"
            value={assistantForm.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            style={{ flex: 1 }}
          />
        </FormRow>
      </FormItem>

      <FormItem>
        <FormRow>
          <FormLabel>提示词</FormLabel>
          <PromptContainer>
            <StyledTextArea
              placeholder="输入提示词"
              value={assistantForm.prompt}
              onChange={(e) => handleFormChange('prompt', e.target.value)}
              showCount
              maxLength={2000}
            />
            <PromptActions>
              {promptHistory.length > 0 && (
                <Tooltip title="撤销上一次修改">
                  <UndoIcon
                    icon={<RedoOutlined />}
                    onClick={handleUndoPrompt}
                  />
                </Tooltip>
              )}
              <Tooltip title="优化提示词">
                <OptimizeIcon
                  icon={<ThunderboltOutlined />}
                  onClick={handleOptimizePrompt}
                />
              </Tooltip>
            </PromptActions>
            <PromptBottomActions>
              <TokenCount>Tokens: {assistantForm.prompt.length}</TokenCount>
              <div></div>
            </PromptBottomActions>
          </PromptContainer>
        </FormRow>
      </FormItem>

      <FormItem>
        <FormRow>
          <FormLabelOptional>知识库</FormLabelOptional>
          <StyledSelect
            mode="multiple"
            placeholder="选择知识库"
            options={knowledgeBaseOptions}
            value={assistantForm.knowledgeBase}
            onChange={(value: string[]) => handleFormChange('knowledgeBase', value)}
            suffixIcon={<DownOutlined style={{ color: 'var(--text-secondary)' }} />}
            style={{ flex: 1 }}
            dropdownStyle={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}
          />
        </FormRow>
      </FormItem>

      <ModalFooter>
        <CancelButton onClick={handleClose}>
          取消
        </CancelButton>
        <SubmitButton
          type="primary"
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          创建智能体
        </SubmitButton>
      </ModalFooter>
    </StyledModal>
  );
};

export default AssistantCreateModal;