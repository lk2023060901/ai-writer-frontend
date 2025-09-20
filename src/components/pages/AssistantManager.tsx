import {
  BankOutlined,
  BookOutlined,
  BulbOutlined,
  CloseOutlined,
  CodeOutlined,
  CommentOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  FileOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HeartOutlined,
  HomeOutlined,
  MoreOutlined,
  PictureOutlined,
  PlusOutlined,
  ReadOutlined,
  RedoOutlined,
  RobotOutlined,
  SearchOutlined,
  SmileOutlined,
  StarFilled,
  StarOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  TranslationOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Button, Card, Dropdown, Input, Modal, Select, Tag, Tooltip } from 'antd';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/hooks/redux';

const Container = styled.div`
  height: 100vh;
  background: var(--bg-primary);
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  /* 强制暗色模式样式，最高优先级 */
  .dark & {
    background: #2d2d2d !important;
    border-right-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  /* 兼容旧的CSS变量方式 */
  &[data-theme="dark"] {
    background: #2d2d2d !important;
    border-right-color: rgba(255, 255, 255, 0.1) !important;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CategoryList = styled.div`
  flex: 1;
  padding: 16px 16px 0 16px;
  overflow-y: auto;
`;

const CategoryItem = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 4px;
  background: ${props => props.$active ? 'var(--accent-color)' : 'transparent'};
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background: ${props => props.$active ? 'var(--accent-color)' : 'var(--bg-tertiary)'};
  }
`;

const CategoryContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryIcon = styled.span`
  display: flex;
  align-items: center;
  font-size: 16px;
`;

const CategoryCount = styled.span`
  font-size: 12px;
  opacity: 0.8;
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const MainHeader = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  background: var(--bg-primary);
`;

const CategoryTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryTitleIcon = styled.span`
  display: flex;
  align-items: center;
  font-size: 18px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 280px;
`;

const SearchInput = styled(Input)`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  
  &:focus, &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const MainContentInner = styled.div`
  padding: 24px;
`;

const AssistantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const AssistantCard = styled(Card)`
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: var(--accent-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .ant-card-body {
    padding: 16px;
  }
  
  .ant-card-actions {
    background: transparent;
    border-top: 1px solid var(--border-color);
  }
`;

const AssistantHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const AssistantAvatar = styled(Avatar)`
  background: var(--accent-color);
  flex-shrink: 0;
`;

const AssistantInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AssistantName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  line-height: 1.3;
`;

const AssistantMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const OwnerTag = styled(Tag)`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin: 0;
`;

const AssistantDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AssistantTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 12px;
`;

const SkillTag = styled(Tag)`
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  border: none;
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-color);
  margin: 0;
`;

const ActionButton = styled(Button)`
  border: none;
  background: transparent;
  color: var(--text-secondary);
  
  &:hover {
    background: var(--bg-primary) !important;
    color: var(--text-primary) !important;
  }
`;

const CreateButton = styled(Button)`
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
  border-radius: 8px;
  font-weight: 500;
  
  &:hover {
    background: var(--accent-color) !important;
    border-color: var(--accent-color) !important;
    opacity: 0.9;
  }
`;

// 模态框样式
const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  
  .ant-modal-header {
    background: #fff;
    border-bottom: 1px solid var(--border-color);
    padding: 20px 24px;
    border-radius: 12px 12px 0 0;
  }
  
  .ant-modal-title {
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
  }
  
  .ant-modal-body {
    background: #fff;
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .ant-modal-footer {
    background: #fff;
    border-top: 1px solid var(--border-color);
    padding: 16px 24px;
    border-radius: 0 0 12px 12px;
  }
  
  .ant-modal-close {
    top: 16px;
    right: 16px;
  }
`;

const FormItem = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 60px;
  
  &::before {
    content: '*';
    color: #ff4d4f;
    margin-right: 4px;
  }
`;

const FormLabelOptional = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 60px;
`;

const EmojiButton = styled(Button)`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  
  &:hover {
    background: var(--bg-tertiary) !important;
    border-color: var(--accent-color) !important;
    color: var(--text-primary) !important;
  }
`;

const StyledInput = styled(Input)`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  
  &:focus, &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const PromptContainer = styled.div`
  position: relative;
  flex: 1;
`;

const StyledTextArea = styled(Input.TextArea)`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  min-height: 180px;
  padding-right: 80px;
  padding-bottom: 32px;
  
  &:focus, &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
  
  .ant-input-data-count {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-size: 12px;
    color: var(--text-secondary);
  }
`;

const PromptActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  z-index: 10;
  align-items: center;
`;

const PromptBottomActions = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  pointer-events: none;
  
  > * {
    pointer-events: auto;
  }
`;

const TokenCount = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const ActionIcon = styled(Button)`
  background: rgba(0, 0, 0, 0.04);
  border: none;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.08) !important;
    color: var(--text-primary) !important;
  }
