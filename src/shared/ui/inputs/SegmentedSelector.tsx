'use client';

import { Segmented } from 'antd';
import { FC } from 'react';

interface SelectorProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  size?: number;
}

const Selector: FC<SelectorProps> = ({ value, options, onChange }) => {
  return <Segmented value={value} options={options} onChange={(val) => onChange(val as string)} />;
};

export default Selector;
