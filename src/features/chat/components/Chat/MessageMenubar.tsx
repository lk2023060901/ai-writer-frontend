'use client';

import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { Copy, Check, RotateCw, Edit, Trash2 } from 'lucide-react';
import { Message } from '@/features/chat/hooks/useMockData';

interface Props {
  message: Message;
  isLastMessage: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MessageMenubar: FC<Props> = ({
  message,
  isLastMessage,
  onCopy,
  onRegenerate,
  onEdit,
  onDelete
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MenusBar className={`menubar ${isLastMessage ? 'show' : ''}`}>
      {message.role === 'user' && (
        <>
          <Tooltip title="重新生成" mouseEnterDelay={0.8}>
            <ActionButton className="message-action-button" onClick={onRegenerate}>
              <RotateCw size={15} />
            </ActionButton>
          </Tooltip>
          <Tooltip title="编辑" mouseEnterDelay={0.8}>
            <ActionButton className="message-action-button" onClick={onEdit}>
              <Edit size={15} />
            </ActionButton>
          </Tooltip>
        </>
      )}

      {message.role === 'assistant' && (
        <Tooltip title="重新生成" mouseEnterDelay={0.8}>
          <ActionButton className="message-action-button" onClick={onRegenerate}>
            <RotateCw size={15} />
          </ActionButton>
        </Tooltip>
      )}

      <Tooltip title={copied ? '已复制' : '复制'} mouseEnterDelay={0.8}>
        <ActionButton className="message-action-button" onClick={handleCopy}>
          {copied ? <Check size={15} color="var(--color-primary)" /> : <Copy size={15} />}
        </ActionButton>
      </Tooltip>

      <Tooltip title="删除" mouseEnterDelay={0.8}>
        <ActionButton className="message-action-button" onClick={onDelete}>
          <Trash2 size={15} />
        </ActionButton>
      </Tooltip>
    </MenusBar>
  );
};

const MenusBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
`;

const ActionButton = styled.div`
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 26px;
  height: 26px;
  transition: all 0.2s ease;
  color: var(--color-icon);

  &:hover {
    background-color: var(--color-background-mute);
    color: var(--color-text);
  }
`;

export default MessageMenubar;
