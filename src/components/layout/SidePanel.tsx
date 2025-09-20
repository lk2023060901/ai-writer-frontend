import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setCurrentTopic, setSidebarActiveTab } from '@/store/slices/uiSlice';
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined, QuestionCircleOutlined, RightOutlined, RobotOutlined, SearchOutlined } from '@ant-design/icons';
import { Dropdown, Input, Layout, Modal, Select, Slider, Switch, Tabs, Tooltip } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  background: var(--bg-secondary) !important;
  border-right: none;
  height: calc(100vh - 48px); /* 减去顶部导航栏的高度 */
  overflow: hidden;
  
  /* 强制覆盖Ant Design的默认样式 */
  &.ant-layout-sider {
    background: var(--bg-secondary) !important;
  }
  
  /* 暗色模式强制样式 */
  .dark & {
    background: #2d2d2d !important;
    
    &.ant-layout-sider {
      background: #2d2d2d !important;
    }
  }

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    background: inherit;
  }

  .sidebar-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%; /* 使用100%而不是100vh */

    /* 只针对sidebar-tabs内的元素，避免影响其他Tabs组件 */
    &.sidebar-tabs .ant-tabs-nav {
      margin: 0;
      padding: 8px;
      background: transparent;
      box-sizing: border-box;
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;

      &::before {
        border: none;
      }
    }

    &.sidebar-tabs .ant-tabs-tab {
      padding: 8px 12px;
      margin: 0;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      position: relative;
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;

      /* 创建悬停时的下划线动画 */
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        height: 2px;
        background: var(--accent-color);
        transform: translateX(-50%) scaleX(0);
        transform-origin: center;
        transition: transform 0.3s ease;
        width: calc(100% - 16px); /* 匹配选中状态下划线的宽度 */
      }

      /* 为所有 Tab 创建自定义下划线 */
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: calc(100% - 16px);
        height: 2px;
        background: var(--accent-color);
        transform: translateX(-50%) scaleX(0);
        transform-origin: center;
        transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
        z-index: 1;
      }

      &:hover {
        color: var(--text-primary);

        /* 悬停时下划线从中心向两边延伸 */
        &::after {
          transform: translateX(-50%) scaleX(1);
        }
      }

      &.ant-tabs-tab-active {
        background: transparent;
        color: var(--accent-color);

        /* 激活状态：展开下划线（从中心向两边展开） */
        &::before {
          transform: translateX(-50%) scaleX(1);
        }

        /* 选中状态时隐藏悬停下划线 */
        &::after {
          display: none;
        }

        .ant-tabs-tab-btn {
          color: var(--accent-color);
        }
      }

      /* 非激活状态：确保下划线收缩（向中心收缩） */
      &:not(.ant-tabs-tab-active)::before {
        transform: translateX(-50%) scaleX(0);
      }

      &.sidebar-tabs .ant-tabs-tab-btn {
        display: flex;
        align-items: center;
        font-size: 14px;
        transition: color 0.3s ease;
        visibility: visible !important;
        opacity: 1 !important;
      }
    }

    &.sidebar-tabs .ant-tabs-content-holder {
      flex: 1;
      overflow-y: overlay;
      overflow-x: hidden;
      min-height: 0;
      height: calc(100% - 48px); /* 使用相对高度 */
      box-sizing: border-box;

      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 3px;

        &:hover {
          background: var(--text-tertiary);
        }
      }

      &::-webkit-scrollbar-corner {
        background: transparent;
      }
    }

    &.sidebar-tabs .ant-tabs-tabpane {
      min-height: fit-content;
    }

    /* 禁用原生 ink-bar 的滑动动画 */
    &.sidebar-tabs .ant-tabs-ink-bar {
      display: none !important;
    }
  }
