'use client';

import { InputNumber, type InputNumberProps } from 'antd';
import { FC } from 'react';

type BaseInputNumberProps = Omit<InputNumberProps<number>, 'onChange' | 'value'>;

interface EditableNumberProps extends BaseInputNumberProps {
  value?: number;
  changeOnBlur?: boolean;
  onChange?: (value: number | null) => void;
}

const EditableNumber: FC<EditableNumberProps> = ({
  value,
  changeOnBlur = false,
  onChange,
  onBlur,
  ...props
}) => {
  return (
    <InputNumber<number>
      {...props}
      value={value}
      onChange={
        changeOnBlur
          ? undefined
          : (nextValue) => onChange?.(typeof nextValue === 'number' ? nextValue : null)
      }
      onBlur={(event) => {
        onBlur?.(event);
        if (changeOnBlur) {
          onChange?.(typeof value === 'number' ? value : null);
        }
      }}
    />
  );
};

export default EditableNumber;
