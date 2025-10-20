'use client';

import React, { FC } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';

interface Option {
  value: string | number;
  label: string;
}

interface Props {
  value?: string | number;
  onChange?: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
  style?: React.CSSProperties;
}

const Selector: FC<Props> = ({ value, onChange, options, placeholder, style }) => {
  return (
    <StyledSelect
      value={value}
      onChange={(val) => onChange?.(val as string | number)}
      placeholder={placeholder}
      style={style}
      size="small"
    >
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </StyledSelect>
  );
};

const StyledSelect = styled(Select)`
  min-width: 100px;

  .ant-select-selector {
    border-radius: 6px !important;
    border-color: var(--color-border) !important;
    background: transparent !important;
    color: var(--color-text) !important;
  }

  &:hover .ant-select-selector {
    border-color: var(--color-primary) !important;
  }

  &.ant-select-focused .ant-select-selector {
    border-color: var(--color-primary) !important;
    box-shadow: none !important;
  }
`;

export default Selector;
