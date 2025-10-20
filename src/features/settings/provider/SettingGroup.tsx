'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import styled from 'styled-components';

interface CollapsibleSettingGroupProps {
  title: string;
  defaultExpanded?: boolean;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}

export const CollapsibleSettingGroup: React.FC<CollapsibleSettingGroupProps> = ({
  title,
  defaultExpanded = true,
  extra,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Wrapper>
      <Header>
        <HeaderButton onClick={() => setIsExpanded((value) => !value)}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Title>{title}</Title>
        </HeaderButton>
        {extra}
      </Header>
      {isExpanded && <Content>{children}</Content>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  padding: 0 6px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 12px;
  user-select: none;
  border-bottom: 0.5px solid var(--color-border);
`;

const HeaderButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-text);
  font-size: 14px;
`;

const Title = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const Content = styled.div`
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
