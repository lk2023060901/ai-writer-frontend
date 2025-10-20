'use client';

import React, { FC, useState, useRef, KeyboardEvent, useCallback, useEffect } from 'react';
import styled, { CSSProperties } from 'styled-components';
import { Tooltip } from 'antd';
import TextArea, { TextAreaRef } from 'antd/es/input/TextArea';
import { HolderOutlined } from '@ant-design/icons';
import { CirclePause } from 'lucide-react';
import { ActionIconButton } from '@/shared/ui/buttons/ActionIconButton';
import { nanoid } from 'nanoid';
import InputbarTools from './InputbarTools';
import TokenCount from './TokenCount';
import TranslateButton from './TranslateButton';
import AttachmentPreview, { FileMetadata } from './AttachmentPreview';
import KnowledgeBaseInput, { KnowledgeBase } from './KnowledgeBaseInput';
import MentionModelsInput, { Model } from './MentionModelsInput';

interface Props {
  onSendMessage: (message: string, files?: FileMetadata[]) => void;
  disabled?: boolean;
  loading?: boolean;
  addNewTopic?: () => void;
  clearTopic?: () => void;
  onNewContext?: () => void;
  onPause?: () => void;
}

const Inputbar: FC<Props> = ({
  onSendMessage,
  disabled = false,
  loading = false,
  addNewTopic,
  clearTopic,
  onNewContext,
  onPause
}) => {
  const [text, setText] = useState('');
  const [inputFocus, setInputFocus] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState<number | undefined>();
  const [expanded, setExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [mentionedModels, setMentionedModels] = useState<Model[]>([]);
  const textareaRef = useRef<TextAreaRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startDragY = useRef<number>(0);
  const startHeight = useRef<number>(0);

  const resizeTextArea = useCallback((force: boolean = false) => {
    const textArea = textareaRef.current?.resizableTextArea?.textArea;
    if (textArea) {
      if (textareaHeight && !force) {
        return;
      }
      if (textArea.scrollHeight) {
        textArea.style.height = Math.min(textArea.scrollHeight, 400) + 'px';
      }
    }
  }, [textareaHeight]);

  const sendMessage = useCallback(async () => {
    const hasText = text.trim().length > 0;
    const hasFiles = files.length > 0;

    if ((hasText || hasFiles) && !disabled) {
      onSendMessage(text.trim(), files);
      setText('');
      setFiles([]);
      setTimeout(() => resizeTextArea(true), 0);
      setExpanded(false);
    }
  }, [text, files, disabled, onSendMessage, resizeTextArea]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }

    if (e.key === 'Escape' && expanded) {
      e.stopPropagation();
      onToggleExpanded();
    }

    // Backspace 删除最后一个文件
    if (e.key === 'Backspace' && text.length === 0 && files.length > 0) {
      setFiles((prev) => prev.slice(0, -1));
      e.preventDefault();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const onInput = () => !expanded && resizeTextArea();

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startDragY.current = e.clientY;
    const textArea = textareaRef.current?.resizableTextArea?.textArea;
    if (textArea) {
      startHeight.current = textArea.offsetHeight;
    }
  };

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const delta = startDragY.current - e.clientY;
    const viewportHeight = window.innerHeight;
    const maxHeightInPixels = viewportHeight * 0.7;

    const newHeight = Math.min(maxHeightInPixels, Math.max(startHeight.current + delta, 30));
    const textArea = textareaRef.current?.resizableTextArea?.textArea;
    if (textArea) {
      textArea.style.height = `${newHeight}px`;
      setExpanded(newHeight == maxHeightInPixels);
      setTextareaHeight(newHeight);
    }
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onToggleExpanded = () => {
    const currentlyExpanded = expanded || !!textareaHeight;
    const shouldExpand = !currentlyExpanded;
    setExpanded(shouldExpand);
    const textArea = textareaRef.current?.resizableTextArea?.textArea;
    if (!textArea) return;
    if (shouldExpand) {
      textArea.style.height = '70vh';
      setTextareaHeight(window.innerHeight * 0.7);
    } else {
      textArea.style.height = 'auto';
      setTextareaHeight(undefined);
      requestAnimationFrame(() => {
        if (textArea) {
          const contentHeight = textArea.scrollHeight;
          textArea.style.height = contentHeight > 400 ? '400px' : `${contentHeight}px`;
        }
      });
    }
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  useEffect(() => {
    requestAnimationFrame(() => resizeTextArea());
  }, [resizeTextArea]);

  const handleTranslated = (translatedText: string) => {
    setText(translatedText);
    setTimeout(() => resizeTextArea(true), 0);
  };

  // 拖拽事件处理
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDragging(false);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFileDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);

      if (droppedFiles.length > 0) {
        const newFiles: FileMetadata[] = droppedFiles.map((file) => {
          const ext = '.' + file.name.split('.').pop()?.toLowerCase();
          return {
            id: nanoid(),
            name: file.name,
            size: file.size,
            type: file.type,
            ext,
            url: URL.createObjectURL(file)
          };
        });

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      }
    },
    []
  );

  // 粘贴事件处理
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const fileItems: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            fileItems.push(file);
          }
        }
      }

      if (fileItems.length > 0) {
        e.preventDefault();
        const newFiles: FileMetadata[] = fileItems.map((file) => {
          const ext = '.' + file.name.split('.').pop()?.toLowerCase();
          return {
            id: nanoid(),
            name: file.name,
            size: file.size,
            type: file.type,
            ext,
            url: URL.createObjectURL(file)
          };
        });

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      }
    },
    []
  );

  const inputEmpty = !text.trim() && files.length === 0;

  const handleRemoveKnowledgeBase = (kb: KnowledgeBase) => {
    setSelectedKnowledgeBases((prev) => prev.filter((k) => k.id !== kb.id));
  };

  const handleRemoveModel = (model: Model) => {
    setMentionedModels((prev) => prev.filter((m) => m.id !== model.id));
  };

  return (
    <Container
      className="inputbar"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}>
      <InputBarContainer
        ref={containerRef}
        className={`inputbar-container ${inputFocus ? 'focus' : ''} ${isFileDragging ? 'file-dragging' : ''}`}>
        {files.length > 0 && <AttachmentPreview files={files} setFiles={setFiles} />}
        {selectedKnowledgeBases.length > 0 && (
          <KnowledgeBaseInput
            selectedKnowledgeBases={selectedKnowledgeBases}
            onRemoveKnowledgeBase={handleRemoveKnowledgeBase}
          />
        )}
        {mentionedModels.length > 0 && (
          <MentionModelsInput selectedModels={mentionedModels} onRemoveModel={handleRemoveModel} />
        )}
        <Textarea
          value={text}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="在这里输入消息,按 Enter 发送"
          autoFocus
          variant="borderless"
          rows={2}
          autoSize={textareaHeight ? false : { minRows: 2, maxRows: 20 }}
          ref={textareaRef}
          style={{
            fontSize: 14,
            minHeight: textareaHeight ? `${textareaHeight}px` : '30px'
          }}
          styles={{ textarea: TextareaStyle }}
          onFocus={() => setInputFocus(true)}
          onBlur={() => setInputFocus(false)}
          onInput={onInput}
          disabled={disabled}
          onPaste={handlePaste}
        />
        <DragHandle onMouseDown={handleDragStart}>
          <HolderOutlined />
        </DragHandle>
        <Toolbar>
          <InputbarTools
            isExpanded={expanded || !!textareaHeight}
            onToggleExpanded={onToggleExpanded}
            addNewTopic={addNewTopic}
            clearTopic={clearTopic}
            onNewContext={onNewContext}
          />
          <ToolbarMenu>
            <TokenCount
              estimateTokenCount={1000}
              inputTokenCount={text.length}
              contextCount={{ current: 2, max: 8000 }}
              onClick={onNewContext}
            />
            <TranslateButton text={text} onTranslated={handleTranslated} isLoading={loading} />
            <i
              className="iconfont icon-ic_send"
              onClick={sendMessage}
              style={{
                cursor: inputEmpty || disabled ? 'not-allowed' : 'pointer',
                color: inputEmpty || disabled ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                fontSize: 22,
                transition: 'all 0.2s',
                marginTop: 1,
                marginRight: 2
              }}
            />
            {loading && (
              <Tooltip placement="top" title="暂停" mouseLeaveDelay={0} arrow>
                <ActionIconButton onClick={onPause} style={{ marginRight: -2 }}>
                  <CirclePause size={20} color="var(--color-error)" />
                </ActionIconButton>
              </Tooltip>
            )}
          </ToolbarMenu>
        </Toolbar>
      </InputBarContainer>
    </Container>
  );
};

