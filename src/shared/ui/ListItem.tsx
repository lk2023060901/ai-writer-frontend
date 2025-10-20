'use client';

import React from 'react';
import styled from 'styled-components';

interface ListItemProps {
  active?: boolean;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  onClick?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({ active = false, icon, title, description, extra, onClick }) => {
  return (
    <ItemContainer $active={active} onClick={onClick}>
      <ItemBody>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <ItemContent>
          <Title>{title}</Title>
          {description && <Description>{description}</Description>}
        </ItemContent>
      </ItemBody>
      {extra && <Extra>{extra}</Extra>}
    </ItemContainer>
  );
};

const ItemContainer = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--list-item-border-radius, 10px);
  border: 0.5px solid ${({ $active }) => ($active ? 'var(--color-primary-border, var(--color-border))' : 'transparent')};
  background: ${({ $active }) => ($active ? 'var(--color-background-soft)' : 'transparent')};
  color: var(--color-text);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: var(--color-background-soft);
  }
`;

const ItemBody = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--color-text-2);
`;

const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const Title = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Description = styled.span`
  font-size: 12px;
  color: var(--color-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Extra = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-2);
`;

export default ListItem;