`;

const UndoIcon = styled(ActionIcon)`
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
`;

const OptimizeIcon = styled(ActionIcon)`
  background: rgba(255, 69, 0, 0.2);
  border: 1px solid rgba(255, 69, 0, 0.4);
`;

const StyledSelect = styled(Select)`
  .ant-select-selector {
    background: var(--bg-secondary) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px;
  }
  
  .ant-select-selection-placeholder {
    color: var(--text-secondary);
  }
  
  .ant-select-selection-item {
    color: var(--text-primary);
  }
  
  .ant-select-arrow {
    color: var(--text-secondary);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled(Button)`
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 8px;
  
  &:hover {
    background: var(--bg-secondary) !important;
    border-color: var(--accent-color) !important;
    color: var(--text-primary) !important;
  }
`;

const SubmitButton = styled(Button)`
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
  border-radius: 8px;
  font-weight: 500;
  
  &:hover {
    background: var(--accent-color) !important;
    border-color: var(--accent-color) !important;
    opacity: 0.9;
  }
`;

interface Assistant {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  owner: 'my' | 'others';
  category: string;
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;
  usageCount: number;
}

const AssistantManager: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assistantForm, setAssistantForm] = useState({
    emoji: '',
    name: '',
    prompt: '',
    knowledgeBase: [] as string[]
  });
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  
  // 获取当前主题状态
  const { theme, darkMode } = useAppSelector(state => state.ui);
  
  // 强制重新渲染以响应主题变化
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    // 当主题改变时强制重新渲染组件
    forceUpdate({});
  }, [theme, darkMode]);

  // 模拟数据
  const assistants: Assistant[] = [
    {
      id: '1',
      name: '执行编导',
      owner: 'my',
      category: 'my',
      description: '我是一个短视频脚本执行能力指导师，专于用粮制作引导你来进行具体的短视频制作，支持多种形式的创作引导...',
      tags: ['短视频', '编导', '创作'],
      isFavorite: false,
      isPublic: true,
      usageCount: 156
    },
    {
      id: '2',
      name: '短视频编导-美',
      owner: 'my',
      category: 'my',
      description: '我是全能的短视频编导专业制作师指导师，帮色定义你的定位...一个微茶全能短视频编导专业制作师',
      tags: ['短视频', '美拍', '专业'],
      isFavorite: true,
      isPublic: false,
      usageCount: 89
    },
    {
      id: '3',
      name: '问答式编导',
      owner: 'my',
      category: 'my',
      description: '短视频编导问答式问题需求师指导师，帮色定义你的视一个专业的短视频问答式问题需求师指导师',
      tags: ['问答', '引导', '专业'],
      isFavorite: false,
      isPublic: true,
      usageCount: 234
    },
    {
      id: '4',
      name: 'AI写作助手',
      owner: 'others',
      category: 'tools',
      description: '专业的AI写作辅助工具，支持各种文体创作，提供创意灵感和文字润色建议',
      tags: ['写作', '创作', 'AI'],
      isFavorite: false,
      isPublic: true,
      usageCount: 567
    },
    {
      id: '5',
      name: '代码助手',
      owner: 'others',
      category: 'programming',
      description: '智能代码生成和调试助手，支持多种编程语言，提供代码优化建议',
      tags: ['编程', '代码', '调试'],
      isFavorite: true,
      isPublic: true,
      usageCount: 823
    },
    {
      id: '6',
      name: '英语翻译',
      owner: 'others',
      category: 'language',
      description: '专业的中英文翻译助手，支持文档翻译、口语对话翻译等多种场景',
      tags: ['翻译', '英语', '语言'],
      isFavorite: false,
      isPublic: true,
      usageCount: 445
    },
    {
      id: '7',
      name: '商业分析师',
      owner: 'others',
      category: 'business',
      description: '专业的商业数据分析和市场研究助手，提供深度的商业洞察和建议',
      tags: ['商业', '分析', '市场'],
      isFavorite: false,
      isPublic: true,
      usageCount: 392
    }
  ];

  // 搜索功能
  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  // 创建智能体模态框处理
  const handleCreateAssistant = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setAssistantForm({
      emoji: '',
      name: '',
      prompt: '',
      knowledgeBase: []
    });
    setPromptHistory([]);
  };

  const handleFormChange = (field: string, value: string | string[]) => {
    setAssistantForm(prev => ({ ...prev, [field]: value }));

    // 如果是提示词字段且内容有变化，保存历史
    if (field === 'prompt' && typeof value === 'string' && value !== assistantForm.prompt) {
      setPromptHistory(prev => {
        const newHistory = [...prev];
        if (assistantForm.prompt && !newHistory.includes(assistantForm.prompt)) {
          newHistory.push(assistantForm.prompt);
        }
        return newHistory.slice(-10); // 保持10条历史
      });
    }
  };

  const handleUndoPrompt = () => {
    if (promptHistory.length > 0) {
      const lastPrompt = promptHistory[promptHistory.length - 1];
      setAssistantForm(prev => ({ ...prev, prompt: lastPrompt }));
      setPromptHistory(prev => prev.slice(0, -1));
    }
  };

  const handleOptimizePrompt = () => {
    // 这里可以调用AI接口来优化提示词
    console.log('优化提示词:', assistantForm.prompt);
  };

  const handleSubmitAssistant = () => {
    // 这里处理提交逻辑
    console.log('创建智能体:', assistantForm);
    handleCloseModal();
  };

  const categories = [
    { key: 'my', label: '我的', count: 3, icon: <UserOutlined /> },
    { key: 'featured', label: '精选', count: 4, icon: <StarOutlined /> },
    { key: 'business', label: '商业', count: 167, icon: <BankOutlined /> },
    { key: 'tools', label: '工具', count: 281, icon: <ToolOutlined /> },
    { key: 'language', label: '语言', count: 25, icon: <TranslationOutlined /> },
    { key: 'office', label: '办公', count: 44, icon: <FileOutlined /> },
    { key: 'general', label: '通用', count: 37, icon: <GlobalOutlined /> },
    { key: 'programming', label: '编程', count: 61, icon: <CodeOutlined /> },
    { key: 'emotion', label: '情感', count: 57, icon: <HeartOutlined /> },
    { key: 'education', label: '教育', count: 174, icon: <BookOutlined /> },
    { key: 'creativity', label: '创意', count: 166, icon: <BulbOutlined /> },
    { key: 'academic', label: '学术', count: 54, icon: <ReadOutlined /> },
    { key: 'design', label: '设计', count: 31, icon: <PictureOutlined /> },
    { key: 'entertainment', label: '娱乐', count: 75, icon: <SmileOutlined /> },
    { key: 'life', label: '生活', count: 83, icon: <HomeOutlined /> }
  ];

  // 知识库选项
  const knowledgeBaseOptions = [
    { label: '通用知识库', value: 'general' },
    { label: '技术文档', value: 'technical' },
    { label: '产品说明', value: 'product' },
    { label: '企业知识', value: 'enterprise' },
    { label: '学术论文', value: 'academic' },
    { label: '法律条文', value: 'legal' },
    { label: '医学资料', value: 'medical' },
    { label: '运营指南', value: 'operations' }
  ];

  const getMoreMenuItems = (assistant: Assistant): MenuProps['items'] => [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />
    },
    {
      key: 'duplicate',
      label: '复制',
      icon: <UserOutlined />
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true
    }
  ];

  const getAssistantIcon = (assistant: Assistant) => {
    // 根据标签或类别返回不同图标
    if (assistant.tags.includes('短视频')) return <ThunderboltOutlined />;
    if (assistant.tags.includes('编程')) return <FileTextOutlined />;
    if (assistant.tags.includes('创作')) return <BulbOutlined />;
    if (assistant.tags.includes('问答')) return <CommentOutlined />;
    return <RobotOutlined />;
  };

  const filteredAssistants = searchQuery.trim()
    ? assistants.filter(assistant =>
      assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assistant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assistant.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : assistants.filter(assistant => {
      const matchesCategory = activeCategory === 'my' ? assistant.category === 'my' : true;
      return matchesCategory;
    });

  return (
    <Container 
      key={`${theme}-${darkMode}`}
      className={`theme-${theme} ${darkMode ? 'dark' : ''}`}
    >
      <Sidebar data-theme={darkMode ? 'dark' : 'light'}>
        <CategoryList>
          {categories.map(category => (
            <CategoryItem
              key={category.key}
              $active={activeCategory === category.key}
              onClick={() => setActiveCategory(category.key)}
            >
              <CategoryContent>
                <CategoryIcon>{category.icon}</CategoryIcon>
                <span>{category.label}</span>
              </CategoryContent>
              <CategoryCount>({category.count})</CategoryCount>
            </CategoryItem>
          ))}
        </CategoryList>
      </Sidebar>

      <Content>
        <MainHeader>
          <CategoryTitle>
            <CategoryTitleIcon>
              {searchQuery.trim()
                ? <SearchOutlined />
                : (categories.find(cat => cat.key === activeCategory)?.icon || <UserOutlined />)
              }
            </CategoryTitleIcon>
            <span>
              {searchQuery.trim()
                ? `搜索结果 (${filteredAssistants.length})`
                : `${categories.find(cat => cat.key === activeCategory)?.label || '我的'} (${categories.find(cat => cat.key === activeCategory)?.count || 0})`
              }
            </span>
          </CategoryTitle>
          <HeaderActions>
            <SearchContainer>
              <SearchInput
                placeholder="搜索智能体..."
                prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </SearchContainer>
            <Button
              icon={<GlobalOutlined />}
              style={{ color: 'var(--text-secondary)' }}
            >
              从外部导入
            </Button>
            <CreateButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateAssistant}
            >
              创建智能体
            </CreateButton>
          </HeaderActions>
        </MainHeader>

        <MainContent>
          <MainContentInner>
            <AssistantGrid>
              {filteredAssistants.map(assistant => (
                <AssistantCard
                  key={assistant.id}
                  actions={[
                    <ActionButton
                      key="favorite"
                      icon={assistant.isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    />,
                    <ActionButton key="more">
                      <Dropdown
                        menu={{ items: getMoreMenuItems(assistant) }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <MoreOutlined />
                      </Dropdown>
                    </ActionButton>
                  ]}
                >
                  <AssistantHeader>
                    <AssistantAvatar icon={getAssistantIcon(assistant)} />
                    <AssistantInfo>
                      <AssistantName>{assistant.name}</AssistantName>
                      <AssistantMeta>
                        <OwnerTag color={assistant.owner === 'my' ? 'blue' : 'default'}>
                          {assistant.owner === 'my' ? '我的' : '其他'}
                        </OwnerTag>
                        {assistant.isPublic && (
                          <Tag color="green" style={{ fontSize: '12px', margin: 0 }}>公开</Tag>
                        )}
                      </AssistantMeta>
                    </AssistantInfo>
                  </AssistantHeader>

                  <AssistantDescription>
                    {assistant.description}
                  </AssistantDescription>

                  <AssistantTags>
                    {assistant.tags.map(tag => (
                      <SkillTag key={tag}>{tag}</SkillTag>
                    ))}
                  </AssistantTags>
                </AssistantCard>
              ))}
            </AssistantGrid>
          </MainContentInner>
        </MainContent>
      </Content>

      {/* 创建智能体模态框 */}
      <StyledModal
        title="创建智能体"
        open={showCreateModal}
        onCancel={handleCloseModal}
        footer={null}
        width={680}
        centered
        destroyOnClose
        closeIcon={<CloseOutlined style={{ color: 'var(--text-secondary)' }} />}
      >
        <FormItem>
          <FormRow>
            <FormLabelOptional>Emoji</FormLabelOptional>
            <EmojiButton
              onClick={() => {
                // 这里可以弹出emoji选择器
                console.log('选择emoji');
              }}
            >
              {assistantForm.emoji || '选择'}
            </EmojiButton>
          </FormRow>
        </FormItem>

        <FormItem>
          <FormRow>
            <FormLabel>名称</FormLabel>
            <StyledInput
              placeholder="输入名称"
              value={assistantForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              style={{ flex: 1 }}
            />
          </FormRow>
        </FormItem>

        <FormItem>
          <FormRow>
            <FormLabel>提示词</FormLabel>
            <PromptContainer>
              <StyledTextArea
                placeholder="输入提示词"
                value={assistantForm.prompt}
                onChange={(e) => handleFormChange('prompt', e.target.value)}
                showCount
                maxLength={2000}
              />
              <PromptActions>
                {promptHistory.length > 0 && (
                  <Tooltip title="撤销上一次修改">
                    <UndoIcon
                      icon={<RedoOutlined />}
                      onClick={handleUndoPrompt}
                    />
                  </Tooltip>
                )}
                <Tooltip title="优化提示词">
                  <OptimizeIcon
                    icon={<ThunderboltOutlined />}
                    onClick={handleOptimizePrompt}
                  />
                </Tooltip>
              </PromptActions>
              <PromptBottomActions>
                <TokenCount>Tokens: {assistantForm.prompt.length}</TokenCount>
                <div></div>
              </PromptBottomActions>
            </PromptContainer>
          </FormRow>
        </FormItem>

        <FormItem>
          <FormRow>
            <FormLabelOptional>知识库</FormLabelOptional>
            <StyledSelect
              mode="multiple"
              placeholder="选择知识库"
              options={knowledgeBaseOptions}
              value={assistantForm.knowledgeBase}
              onChange={(value: unknown) => handleFormChange('knowledgeBase', value as string[])}
              suffixIcon={<DownOutlined style={{ color: 'var(--text-secondary)' }} />}
              style={{ flex: 1 }}
              dropdownStyle={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
              }}
            />
          </FormRow>
        </FormItem>

        <ModalFooter>
          <CancelButton onClick={handleCloseModal}>
            取消
          </CancelButton>
          <SubmitButton
            type="primary"
            onClick={handleSubmitAssistant}
            disabled={!assistantForm.name || !assistantForm.prompt}
          >
            创建智能体
          </SubmitButton>
        </ModalFooter>
      </StyledModal>
    </Container>
  );
};

export default AssistantManager;