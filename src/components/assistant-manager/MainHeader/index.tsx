import React from 'react';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { SearchBar } from './SearchBar';
import { HeaderActions } from './HeaderActions';
import { Category } from '../types';
import {
  MainHeaderContainer,
  CategoryTitle,
  CategoryTitleIcon
} from '../styles';

interface MainHeaderProps {
  activeCategory: string;
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
  onCreateAssistant: () => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  activeCategory,
  categories,
  searchQuery,
  onSearchChange,
  filteredCount,
  onCreateAssistant
}) => {
  const currentCategory = categories.find(cat => cat.key === activeCategory);
  const isSearching = searchQuery.trim();

  return (
    <MainHeaderContainer>
      <CategoryTitle>
        <CategoryTitleIcon>
          {isSearching
            ? <SearchOutlined />
            : (currentCategory?.icon || <UserOutlined />)
          }
        </CategoryTitleIcon>
        <span>
          {isSearching
            ? `搜索结果 (${filteredCount})`
            : `${currentCategory?.label || '我的'} (${currentCategory?.count || 0})`
          }
        </span>
      </CategoryTitle>

      <div style={{ display: 'flex', gap: '8px' }}>
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
        />
        <HeaderActions onCreateAssistant={onCreateAssistant} />
      </div>
    </MainHeaderContainer>
  );
};