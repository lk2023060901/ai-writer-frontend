/**
 * 侧边栏组件常量定义
 */

import type { Assistant, Topic, SettingsValues, SettingsExpanded } from './types';

// 所有可用助手数据池
export const allAvailableAssistants: Assistant[] = [
  { id: '1', name: 'Claude', description: '通用AI助手，擅长各类问答和分析', messageCount: 15 },
  { id: '2', name: '写作助手', description: '专业的文档写作和编辑助手', messageCount: 8 },
  { id: '3', name: '编程助手', description: '代码编写、调试和优化专家', messageCount: 23 },
  { id: '4', name: '翻译助手', description: '多语言翻译和本地化专家', messageCount: 5 },
  { id: '5', name: '研究助手', description: '学术研究和资料分析专家', messageCount: 0 },
  { id: '6', name: '创意助手', description: '创意写作和头脑风暴专家', messageCount: 0 },
  { id: '7', name: '数据分析师', description: '数据分析和可视化专家', messageCount: 0 },
  { id: '8', name: '产品经理', description: '产品策划和需求分析专家', messageCount: 0 },
  { id: '9', name: '设计顾问', description: 'UI/UX设计和用户体验专家', messageCount: 0 },
  { id: '10', name: '营销专家', description: '市场营销和品牌策略专家', messageCount: 0 },
];

// 默认初始助手列表
export const defaultAssistants: Assistant[] = [
  allAvailableAssistants[0], // Claude
  allAvailableAssistants[1], // 写作助手
  allAvailableAssistants[2], // 编程助手
  allAvailableAssistants[3], // 翻译助手
];

// 默认话题数据
export const defaultTopics: Topic[] = [
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
];

// 默认设置值
export const defaultSettingsValues: SettingsValues = {
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
  maxTokens: 2048,
  stream: true,
  enableCitation: true,
  enableWebSearch: false,
  enablePlugins: false,
};

// 默认设置展开状态
export const defaultSettingsExpanded: SettingsExpanded = {
  modelConfig: true,
  advanced: false,
  features: false,
  experimental: false,
  performance: false,
};

// 时间格式化工具函数
export const formatTimeAgo = (isoString: string): string => {
  const now = new Date();
  const time = new Date(isoString);
  const diffInMs = now.getTime() - time.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return '刚刚';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  } else if (diffInDays === 1) {
    return '昨天';
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`;
  } else {
    return time.toLocaleDateString();
  }
};

// 消息数量格式化
export const formatMessageCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  } else if (count < 10000) {
    return `${Math.floor(count / 100) / 10}k`;
  } else {
    return `${Math.floor(count / 1000)}k`;
  }
};