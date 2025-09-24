import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { SearchContainer, SearchInput } from '../styles';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange
}) => {
  return (
    <SearchContainer>
      <SearchInput
        placeholder="搜索智能体..."
        prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        allowClear
      />
    </SearchContainer>
  );
};