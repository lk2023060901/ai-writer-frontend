import React from 'react';
import { Category } from '../types';
import {
  CategoryItemButton,
  CategoryContent,
  CategoryIcon,
  CategoryCount
} from '../styles';

interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isActive,
  onClick
}) => {
  return (
    <CategoryItemButton $active={isActive} onClick={onClick}>
      <CategoryContent>
        <CategoryIcon>{category.icon}</CategoryIcon>
        <span>{category.label}</span>
      </CategoryContent>
      <CategoryCount>({category.count})</CategoryCount>
    </CategoryItemButton>
  );
};