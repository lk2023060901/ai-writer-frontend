'use client';

import React, { FC } from 'react';
import { InputNumber } from 'antd';
import type { InputNumberProps } from 'antd';
import styled from 'styled-components';

interface Props {
  value: number;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'small' | 'middle' | 'large';
  style?: React.CSSProperties;
}

const NumberInput = (props: InputNumberProps<number>) => <InputNumber<number> {...props} />;

const EditableNumber: FC<Props> = ({ value, onChange, min, max, step, size = 'small', style }) => (
  <StyledInputNumber
    value={value}
    onChange={(next) => onChange(typeof next === 'number' ? next : null)}
    min={min}
    max={max}
    step={step}
    size={size}
    style={style}
  />
);

const StyledInputNumber = styled(NumberInput)`
  .ant-input-number-input {
    color: var(--color-text) !important;
  }

  &.ant-input-number {
    border-color: var(--color-border) !important;
    background: transparent !important;
  }

  &:hover {
    border-color: var(--color-primary) !important;
  }

  &.ant-input-number-focused {
    border-color: var(--color-primary) !important;
    box-shadow: none !important;
  }
`;

export default EditableNumber;
