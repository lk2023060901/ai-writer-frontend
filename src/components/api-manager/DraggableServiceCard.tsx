/**
 * 可拖拽的 API 服务商卡片组件
 * 支持拖拽排序功能
 */

import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Switch } from 'antd';
import styled from 'styled-components';

// 使用 CSS 变量替代硬编码主题

const ServiceCard = styled.div<{
  $isActive?: boolean;
  $isDragging?: boolean;
  $isOver?: boolean;
}>`
  background: var(--bg-secondary);
  border: 1px solid ${props =>
    props.$isOver ? '#3b82f6' :
    props.$isActive ? 'var(--color-primary)' : 'var(--border-color)'
  };
  border-radius: 12px;
  padding: 20px;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  opacity: ${props => props.$isDragging ? 0.8 : 1};
  transform: ${props => props.$isDragging ? 'scale(1.02) rotate(2deg)' : 'none'};
  position: relative;
  z-index: ${props => props.$isDragging ? 1000 : 1};

  &:hover {
    border-color: var(--color-primary);
    transform: ${props => props.$isDragging ? 'scale(1.02) rotate(2deg)' : 'translateY(-1px)'};
    box-shadow: ${props => props.$isDragging
      ? '0 8px 32px rgba(0, 0, 0, 0.15)'
      : 'var(--ds-shadow-lg)'
    };
  }

  ${props => props.$isDragging && `
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  `}

  .service-info {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;

    .service-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .service-details {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .service-name {
        color: var(--text-primary);
        font-size: 16px;
        font-weight: 500;
      }

      .service-status {
        color: var(--text-muted);
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 6px;

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${props => props.$isActive ? '#10b981' : '#ef4444'};
        }
      }
    }
  }

  .service-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .model-count {
      color: var(--text-muted);
      font-size: 12px;
      background: var(--bg-tertiary);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .ant-switch {
      background: var(--bg-tertiary);

      &.ant-switch-checked {
        background: #10b981;
      }
    }
  }
`;

interface ApiService {
  id: string;
  name: string;
  logo: string;
  enabled: boolean;
  models: any[];
}

interface DraggableServiceCardProps {
  service: ApiService;
  index: number;
  isSelected: boolean;
  onSelect: (service: ApiService) => void;
  onToggle: (serviceId: string, enabled: boolean) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

const ItemType = 'SERVICE_CARD';

const DraggableServiceCard: React.FC<DraggableServiceCardProps> = ({
  service,
  index,
  isSelected,
  onSelect,
  onToggle,
  onMove,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemType,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover: (item: any, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // 如果拖拽的是自己，不做任何操作
      if (dragIndex === hoverIndex) {
        return;
      }

      // 确定矩形边界
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // 获取中点垂直位置
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // 确定鼠标位置
      const clientOffset = monitor.getClientOffset();

      // 获取鼠标相对于悬停目标顶部的像素
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

      // 只有在鼠标越过一半时才执行移动
      // 向下拖拽时，只有当鼠标低于50%时才移动
      // 向上拖拽时，只有当鼠标高于50%时才移动

      // 向下拖拽
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // 向上拖拽
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // 执行移动
      onMove(dragIndex, hoverIndex);

      // 注意：我们在这里改变监视器项目的索引
      // 一般来说最好避免变化，但在这里是必要的
      // 为了防止闪烁
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: () => {
      return { id: service.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 连接拖拽和放置 - 整个卡片作为拖拽区域
  drag(drop(ref));

  return (
    <ServiceCard
      ref={ref}
      $isActive={isSelected}
      $isDragging={isDragging}
      onClick={() => onSelect(service)}
      data-handler-id={handlerId}
      title="拖拽排序"
    >

      <div className="service-info">
        <div className="service-avatar">
          {service.logo}
        </div>
        <div className="service-details">
          <div className="service-name">
            {service.name}
          </div>
          <div className="service-status">
            <div className="status-dot" />
            {service.enabled ? '已启用' : '已禁用'}
          </div>
        </div>
      </div>

      <div className="service-actions">
        <div className="model-count">
          {service.models.length} 个模型
        </div>
        <Switch
          checked={service.enabled}
          onChange={(checked) => onToggle(service.id, checked)}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          size="default"
        />
      </div>
    </ServiceCard>
  );
};

export default DraggableServiceCard;