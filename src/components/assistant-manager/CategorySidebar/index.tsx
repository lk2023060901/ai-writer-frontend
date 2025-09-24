import React from 'react';
import { CategoryItem } from './CategoryItem';
import { Category } from '../types';
import { Sidebar, CategoryList } from '../styles';

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryKey: string) => void;
  darkMode: boolean;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  darkMode
}) => {
  return (
    <Sidebar data-theme={darkMode ? 'dark' : 'light'}>
      <CategoryList>
        {categories.map(category => (
          <CategoryItem
            key={category.key}
            category={category}
            isActive={activeCategory === category.key}
            onClick={() => onCategoryChange(category.key)}
          />
        ))}
      </CategoryList>
    </Sidebar>
  );
};