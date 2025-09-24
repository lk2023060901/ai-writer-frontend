/**
 * 重构后的助手管理主容器组件
 * 将原1004行的巨型组件拆分为多个小组件的组合
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/hooks/redux';

// 导入子组件
import CategorySidebar from './CategorySidebar';
import AssistantHeader from './AssistantHeader';
import AssistantGrid from './AssistantGrid';
import AssistantCreateModal from './AssistantCreateModal';

// 导入类型和常量
import type { Assistant, AssistantForm, FilterState, FormState } from './types';
import {
  categories,
  knowledgeBaseOptions,
  mockAssistants,
  filterAssistants
} from './constants';

// 样式组件
const Container = styled.div`
  height: 100vh;
  background: var(--bg-primary);
  display: flex;
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const AssistantManagerRefactored: React.FC = () => {
  // 获取当前主题状态
  const { theme, darkMode } = useAppSelector(state => state.ui);

  // 强制重新渲染以响应主题变化
  const [, forceUpdate] = useState({});

  useEffect(() => {
    forceUpdate({});
  }, [theme, darkMode]);

  // 过滤和搜索状态
  const [filterState, setFilterState] = useState<FilterState>({
    activeCategory: 'my',
    searchQuery: ''
  });

  // 表单状态
  const [formState, setFormState] = useState<FormState>({
    assistantForm: {
      emoji: '',
      name: '',
      prompt: '',
      knowledgeBase: []
    },
    promptHistory: [],
    showCreateModal: false
  });

  // 助手数据状态
  const [assistants, setAssistants] = useState<Assistant[]>(mockAssistants);

  // 过滤后的助手列表
  const filteredAssistants = filterAssistants(
    assistants,
    filterState.activeCategory,
    filterState.searchQuery
  );

  // 分类切换处理
  const handleCategoryChange = (categoryKey: string) => {
    setFilterState(prev => ({
      ...prev,
      activeCategory: categoryKey
    }));
  };

  // 搜索处理
  const handleSearch = (query: string) => {
    setFilterState(prev => ({
      ...prev,
      searchQuery: query
    }));
  };

  // 创建助手处理
  const handleCreateAssistant = () => {
    setFormState(prev => ({
      ...prev,
      showCreateModal: true
    }));
  };

  // 导入助手处理
  const handleImportAssistant = () => {
    console.log('从外部导入助手');
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setFormState(prev => ({
      ...prev,
      showCreateModal: false
    }));
  };

  // 提交创建助手
  const handleSubmitAssistant = (formData: AssistantForm) => {
    const newAssistant: Assistant = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.prompt.substring(0, 100) + '...',
      avatar: formData.emoji,
      owner: 'my',
      category: 'my',
      tags: ['自定义'],
      isFavorite: false,
      isPublic: false,
      usageCount: 0
    };

    setAssistants(prev => [newAssistant, ...prev]);
    console.log('创建智能体:', formData);
  };

  // 编辑助手
  const handleEditAssistant = (assistant: Assistant) => {
    console.log('编辑助手:', assistant);
  };

  // 复制助手
  const handleDuplicateAssistant = (assistant: Assistant) => {
    const duplicatedAssistant: Assistant = {
      ...assistant,
      id: Date.now().toString(),
      name: `${assistant.name} 副本`,
      usageCount: 0
    };
    setAssistants(prev => [duplicatedAssistant, ...prev]);
    console.log('复制助手:', assistant);
  };

  // 删除助手
  const handleDeleteAssistant = (assistant: Assistant) => {
    setAssistants(prev => prev.filter(a => a.id !== assistant.id));
    console.log('删除助手:', assistant);
  };

  // 切换收藏状态
  const handleToggleFavorite = (assistantId: string) => {
    setAssistants(prev =>
      prev.map(assistant =>
        assistant.id === assistantId
          ? { ...assistant, isFavorite: !assistant.isFavorite }
          : assistant
      )
    );
  };

  return (
    <Container
      key={`${theme}-${darkMode}`}
      className={`theme-${theme} ${darkMode ? 'dark' : ''}`}
    >
      <CategorySidebar
        categories={categories}
        activeCategory={filterState.activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <Content>
        <AssistantHeader
          searchQuery={filterState.searchQuery}
          onSearch={handleSearch}
          activeCategory={filterState.activeCategory}
          categories={categories}
          filteredCount={filteredAssistants.length}
          onCreateAssistant={handleCreateAssistant}
          onImportAssistant={handleImportAssistant}
        />

        <AssistantGrid
          assistants={filteredAssistants}
          onEditAssistant={handleEditAssistant}
          onDuplicateAssistant={handleDuplicateAssistant}
          onDeleteAssistant={handleDeleteAssistant}
          onToggleFavorite={handleToggleFavorite}
        />
      </Content>

      <AssistantCreateModal
        visible={formState.showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitAssistant}
        knowledgeBaseOptions={knowledgeBaseOptions}
      />
    </Container>
  );
};

export default AssistantManagerRefactored;