`;

// 助手数据接口
interface Assistant {
  id: string;
  name: string;
  description: string;
  messageCount: number;
}

// 话题数据接口
interface Topic {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  lastActiveTime: string;
  createdAt: string;
}

// 所有可用助手数据池
const allAvailableAssistants: Assistant[] = [
  { id: '1', name: 'Claude', description: '通用AI助手，擅长各类问答和分析', messageCount: 15 },
  { id: '2', name: '写作助手', description: '专业写作辅助，文案创作专家', messageCount: 128 },
  { id: '3', name: '编程助手', description: '代码开发支持，编程问题解答', messageCount: 5 },
  { id: '4', name: '翻译助手', description: '多语言翻译专家', messageCount: 0 },
  { id: '5', name: '数据分析师', description: '数据处理和分析专家', messageCount: 0 },
  { id: '6', name: '设计师', description: 'UI/UX设计建议和创意指导', messageCount: 0 },
  { id: '7', name: '产品经理', description: '产品规划和需求分析专家', messageCount: 0 },
  { id: '8', name: '法律顾问', description: '法律条文解读和建议', messageCount: 0 },
  { id: '9', name: '医学助手', description: '医学知识咨询和健康建议', messageCount: 0 },
  { id: '10', name: '教育导师', description: '学习指导和教学辅助', messageCount: 0 },
  { id: '11', name: '心理咨询师', description: '心理健康和情感支持', messageCount: 0 },
  { id: '12', name: '财务顾问', description: '理财建议和投资指导', messageCount: 0 },
  { id: '13', name: '营销专家', description: '市场推广和品牌策略', messageCount: 0 },
  { id: '14', name: '科学研究员', description: '科学问题研究和论证', messageCount: 0 },
  { id: '15', name: '创意写手', description: '创意内容和故事创作', messageCount: 0 },
];

// 助手列表容器
const AssistantList = styled.div`
  padding: 8px 0 24px 8px;
`;

// 助手Item样式
const AssistantItem = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  padding: 8px 5px;
  margin-bottom: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  text-align: left;

  /* 选中状态和悬停状态的圆角长方形 */
  ${props => props.$isSelected && `
    background: rgba(217, 119, 6, 0.1);
    border: 1px solid var(--accent-color);
  `}

  &:hover {
    background: rgba(217, 119, 6, 0.1);
    border: 1px solid var(--accent-color);
  }

  .assistant-icon {
    color: var(--accent-color);
    font-size: 16px;
    flex-shrink: 0;
  }

  .assistant-name {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  }

  .message-count {
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 20px;
    text-align: center;
  }
`;

// 添加助手按钮
const AddAssistantButton = styled.button`
  width: 100%;
  padding: 8px 6px;
  margin-top: 8px;
  border: 1px dashed var(--border-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  font-size: 14px;

  &:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(217, 119, 6, 0.05);
  }

  .plus-icon {
    font-size: 12px;
  }
`;

// 模态框搜索区域
const ModalSearchArea = styled.div`
  padding: 0 0 16px;
  border-bottom: 1px solid var(--border-color);
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 24px;

  .ant-input-affix-wrapper {
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    padding: 12px 0;

    &:focus, &:focus-within {
      border: none;
      box-shadow: none;
    }

    .ant-input {
      background: transparent;
      color: var(--text-primary);
      font-size: 16px;

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    .anticon {
      color: var(--text-tertiary);
    }
  }
`;

// 可选助手列表容器
const AvailableAssistantsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 16px 0 8px;
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 18px; /* 为滚动条预留6px空间 */

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
  }
`;

// 可选助手Item
const AvailableAssistantItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  text-align: left;

  &:hover {
    background: rgba(217, 119, 6, 0.05);
  }

  .assistant-icon {
    color: var(--accent-color);
    font-size: 18px;
    flex-shrink: 0;
  }

  .assistant-info {
    flex: 1;

    .assistant-name {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 500;
      margin-bottom: 4px;
    }

    .assistant-description {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
  }
`;

// 话题列表容器
const TopicList = styled.div`
  padding: 8px 0 24px 8px;
  display: flex;
  flex-direction: column;
`;

// 新建话题按钮
const NewTopicButton = styled.button`
  width: 100%;
  padding: 8px 6px;
  margin-bottom: 8px;
  border: 1px dashed var(--border-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  font-size: 14px;

  &:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(217, 119, 6, 0.05);
  }

  .plus-icon {
    font-size: 12px;
  }
`;

// 话题Item样式
const TopicItem = styled.div<{ $isSelected: boolean }>`
  width: 100%;
  position: relative;
  margin-bottom: 4px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  ${props => props.$isSelected && `
    background: rgba(217, 119, 6, 0.1);
    border: 1px solid var(--accent-color);
  `}

  &:hover {
    background: rgba(217, 119, 6, 0.1);

    .topic-menu-overlay {
      opacity: 1;
      visibility: visible;
    }
  }

  .topic-content {
    width: 100%;
    padding: 12px 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    text-align: left;
    border-radius: 8px;

    .topic-title {
      flex: 1;
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 500;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .topic-menu-overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 40px;
    background: linear-gradient(to left, rgba(217, 119, 6, 0.1) 0%, transparent 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    border-radius: 0 8px 8px 0;

    .more-button {
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.8);
        color: var(--text-primary);
      }
    }
  }
`;

