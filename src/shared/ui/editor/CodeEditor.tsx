'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';

interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
  height?: string;
  expanded?: boolean;
  style?: React.CSSProperties;
}

export interface CodeEditorRef {
  getScrollTop?: () => number;
  setScrollTop?: (scrollTop: number) => void;
}

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  ({ value, language = 'markdown', onChange, style }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      getScrollTop: () => textareaRef.current?.scrollTop || 0,
      setScrollTop: (scrollTop: number) => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = scrollTop;
        }
      }
    }));

    return (
      <EditorContainer style={style}>
        <StyledTextArea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={`Enter ${language} code...`}
          spellCheck={false}
        />
      </EditorContainer>
    );
  }
);

CodeEditor.displayName = 'CodeEditor';

const EditorContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--color-text);

  &::placeholder {
    color: var(--color-text-3);
  }
`;

export default CodeEditor;
