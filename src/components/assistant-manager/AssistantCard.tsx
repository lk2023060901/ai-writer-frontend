/**
 * 助手卡片组件
 * 从 AssistantManager.tsx 中抽离的单个助手卡片
 */

import React from 'react';
import styled from 'styled-components';
import { Avatar, Button, Card, Dropdown, Tag, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { AssistantCardProps } from './types';
import { getAssistantIcon } from './constants';

// 样式组件
const StyledCard = styled(Card)`
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    border-color: var(--accent-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .ant-card-body {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .ant-card-actions {
    background: transparent;
    border-top: 1px solid var(--border-color);
    padding: 8px 16px;
  }

  .ant-card-actions li {
    margin: 0;
  }

  .ant-card-actions li:not(:last-child) {
    border-right: 1px solid var(--border-color);
  }

  .dark & {
    background: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);

    .ant-card-actions {
      border-top-color: rgba(255, 255, 255, 0.1);
    }

    .ant-card-actions li:not(:last-child) {
      border-right-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

const AssistantHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const AssistantAvatar = styled(Avatar)`
  background: var(--accent-color);
  flex-shrink: 0;
`;

const AssistantInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AssistantName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  line-height: 1.3;
`;

const AssistantMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const OwnerTag = styled(Tag)`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin: 0;
`;

const AssistantDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AssistantTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 12px;
`;

const SkillTag = styled(Tag)`
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  border: none;
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-color);
  margin: 0;
`;

const ActionButton = styled(Button)`
  border: none;
  background: transparent;
  color: var(--text-secondary);

  &:hover {
    background: var(--bg-primary) !important;
    color: var(--text-primary) !important;
  }
`;

const FavoriteButton = styled(ActionButton)<{ $isFavorite: boolean }>`
  color: ${props => props.$isFavorite ? '#faad14' : 'var(--text-secondary)'};

  &:hover {
    color: #faad14 !important;
  }
`;

const AssistantCard: React.FC<AssistantCardProps> = ({
  assistant,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite
}) => {
  const getMoreMenuItems = (): MenuProps['items'] => [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: onEdit
    },
    {
      key: 'duplicate',
      label: '复制',
      icon: <UserOutlined />,
      onClick: onDuplicate
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: onDelete
    }
  ];

  return (
    <StyledCard
      actions={[
        <Tooltip key="favorite" title={assistant.isFavorite ? '取消收藏' : '收藏'}>
          <FavoriteButton
            $isFavorite={assistant.isFavorite}
            icon={assistant.isFavorite ? <StarFilled /> : <StarOutlined />}
            onClick={onToggleFavorite}
          />
        </Tooltip>,
        <Tooltip key="more" title="更多操作">
          <Dropdown
            menu={{ items: getMoreMenuItems() }}
            trigger={['click']}
            placement="bottomRight"
          >
            <ActionButton icon={<MoreOutlined />} />
          </Dropdown>
        </Tooltip>
      ]}
    >
      <AssistantHeader>
        <AssistantAvatar size={40} icon={getAssistantIcon(assistant)} />
        <AssistantInfo>
          <AssistantName>{assistant.name}</AssistantName>
          <AssistantMeta>
            <OwnerTag color={assistant.owner === 'my' ? 'blue' : 'green'}>
              {assistant.owner === 'my' ? '我的' : '公开'}
            </OwnerTag>
            <span style={{
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              {assistant.usageCount} 次使用
            </span>
          </AssistantMeta>
        </AssistantInfo>
      </AssistantHeader>

      <AssistantDescription>
        {assistant.description}
      </AssistantDescription>

      <AssistantTags>
        {assistant.tags.map((tag, index) => (
          <SkillTag key={index}>{tag}</SkillTag>
        ))}
      </AssistantTags>
    </StyledCard>
  );
};

export default AssistantCard;