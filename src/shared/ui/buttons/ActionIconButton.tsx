'use client';

import React from 'react';
import { Button, ButtonProps } from 'antd';
import styled from 'styled-components';

interface ActionIconButtonProps extends ButtonProps {
  children: React.ReactNode;
  active?: boolean;
}

/**
 * A simple action button rendered as an icon
 */
const ActionIconButton: React.FC<ActionIconButtonProps> = ({
  children,
  active = false,
  className,
  ...props
}) => {
  return (
    <StyledButton
      type="text"
      shape="circle"
      className={`${active ? 'active' : ''} ${className || ''}`}
      {...props}>
      {children}
    </StyledButton>
  );
};

const StyledButton = styled(Button)`
  display: flex;
  height: 30px;
  width: 30px;
  cursor: pointer;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  font-size: 16px;
  transition: all 0.3s ease-in-out;
  color: var(--color-icon);

  .anticon,
  .iconfont,
  .lucide,
  svg {
    color: var(--color-icon);
  }

  &.active {
    .anticon,
    .iconfont,
    .lucide,
    svg {
      color: var(--color-primary) !important;
    }
  }

  &:hover {
    background-color: var(--color-background-soft);

    .anticon,
    .iconfont,
    .lucide,
    svg {
      color: var(--color-text);
    }
  }
`;

export { ActionIconButton };
