'use client';

import { CloseCircleFilled } from '@ant-design/icons';
import { message, Button, Input, Popover } from 'antd';
import { Edit, HelpCircle, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

import CodeEditor from '@/shared/ui/editor/CodeEditor';
import { RichEditorRef } from '@/shared/ui/editor/types';
import EmojiPicker from '@/shared/ui/emoji/EmojiPicker';
import { Box, HStack, HSpaceBetweenStack } from '@/shared/ui/layout/primitives';
import { usePromptProcessor } from '@/shared/hooks/usePromptProcessor';
import { estimateTextTokens } from '@/shared/api/TokenService';
import { Assistant } from '@/features/chat/hooks/useMockData';

import { SettingDivider } from '.';

interface Props {
  assistant: Assistant;
  updateAssistant: (updates: Partial<Assistant>) => void;
  onOk?: () => void;
}

const AssistantPromptSettings: React.FC<Props> = ({ assistant, updateAssistant }) => {
  const getLeadingEmoji = (text: string) => {
    const emojiRegex = /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/u;
    const match = text.match(emojiRegex);
    return match ? match[0] : null;
  };

  const { t } = useTranslation();
  const [emoji, setEmoji] = useState(getLeadingEmoji(assistant.name) || assistant.emoji);
  const [name, setName] = useState(assistant.name.replace(getLeadingEmoji(assistant.name) || '', '').trim());
  const [prompt, setPrompt] = useState(assistant.systemPrompt || assistant.prompt || '');
  const [showPreview, setShowPreview] = useState((assistant.systemPrompt || assistant.prompt || '').length > 0);
  const [tokenCount, setTokenCount] = useState(0);
  const editorRef = useRef<RichEditorRef>(null);

  useEffect(() => {
    const updateTokenCount = async () => {
      const count = await estimateTextTokens(prompt);
      setTokenCount(count);
    };
    updateTokenCount();
  }, [prompt]);

  const processedPrompt = usePromptProcessor({
    prompt,
    modelName: assistant.model?.name
  });

  const onUpdate = () => {
    updateAssistant({ name: name.trim(), emoji, prompt, systemPrompt: prompt });
    message.success(t('common.saved', 'Saved'));
  };

  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
    updateAssistant({ name: name.trim(), emoji: selectedEmoji, prompt, systemPrompt: prompt });
  };

  const handleEmojiDelete = () => {
    setEmoji('');
    updateAssistant({ name: name.trim(), prompt, systemPrompt: prompt, emoji: '' });
  };

  const promptVarsContent = (
    <pre>{t('assistants.settings.prompt.variables', 'You can use variables such as {{input}}')}</pre>
  );

  return (
    <Container>
      <Box mb={8} style={{ fontWeight: 'bold' }}>
        {t('common.name', 'Name')}
      </Box>
      <HStack gap={8} alignItems="center">
        <Popover content={<EmojiPicker onEmojiClick={handleEmojiSelect} />} arrow trigger="click">
          <EmojiButtonWrapper>
            <Button
              style={{
                fontSize: 18,
                padding: '4px',
                minWidth: '28px',
                height: '28px'
              }}>
              {emoji}
            </Button>
            {emoji && (
              <CloseCircleFilled
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmojiDelete();
                }}
                style={{
                  display: 'none',
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  fontSize: '16px',
                  color: '#ff4d4f',
                  cursor: 'pointer'
                }}
              />
            )}
          </EmojiButtonWrapper>
        </Popover>
        <Input
          placeholder={t('assistants.settings.prompt.namePlaceholder', 'Assistant name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={onUpdate}
          style={{ flex: 1 }}
        />
      </HStack>
      <SettingDivider />
      <HStack mb={8} alignItems="center" gap={4}>
        <Box style={{ fontWeight: 'bold' }}>{t('common.prompt', 'Prompt')}</Box>
        <Popover
          title={t('assistants.settings.prompt.variables.title', 'Prompt variables')}
          content={promptVarsContent}>
          <HelpCircle size={14} color="var(--color-text-2)" />
        </Popover>
      </HStack>
      <TextAreaContainer>
        <RichEditorContainer>
          {showPreview ? (
            <MarkdownContainer
              onDoubleClick={() => {
                const currentScrollTop = editorRef.current?.getScrollTop?.() || 0;
                setShowPreview(false);
                if (typeof window !== 'undefined') {
                  requestAnimationFrame(() => editorRef.current?.setScrollTop?.(currentScrollTop));
                }
              }}>
              <ReactMarkdown>{processedPrompt || prompt}</ReactMarkdown>
            </MarkdownContainer>
          ) : (
            <CodeEditor
              value={prompt}
              language="markdown"
              onChange={setPrompt}
              height="100%"
              expanded={false}
              style={{
                height: '100%'
              }}
            />
          )}
        </RichEditorContainer>
      </TextAreaContainer>
      <HSpaceBetweenStack width="100%" justifyContent="flex-end" mt="10px">
        <TokenCount>
          {t('assistants.settings.prompt.tokens', 'Tokens')}: {tokenCount}
        </TokenCount>
        <Button
          type="primary"
          icon={showPreview ? <Edit size={14} /> : <Save size={14} />}
          onClick={() => {
            const currentScrollTop = editorRef.current?.getScrollTop?.() || 0;
            if (showPreview) {
              setShowPreview(false);
              if (typeof window !== 'undefined') {
                requestAnimationFrame(() => editorRef.current?.setScrollTop?.(currentScrollTop));
              }
            } else {
              onUpdate();
              if (typeof window !== 'undefined') {
                requestAnimationFrame(() => {
                  setShowPreview(true);
                  requestAnimationFrame(() => editorRef.current?.setScrollTop?.(currentScrollTop));
                });
              } else {
                setShowPreview(true);
              }
            }
          }}>
          {showPreview ? t('common.edit', 'Edit') : t('common.save', 'Save')}
        </Button>
      </HSpaceBetweenStack>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const EmojiButtonWrapper = styled.div`
  position: relative;
  display: inline-block;

  &:hover .delete-icon {
    display: block !important;
  }
`;

const TextAreaContainer = styled.div`
  position: relative;
  width: 100%;
`;

const TokenCount = styled.div`
  padding: 2px 2px;
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text-2);
  user-select: none;
`;

const RichEditorContainer = styled.div`
  height: calc(80vh - 202px);
  border: 0.5px solid var(--color-border);
  border-radius: 5px;
  overflow: hidden;

  .prompt-rich-editor {
    border: none;
    height: 100%;

    .rich-editor-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .rich-editor-content {
      flex: 1;
      overflow: auto;
    }
  }
`;

const MarkdownContainer = styled.div.attrs({ className: 'markdown' })`
  height: 100%;
  padding: 0.5em;
  overflow: auto;
`;

export default AssistantPromptSettings;
