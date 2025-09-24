/**
 * 助手列表组件
 * 从SidePanel.tsx中抽离的助手管理功能
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Modal } from 'antd';
import { MoreOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { AssistantListProps, AddAssistantModalProps } from './types';
import type { Assistant } from './types';
import { allAvailableAssistants, formatMessageCount } from './constants';

// 样式组件
const AssistantListContainer = styled.div`
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const AssistantItem = styled.div<{ $isSelected: boolean }>`
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: ${props => props.$isSelected ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.$isSelected ? 'white' : 'var(--text-primary)'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  &:hover {
    background: ${props => props.$isSelected ? 'var(--accent-color)' : 'var(--bg-tertiary)'};
  }

  .assistant-info {
    flex: 1;
    min-width: 0;

    .assistant-name {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .assistant-desc {
      font-size: 12px;
      opacity: 0.8;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .assistant-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-left: 8px;

    .message-count {
      font-size: 11px;
      opacity: 0.7;
      margin-bottom: 2px;
    }

    .more-button {
      padding: 4px;
      border-radius: 4px;
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  &:hover .more-button {
    opacity: 1;
  }
`;

const AddAssistantButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  margin-top: auto;

  &:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: var(--bg-tertiary);
  }

  .anticon {
    font-size: 16px;
  }
`;

const ModalSearchArea = styled.div`
  margin-bottom: 16px;

  .ant-input-affix-wrapper {
    border-radius: 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);

    &:focus-within {
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.1);
    }

    .ant-input {
      background: transparent;
      border: none;
      color: var(--text-primary);

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    .ant-input-prefix {
      color: var(--text-tertiary);
      margin-right: 8px;
    }
  }
`;

const AvailableAssistantsList = styled.div`
  display: grid;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;

    &:hover {
      background: var(--text-tertiary);
    }
  }
`;

const AvailableAssistantItem = styled.button`
  width: 100%;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent-color);
    background: var(--bg-tertiary);
  }

  .assistant-name {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--text-primary);
  }

  .assistant-desc {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .assistant-stats {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: var(--text-tertiary);
  }
`;

// 添加助手模态框组件
const AddAssistantModal: React.FC<AddAssistantModalProps> = ({
  visible,
  onClose,
  onAddAssistant,
  availableAssistants,
  searchKeyword,
  onSearchChange,
}) => {
  const filteredAssistants = availableAssistants.filter(assistant =>
    assistant.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    assistant.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <Modal
      title="添加助手"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      styles={{
        body: { padding: '20px' },
        header: { paddingBottom: '16px' },
      }}
    >
      <ModalSearchArea>
        <div className="ant-input-affix-wrapper">
          <span className="ant-input-prefix">
            <SearchOutlined />
          </span>
          <input
            className="ant-input"
            placeholder="搜索助手名称或描述..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </ModalSearchArea>

      <AvailableAssistantsList>
        {filteredAssistants.map((assistant) => (
          <AvailableAssistantItem
            key={assistant.id}
            onClick={() => {
              onAddAssistant(assistant);
              onClose();
            }}
          >
            <div className="assistant-name">{assistant.name}</div>
            <div className="assistant-desc">{assistant.description}</div>
            <div className="assistant-stats">
              <span>消息数: {formatMessageCount(assistant.messageCount)}</span>
            </div>
          </AvailableAssistantItem>
        ))}
      </AvailableAssistantsList>

      {filteredAssistants.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--text-tertiary)',
          fontSize: '14px'
        }}>
          未找到匹配的助手
        </div>
      )}
    </Modal>
  );
};

// 主组件
const AssistantList: React.FC<AssistantListProps> = ({
  assistants,
  selectedAssistantId,
  onSelectAssistant,
  onAddAssistant,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleAddAssistant = (assistant: Assistant) => {
    // 检查是否已经添加过该助手
    const isAlreadyAdded = assistants.some(a => a.id === assistant.id);
    if (!isAlreadyAdded) {
      onAddAssistant();
      // 这里应该调用父组件的添加逻辑
      console.log('添加助手:', assistant);
    }
  };

  const availableAssistants = allAvailableAssistants.filter(
    assistant => !assistants.some(a => a.id === assistant.id)
  );

  return (
    <AssistantListContainer>
      {assistants.map((assistant) => (
        <AssistantItem
          key={assistant.id}
          $isSelected={assistant.id === selectedAssistantId}
        >
          <div
            className="assistant-info"
            onClick={() => onSelectAssistant(assistant.id)}
            style={{ flex: 1, cursor: 'pointer' }}
          >
            <div className="assistant-name">{assistant.name}</div>
            <div className="assistant-desc">{assistant.description}</div>
          </div>
          <div className="assistant-meta">
            <div className="message-count">
              {formatMessageCount(assistant.messageCount)}
            </div>
            <button
              className="more-button"
              onClick={(e) => {
                e.stopPropagation();
                console.log('More options for:', assistant.id);
              }}
            >
              <MoreOutlined />
            </button>
          </div>
        </AssistantItem>
      ))}

      <AddAssistantButton onClick={() => setShowAddModal(true)}>
        <PlusOutlined />
        添加助手
      </AddAssistantButton>

      <AddAssistantModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddAssistant={handleAddAssistant}
        availableAssistants={availableAssistants}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
      />
    </AssistantListContainer>
  );
};

export default AssistantList;