// 设置页面容器
const SettingsContainer = styled.div`
  padding: 8px 0 120px 8px; /* 增加底部padding确保所有内容可见 */
`;

// 设置分组
const SettingsGroup = styled.div`
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  margin-bottom: 0;

  &:not(:last-child) {
    border-bottom: none;
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  &:not(:first-child):not(:last-child) {
    border-radius: 0;
  }
`;

// 设置分组标题
const SettingsGroupHeader = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  border-radius: 0;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--border-color);

  &:hover {
    background: var(--bg-tertiary);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .expand-icon {
    color: var(--text-secondary);
    font-size: 12px;
    transition: transform 0.2s ease;

    &.expanded {
      transform: rotate(90deg);
    }
  }
`;

// 设置分组内容
const SettingsGroupContent = styled.div<{ $expanded: boolean }>`
  max-height: ${props => props.$expanded ? 'none' : '0'};
  overflow: ${props => props.$expanded ? 'visible' : 'hidden'};
  transition: max-height 0.3s ease;
  border-top: ${props => props.$expanded ? '1px solid var(--border-color)' : 'none'};
`;

// 设置项
const SettingItem = styled.div`
  padding: 16px 16px 16px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }

  span {
    font-size: 14px;
    color: var(--text-primary);
    flex: 1;
    white-space: nowrap;
  }

  .setting-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-primary);
    flex: 1;
    white-space: nowrap;
    min-width: fit-content;

    .help-icon {
      color: var(--text-tertiary);
      font-size: 14px;
      cursor: help;

      &:hover {
        color: var(--accent-color);
      }
    }
  }

  .setting-control {
    flex-shrink: 0;
    margin-left: auto;
  }

  .ant-switch {
    margin-left: auto;
  }

  .ant-select {
    margin-left: auto;
  }
`;

// 模型温度设置组容器
const TemperatureSettingGroup = styled.div`

`;

// 上下文数设置组容器
const ContextSettingGroup = styled.div`
  border-bottom: 1px solid var(--border-color);
`;

// 滑动条容器
const SliderContainer = styled.div`
  width: 100%;
  padding: 0 16px 16px 16px;

  .ant-slider {
    margin: 8px 0;

    .ant-slider-rail {
      background: var(--bg-tertiary);
    }

    .ant-slider-track {
      background: var(--accent-color);
    }

    .ant-slider-handle {
      border-color: var(--accent-color);

      &:hover, &:focus {
        border-color: var(--accent-color);
        box-shadow: 0 0 0 5px rgba(217, 119, 6, 0.12);
      }
    }
  }
`;

// 字体大小设置容器
const FontSizeContainer = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);

  .font-size-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .font-size-label {
      font-size: 14px;
      color: var(--text-primary);
    }
  }

  .font-size-controls {
    display: flex;
    align-items: center;
    gap: 16px;

    .font-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;

      .size-label {
        font-size: 12px;
        color: var(--text-tertiary);
        min-width: 20px;
      }
    }

    .ant-slider {
      flex: 1;
      margin: 0;
    }
  }
`;

// 格式化消息数显示
const formatMessageCount = (count: number): string => {
  if (count > 99) {
    return '99+';
  }
  return count.toString();
};



interface SidePanelProps {
  inDrawer?: boolean;
}

