/**
 * 话题列表组件
 * 从SidePanel.tsx中抽离的话题管理功能
 */

import React from 'react';
import styled from 'styled-components';
import { Dropdown, type MenuProps } from 'antd';
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import type { TopicListProps, TopicItemProps } from './types';
import { formatTimeAgo, formatMessageCount } from './constants';

// 样式组件
const TopicListContainer = styled.div`
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const NewTopicButton = styled.button`
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
  margin-bottom: 16px;

  &:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: var(--bg-tertiary);
  }

  .anticon {
    font-size: 16px;
  }
`;

const TopicItem = styled.div<{ $isSelected: boolean }>`
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: ${props => props.$isSelected ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.$isSelected ? 'white' : 'var(--text-primary)'};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border: 1px solid transparent;

  &:hover {
    background: ${props => props.$isSelected ? 'var(--accent-color)' : 'var(--bg-tertiary)'};
    border-color: ${props => props.$isSelected ? 'transparent' : 'var(--border-color)'};
  }

  .topic-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 8px;

    .topic-title {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.3;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-word;
    }

    .topic-actions {
      display: flex;
      align-items: center;
      margin-left: 8px;
      opacity: 0;
      transition: opacity 0.2s;

      .action-button {
        padding: 4px;
        border-radius: 4px;
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        margin-left: 4px;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }

  &:hover .topic-actions {
    opacity: 1;
  }

  .topic-preview {
    font-size: 12px;
    opacity: 0.8;
    line-height: 1.3;
    margin-bottom: 8px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }

  .topic-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    opacity: 0.7;

    .topic-stats {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .topic-time {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .edit-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--accent-color);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 14px;
    color: var(--text-primary);
    outline: none;

    &:focus {
      box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
    }
  }
`;

// TopicItem子组件
const TopicItemComponent: React.FC<TopicItemProps> = ({
  topic,
  isSelected,
  isEditing,
  editingTitle,
  onClick,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onTitleChange,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: '重命名',
      icon: <EditOutlined />,
      onClick: () => onStartEdit(),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(),
    },
  ];

  return (
    <TopicItem $isSelected={isSelected}>
      <div className="topic-header">
        {isEditing ? (
          <input
            className="edit-input"
            value={editingTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={onSaveEdit}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <div className="topic-title" onClick={onClick}>
              {topic.title}
            </div>
            <div className="topic-actions">
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <button
                  className="action-button"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreOutlined />
                </button>
              </Dropdown>
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <>
          <div className="topic-preview" onClick={onClick}>
            {topic.lastMessage}
          </div>
          <div className="topic-meta" onClick={onClick}>
            <div className="topic-stats">
              <span>{formatMessageCount(topic.messageCount)} 条消息</span>
            </div>
            <div className="topic-time">
              <span>{formatTimeAgo(topic.lastActiveTime)}</span>
              <RightOutlined style={{ fontSize: '10px' }} />
            </div>
          </div>
        </>
      )}
    </TopicItem>
  );
};

// 主组件
const TopicList: React.FC<TopicListProps> = ({
  topics,
  selectedTopicId,
  onSelectTopic,
  onCreateTopic,
  onEditTopic,
  onDeleteTopic,
  editingTopicId,
  editingTitle,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}) => {
  return (
    <TopicListContainer>
      <NewTopicButton onClick={onCreateTopic}>
        <PlusOutlined />
        新建话题
      </NewTopicButton>

      {topics.map((topic) => (
        <TopicItemComponent
          key={topic.id}
          topic={topic}
          isSelected={topic.id === selectedTopicId}
          isEditing={editingTopicId === topic.id}
          editingTitle={editingTitle}
          onClick={() => onSelectTopic(topic.id)}
          onStartEdit={() => onStartEdit(topic.id, topic.title)}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          onDelete={() => onDeleteTopic(topic.id)}
          onTitleChange={(title) => onEditTopic(topic.id, title)}
        />
      ))}

      {topics.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--text-tertiary)',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          还没有任何话题<br />
          点击上方按钮创建第一个话题
        </div>
      )}
    </TopicListContainer>
  );
};

export default TopicList;