const DragHandle = styled.div`
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  height: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: row-resize;
  color: var(--color-icon);
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1;

  &:hover {
    opacity: 1;
  }

  .anticon {
    transform: rotate(90deg);
    font-size: 14px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
  padding: 0 18px 18px 18px;
  flex-shrink: 0;
  [navbar-position='top'] & {
    padding: 0 18px 10px 18px;
  }
`;

const InputBarContainer = styled.div`
  border: 0.5px solid var(--color-border);
  transition: all 0.2s ease;
  position: relative;
  border-radius: 17px;
  padding-top: 8px;
  background-color: var(--color-background-opacity);

  &.file-dragging {
    border: 2px dashed #2ecc71;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(46, 204, 113, 0.03);
      border-radius: 14px;
      z-index: 5;
      pointer-events: none;
    }
  }
`;

const TextareaStyle: CSSProperties = {
  paddingLeft: 0,
  padding: '6px 15px 0px'
};

const Textarea = styled(TextArea)`
  padding: 0;
  border-radius: 0;
  display: flex;
  resize: none !important;
  overflow: auto;
  width: 100%;
  box-sizing: border-box;
  transition: none !important;

  &.ant-input {
    line-height: 1.4;
  }

  &::-webkit-scrollbar {
    width: 3px;
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 5px 8px;
  height: 40px;
  gap: 16px;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
`;

const ToolbarMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export default Inputbar;