const SidePanel: React.FC<SidePanelProps> = ({ inDrawer = false }) => {
  const dispatch = useAppDispatch();
  const { sidebarActiveTab, sidebarCollapsed } = useAppSelector(state => state.ui);

  // 助手管理状态
  const [assistants, setAssistants] = useState<Assistant[]>([
    allAvailableAssistants[0], // Claude
    allAvailableAssistants[1], // 写作助手
    allAvailableAssistants[2], // 编程助手
    allAvailableAssistants[3], // 翻译助手
  ]);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>('1');

  // 话题管理状态
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: '1',
      title: '关于React Hook的问题',
      lastMessage: '如何在函数组件中使用useEffect？',
      messageCount: 8,
      lastActiveTime: new Date(Date.now() - 300000).toISOString(), // 5分钟前
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
    },
    {
      id: '2',
      title: '项目架构设计讨论',
      lastMessage: '我们来聊聊微服务架构的优缺点',
      messageCount: 15,
      lastActiveTime: new Date(Date.now() - 3600000).toISOString(), // 1小时前
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2天前
    },
    {
      id: '3',
      title: 'TypeScript 类型推导',
      lastMessage: '泛型的高级用法有哪些？',
      messageCount: 3,
      lastActiveTime: new Date(Date.now() - 86400000).toISOString(), // 1天前
      createdAt: new Date(Date.now() - 259200000).toISOString(), // 3天前
    },
  ]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('1');

  // 模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 话题菜单状态
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // 设置页面状态
  const [settingsExpanded, setSettingsExpanded] = useState({
    assistant: true, // 助手设置默认展开
    message: false,
    math: false,
    code: false,
    input: true, // 输入设置默认展开，确保发送快捷键等设置可见
  });

  // 设置值状态
  const [settingsValues, setSettingsValues] = useState({
    temperatureEnabled: true,
    temperature: 0.7,
    contextEnabled: true,
    contextCount: 10,
    mathEnabled: true,
    codeHighlight: true,
    autoComplete: true,
    // 新的消息设置项
    showPrompts: true,
    useMonospaceFont: false,
    autoFoldContent: true,
    showMessageOutline: false,
    messageStyle: 'simple',
    multiModelResponse: 'horizontal',
    conversationGuide: 'hide',
    // 字体大小滑块相关
    fontSize: 14,
    // 数学公式设置项
    mathRenderer: 'KaTeX',
    dollarSyntax: true,
    // 代码块设置项
    codeStyle: 'auto',
    codeExecution: false,
    codeEditor: false,
    showLineNumbers: false,
    codeFoldable: false,
    codeWrapping: false,
    previewTool: false,
    // 输入设置项
    showTokenCount: true,
    longTextAsFile: false,
    markdownRender: false,
    spaceTranslate: false,
    showTranslateDialog: true,
    slashQuickMenu: false,
    deleteConfirm: true,
    regenerateConfirm: true,
    targetLanguage: 'zh-CN',
    sendKey: 'Enter',
  });

  const handleTabChange = (key: string) => {
    dispatch(setSidebarActiveTab(key as 'assistants' | 'topics' | 'settings'));
  };

  const handleAssistantClick = (assistantId: string) => {
    setSelectedAssistantId(assistantId);
  };

  const handleTopicClick = (topicId: string) => {
    setSelectedTopicId(topicId);
    dispatch(setCurrentTopic(topicId));
  };

  // 创建新话题
  const handleCreateNewTopic = () => {
    const now = new Date().toISOString();
    const newTopic: Topic = {
      id: Date.now().toString(),
      title: `新对话 ${topics.length + 1}`,
      lastMessage: '',
      messageCount: 0,
      lastActiveTime: now,
      createdAt: now,
    };

    // 在列表第一个位置插入新话题
    setTopics(prev => [newTopic, ...prev]);
    setSelectedTopicId(newTopic.id);

    // 通过Redux通知MainContent组件，清空聊天内容并关联到新话题
    dispatch(setCurrentTopic(newTopic.id));
  };

  // 重命名话题
  const handleRenameTopic = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      setEditingTopicId(topicId);
      setEditingTitle(topic.title);
    }
  };

  // 确认重命名
  const handleConfirmRename = (topicId: string) => {
    if (editingTitle.trim()) {
      setTopics(prev => prev.map(topic =>
        topic.id === topicId ? { ...topic, title: editingTitle.trim() } : topic
      ));
    }
    setEditingTopicId(null);
    setEditingTitle('');
  };

  // 取消重命名
  const handleCancelRename = () => {
    setEditingTopicId(null);
    setEditingTitle('');
  };

  // 删除话题
  const handleDeleteTopic = (topicId: string) => {
    setTopics(prev => prev.filter(topic => topic.id !== topicId));

    // 如果删除的是当前选中的话题，切换到第一个话题
    if (selectedTopicId === topicId) {
      const remainingTopics = topics.filter(topic => topic.id !== topicId);
      if (remainingTopics.length > 0) {
        setSelectedTopicId(remainingTopics[0].id);
        dispatch(setCurrentTopic(remainingTopics[0].id));
      } else {
        setSelectedTopicId('');
        dispatch(setCurrentTopic(undefined));
      }
    }
  };

  // 设置展开/收起处理
  const toggleSettingsGroup = (groupKey: keyof typeof settingsExpanded) => {
    setSettingsExpanded(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // 设置值更新处理
  const updateSettingValue = (key: keyof typeof settingsValues, value: string | number | boolean) => {
    setSettingsValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 获取可添加的助手（过滤掉已添加的）
  const getAvailableAssistants = () => {
    const addedIds = assistants.map(a => a.id);
    return allAvailableAssistants.filter(assistant => !addedIds.includes(assistant.id));
  };

  // 搜索过滤
  const getFilteredAvailableAssistants = () => {
    const available = getAvailableAssistants();
    if (!searchKeyword.trim()) return available;
    return available.filter(assistant =>
      assistant.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      assistant.description.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  };

  // 添加助手
  const handleAddAssistant = (assistant: Assistant) => {
    setAssistants(prev => [...prev, assistant]);
    setShowAddModal(false);
    setSearchKeyword('');
  };

  // 助手标签页内容
  const assistantsTabContent = (
    <AssistantList>
      {assistants.map(assistant => (
        <AssistantItem
          key={`assistant-${assistant.id}`}
          $isSelected={selectedAssistantId === assistant.id}
          onClick={() => handleAssistantClick(assistant.id)}
        >
          <div className="assistant-icon">
            <RobotOutlined />
          </div>
          <div className="assistant-name">{assistant.name}</div>
          <div className="message-count">
            {formatMessageCount(assistant.messageCount)}
          </div>
        </AssistantItem>
      ))}
      <AddAssistantButton onClick={() => setShowAddModal(true)}>
        <PlusOutlined className="plus-icon" />
        添加助手
      </AddAssistantButton>
    </AssistantList>
  );

  // 对话标签页内容
  const topicsTabContent = (
    <TopicList>
      <NewTopicButton onClick={handleCreateNewTopic}>
        <PlusOutlined className="plus-icon" />
        新建话题
      </NewTopicButton>
      {topics.map(topic => {
        const isEditing = editingTopicId === topic.id;

        // 创建下拉菜单项
        const menuItems = [
          {
            key: 'rename',
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EditOutlined />
                重命名
              </div>
            ),
            onClick: () => handleRenameTopic(topic.id),
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'delete',
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4f' }}>
                <DeleteOutlined />
                删除
              </div>
            ),
            onClick: () => handleDeleteTopic(topic.id),
          },
        ];

        return (
          <TopicItem
            key={`topic-${topic.id}`}
            $isSelected={selectedTopicId === topic.id}
          >
            {isEditing ? (
              <div className="topic-content">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onPressEnter={() => handleConfirmRename(topic.id)}
                  onBlur={handleCancelRename}
                  autoFocus
                  style={{
                    border: 'none',
                    boxShadow: 'none',
                    padding: 0,
                    background: 'transparent',
                    fontSize: '14px'
                  }}
                />
              </div>
            ) : (
              <>
                <button
                  className="topic-content"
                  onClick={() => handleTopicClick(topic.id)}
                >
                  <div className="topic-title">{topic.title}</div>
                </button>
                <div className="topic-menu-overlay">
                  <Dropdown
                    menu={{ items: menuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <button className="more-button" onClick={(e) => e.stopPropagation()}>
                      <MoreOutlined />
                    </button>
                  </Dropdown>
                </div>
              </>
            )}
          </TopicItem>
        );
      })}
    </TopicList>
  );

  // 设置标签页内容
  const settingsTabContent = (
    <SettingsContainer>
      {/* 助手设置 */}
      <SettingsGroup>
        <SettingsGroupHeader onClick={() => toggleSettingsGroup('assistant')}>
          <div className="header-left">
            <span>助手设置</span>
          </div>
          <RightOutlined
            className={`expand-icon ${settingsExpanded.assistant ? 'expanded' : ''}`}
          />
        </SettingsGroupHeader>
        <SettingsGroupContent $expanded={settingsExpanded.assistant}>
          <TemperatureSettingGroup>
            <SettingItem style={{ borderBottom: 'none', paddingBottom: '8px' }}>
              <div className="setting-label">
                <span>模型温度</span>
                <Tooltip title="控制AI回答的随机性和创造性。较低的值使回答更确定和一致，较高的值使回答更多样和创造性。">
                  <QuestionCircleOutlined className="help-icon" />
                </Tooltip>
              </div>
              <div className="setting-control">
                <Switch
                  checked={settingsValues.temperatureEnabled}
                  onChange={(checked) => updateSettingValue('temperatureEnabled', checked)}
                />
              </div>
            </SettingItem>
            {settingsValues.temperatureEnabled && (
              <SliderContainer style={{ paddingBottom: '8px' }}>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={settingsValues.temperature}
                  onChange={(value) => updateSettingValue('temperature', value)}
                  tooltip={{ formatter: (value) => `${value}` }}
                />
              </SliderContainer>
            )}
          </TemperatureSettingGroup>
          <ContextSettingGroup>
            <SettingItem style={{ borderBottom: 'none', paddingBottom: '8px', paddingTop: '16px' }}>
              <div className="setting-label">
                <span>上下文数</span>
                <Tooltip title="设置AI能够记住的对话轮数，影响上下文理解能力。">
                  <QuestionCircleOutlined className="help-icon" />
                </Tooltip>
              </div>
              <div className="setting-control">
                <Switch
                  checked={settingsValues.contextEnabled}
                  onChange={(checked) => updateSettingValue('contextEnabled', checked)}
                />
              </div>
            </SettingItem>
            {settingsValues.contextEnabled && (
              <SliderContainer>
                <Slider
                  min={0}
                  max={20}
                  step={1}
                  value={settingsValues.contextCount}
                  onChange={(value) => updateSettingValue('contextCount', value)}
                  tooltip={{ formatter: (value) => `${value}轮` }}
                />
              </SliderContainer>
            )}
          </ContextSettingGroup>
        </SettingsGroupContent>
      </SettingsGroup>

      {/* 消息设置 */}
      <SettingsGroup>
        <SettingsGroupHeader onClick={() => toggleSettingsGroup('message')}>
          <div className="header-left">
            <span>消息设置</span>
          </div>
          <RightOutlined
            className={`expand-icon ${settingsExpanded.message ? 'expanded' : ''}`}
          />
        </SettingsGroupHeader>
        <SettingsGroupContent $expanded={settingsExpanded.message}>
          <SettingItem>
            <div className="setting-label">
              <span>显示提示词</span>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.showPrompts}
                onChange={(checked) => updateSettingValue('showPrompts', checked)}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>使用等线字体</span>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.useMonospaceFont}
                onChange={(checked) => updateSettingValue('useMonospaceFont', checked)}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>思考内容自动折叠</span>
              <Tooltip title="自动折叠AI的思考过程内容">
                <QuestionCircleOutlined className="help-icon" />
              </Tooltip>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.autoFoldContent}
                onChange={(checked) => updateSettingValue('autoFoldContent', checked)}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>显示消息大纲</span>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.showMessageOutline}
                onChange={(checked) => updateSettingValue('showMessageOutline', checked)}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>消息样式</span>
            </div>
            <div className="setting-control">
              <Select
                value={settingsValues.messageStyle}
                onChange={(value) => updateSettingValue('messageStyle', value)}
                options={[
                  { value: 'simple', label: '简洁' },
                  { value: 'detailed', label: '详细' },
                  { value: 'compact', label: '紧凑' }
                ]}
                style={{ width: 80 }}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>多模型回答样式</span>
            </div>
            <div className="setting-control">
              <Select
                value={settingsValues.multiModelResponse}
                onChange={(value) => updateSettingValue('multiModelResponse', value)}
                options={[
                  { value: 'horizontal', label: '横向排列' },
                  { value: 'vertical', label: '纵向排列' }
                ]}
                style={{ width: 100 }}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>对话导航按钮</span>
            </div>
            <div className="setting-control">
              <Select
                value={settingsValues.conversationGuide}
                onChange={(value) => updateSettingValue('conversationGuide', value)}
                options={[
                  { value: 'hide', label: '不显示' },
                  { value: 'show', label: '显示' },
                  { value: 'auto', label: '自动' }
                ]}
                style={{ width: 90 }}
              />
            </div>
          </SettingItem>
          <FontSizeContainer>
            <div className="font-size-header">
              <span className="font-size-label">消息字体大小</span>
            </div>
            <div className="font-size-controls">
              <div className="font-preview">
                <span className="size-label">A</span>
                <Slider
                  min={10}
                  max={24}
                  step={1}
                  value={settingsValues.fontSize}
                  onChange={(value) => updateSettingValue('fontSize', value)}
                  tooltip={{ formatter: null }}
                />
                <span className="size-label" style={{ fontSize: '18px' }}>A</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
              默认
            </div>
          </FontSizeContainer>
        </SettingsGroupContent>
      </SettingsGroup>

      {/* 数学公式设置 */}
      <SettingsGroup>
        <SettingsGroupHeader onClick={() => toggleSettingsGroup('math')}>
          <div className="header-left">
            <span>数学公式设置</span>
          </div>
          <RightOutlined
            className={`expand-icon ${settingsExpanded.math ? 'expanded' : ''}`}
          />
        </SettingsGroupHeader>
        <SettingsGroupContent $expanded={settingsExpanded.math}>
          <SettingItem>
            <div className="setting-label">
              <span>数学公式引擎</span>
            </div>
            <div className="setting-control">
              <Select
                value={settingsValues.mathRenderer}
                onChange={(value) => updateSettingValue('mathRenderer', value)}
                options={[
                  { value: 'KaTeX', label: 'KaTeX' },
                  { value: 'MathJax', label: 'MathJax' },
                  { value: 'none', label: '禁用' }
                ]}
                style={{ width: 90 }}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>启用 $...$ </span>
              <Tooltip title="启用美元符号语法来表示数学公式">
                <QuestionCircleOutlined className="help-icon" />
              </Tooltip>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.dollarSyntax}
                onChange={(checked) => updateSettingValue('dollarSyntax', checked)}
              />
            </div>
          </SettingItem>
        </SettingsGroupContent>
      </SettingsGroup>

      {/* 代码块设置 */}
      <SettingsGroup>
        <SettingsGroupHeader onClick={() => toggleSettingsGroup('code')}>
          <div className="header-left">
            <span>代码块设置</span>
          </div>
          <RightOutlined
            className={`expand-icon ${settingsExpanded.code ? 'expanded' : ''}`}
          />
        </SettingsGroupHeader>
        <SettingsGroupContent $expanded={settingsExpanded.code}>
          <SettingItem>
            <div className="setting-label">
              <span>代码风格</span>
            </div>
            <div className="setting-control">
              <Select
                value={settingsValues.codeStyle}
                onChange={(value) => updateSettingValue('codeStyle', value)}
                options={[
                  { value: 'auto', label: 'auto' },
                  { value: 'github', label: 'GitHub' },
                  { value: 'vscode', label: 'VS Code' },
                  { value: 'atom', label: 'Atom' }
                ]}
                style={{ width: 80 }}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>代码执行</span>
              <Tooltip title="允许在代码块中执行代码">
                <QuestionCircleOutlined className="help-icon" />
              </Tooltip>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.codeExecution}
                onChange={(checked) => updateSettingValue('codeExecution', checked)}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>代码编辑器</span>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.codeEditor}
                onChange={(checked) => updateSettingValue('codeEditor', checked)}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>代码显示行号</span>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.showLineNumbers}
                onChange={(checked) => updateSettingValue('showLineNumbers', checked)}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>代码块可折叠</span>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.codeFoldable}
                onChange={(checked) => updateSettingValue('codeFoldable', checked)}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>代码块可换行</span>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.codeWrapping}
                onChange={(checked) => updateSettingValue('codeWrapping', checked)}
              />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="setting-label">
              <span>启用预览工具</span>
              <Tooltip title="启用代码预览和调试工具">
                <QuestionCircleOutlined className="help-icon" />
              </Tooltip>
            </div>
            <div className="setting-control">
              <Switch
                checked={settingsValues.previewTool}
                onChange={(checked) => updateSettingValue('previewTool', checked)}
              />
            </div>
          </SettingItem>
        </SettingsGroupContent>
      </SettingsGroup>

      {/* 输入设置 */}
      <SettingsGroup>
        <SettingsGroupHeader onClick={() => toggleSettingsGroup('input')}>
          <div className="header-left">
            <span>输入设置</span>
          </div>
          <RightOutlined
            className={`expand-icon ${settingsExpanded.input ? 'expanded' : ''}`}
          />
        </SettingsGroupHeader>
        <SettingsGroupContent $expanded={settingsExpanded.input}>
          <SettingItem>
            <span>显示预估 Token 数</span>
            <Switch
              checked={settingsValues.showTokenCount}
              onChange={(checked) => updateSettingValue('showTokenCount', checked)}
            />
          </SettingItem>
          <SettingItem>
            <span>长文本粘贴为文件</span>
            <Switch
              checked={settingsValues.longTextAsFile}
              onChange={(checked) => updateSettingValue('longTextAsFile', checked)}
            />
          </SettingItem>
          <SettingItem>
            <span>Markdown 渲染输入消息</span>
            <Switch
              checked={settingsValues.markdownRender}
              onChange={(checked) => updateSettingValue('markdownRender', checked)}
            />
          </SettingItem>
          <SettingItem>
            <span>3 个空格快速翻译</span>
            <Switch
              checked={settingsValues.spaceTranslate}
              onChange={(checked) => updateSettingValue('spaceTranslate', checked)}
            />
          </SettingItem>
          <SettingItem>
            <span>显示翻译确认对话框</span>
            <Switch
              checked={settingsValues.showTranslateDialog}
              onChange={(checked) => updateSettingValue('showTranslateDialog', checked)}
            />
          </SettingItem>
          <SettingItem>
            <span>启用 / 和 @ 触发快捷菜单</span>
            <Switch
              checked={settingsValues.slashQuickMenu}
              onChange={(checked) => updateSettingValue('slashQuickMenu', checked)}
            />
          </SettingItem>
          <SettingItem>
            <span>删除消息前确认</span>
            <Switch
              checked={settingsValues.deleteConfirm}
              onChange={(checked) => updateSettingValue('deleteConfirm', checked)}
            />
          </SettingItem>
          <SettingItem>
            <span>重新生成消息前确认</span>
            <Switch
              checked={settingsValues.regenerateConfirm}
              onChange={(checked) => updateSettingValue('regenerateConfirm', checked)}
            />
          </SettingItem>
          <SettingItem>
            <span>目标语言</span>
            <Select
              value={settingsValues.targetLanguage}
              onChange={(value) => updateSettingValue('targetLanguage', value)}
              options={[
                { value: 'zh-CN', label: '🇨🇳 简体中文' },
                { value: 'en', label: 'English' },
                { value: 'ja', label: 'Japanese' },
                { value: 'ko', label: 'Korean' }
              ]}
              style={{ width: 130 }}
            />
          </SettingItem>
          <SettingItem>
            <span>发送快捷键</span>
            <Select
              value={settingsValues.sendKey}
              onChange={(value) => updateSettingValue('sendKey', value)}
              options={[
                { value: 'Enter', label: 'Enter' },
                { value: 'Ctrl+Enter', label: 'Ctrl+Enter' },
                { value: 'Shift+Enter', label: 'Shift+Enter' }
              ]}
              style={{ width: 120 }}
            />
          </SettingItem>
        </SettingsGroupContent>
      </SettingsGroup>
    </SettingsContainer>
  );

  // Drawer模式下总是显示完整内容，普通模式下根据状态显示
  if (inDrawer) {
    // 抽屉模式：不使用Sider组件，直接渲染内容
    return (
      <div style={{ width: '100%', height: '100%', background: 'var(--bg-secondary)' }}>
        <Tabs
          className="sidebar-tabs"
          activeKey={sidebarActiveTab}
          onChange={handleTabChange}
          tabPosition="top"
          size="small"
          type="line"
          destroyOnHidden={false}
          items={[
            {
              key: 'assistants',
              label: '助手',
              children: assistantsTabContent,
            },
            {
              key: 'topics',
              label: '话题',
              children: topicsTabContent,
            },
            {
              key: 'settings',
              label: '设置',
              children: settingsTabContent,
            },
          ]}
        />
      </div>
    );
  }

  // 普通模式：使用Sider组件，支持收起/展开
  return (
    <>
      <StyledSider
        width={sidebarCollapsed ? 0 : "var(--sidebar-width)"}
        collapsed={sidebarCollapsed}
        collapsedWidth={0}
        theme="light"
        trigger={null}
      >
        <Tabs
          className="sidebar-tabs"
          activeKey={sidebarActiveTab}
          onChange={handleTabChange}
          tabPosition="top"
          size="small"
          type="line"
          destroyOnHidden={false}
          items={[
            {
              key: 'assistants',
              label: '助手',
              children: assistantsTabContent,
            },
            {
              key: 'topics',
              label: '话题',
              children: topicsTabContent,
            },
            {
              key: 'settings',
              label: '设置',
              children: settingsTabContent,
            },
          ]}
        />
      </StyledSider>

      {/* 添加助手模态框 */}
      <Modal
        title={null}
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          setSearchKeyword('');
        }}
        footer={null}
        width={500}
        destroyOnHidden
        closable={false}
        maskClosable={true}
      >
        <ModalSearchArea>
          <Input
            placeholder="搜索助手..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            size="middle"
          />
        </ModalSearchArea>

        <AvailableAssistantsList>
          {getFilteredAvailableAssistants().map(assistant => (
            <AvailableAssistantItem
              key={assistant.id}
              onClick={() => handleAddAssistant(assistant)}
            >
              <div className="assistant-icon">
                <RobotOutlined />
              </div>
              <div className="assistant-info">
                <div className="assistant-name">{assistant.name}</div>
                <div className="assistant-description">{assistant.description}</div>
              </div>
            </AvailableAssistantItem>
          ))}
          {getFilteredAvailableAssistants().length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-tertiary)'
            }}>
              {searchKeyword ? '没有找到匹配的助手' : '没有可添加的助手'}
            </div>
          )}
        </AvailableAssistantsList>
      </Modal>
    </>
  );
};

export default SidePanel;