/**
 * AssistantManager 组件相关常量数据
 * 从 AssistantManager.tsx 中抽离的常量定义
 */

import React from 'react';
import {
  BankOutlined,
  BookOutlined,
  BulbOutlined,
  CodeOutlined,
  CommentOutlined,
  FileOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HeartOutlined,
  HomeOutlined,
  PictureOutlined,
  ReadOutlined,
  RobotOutlined,
  SmileOutlined,
  StarOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  TranslationOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { Assistant, Category, KnowledgeBaseOption } from './types';

// 分类数据
export const categories: Category[] = [
  { key: 'my', label: '我的', count: 3, icon: React.createElement(UserOutlined) },
  { key: 'featured', label: '精选', count: 4, icon: React.createElement(StarOutlined) },
  { key: 'business', label: '商业', count: 167, icon: React.createElement(BankOutlined) },
  { key: 'tools', label: '工具', count: 281, icon: React.createElement(ToolOutlined) },
  { key: 'language', label: '语言', count: 25, icon: React.createElement(TranslationOutlined) },
  { key: 'office', label: '办公', count: 44, icon: React.createElement(FileOutlined) },
  { key: 'general', label: '通用', count: 37, icon: React.createElement(GlobalOutlined) },
  { key: 'programming', label: '编程', count: 61, icon: React.createElement(CodeOutlined) },
  { key: 'emotion', label: '情感', count: 57, icon: React.createElement(HeartOutlined) },
  { key: 'education', label: '教育', count: 174, icon: React.createElement(BookOutlined) },
  { key: 'creativity', label: '创意', count: 166, icon: React.createElement(BulbOutlined) },
  { key: 'academic', label: '学术', count: 54, icon: React.createElement(ReadOutlined) },
  { key: 'design', label: '设计', count: 31, icon: React.createElement(PictureOutlined) },
  { key: 'entertainment', label: '娱乐', count: 75, icon: React.createElement(SmileOutlined) },
  { key: 'life', label: '生活', count: 83, icon: React.createElement(HomeOutlined) }
];

// 知识库选项
export const knowledgeBaseOptions: KnowledgeBaseOption[] = [
  { label: '通用知识库', value: 'general' },
  { label: '技术文档', value: 'technical' },
  { label: '产品说明', value: 'product' },
  { label: '企业知识', value: 'enterprise' },
  { label: '学术论文', value: 'academic' },
  { label: '法律条文', value: 'legal' },
  { label: '医学资料', value: 'medical' },
  { label: '运营指南', value: 'operations' }
];

// 模拟助手数据
export const mockAssistants: Assistant[] = [
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
    usageCount: 312
  }
];

// 默认表单值
export const defaultAssistantForm = {
  emoji: '',
  name: '',
  prompt: '',
  knowledgeBase: [] as string[]
};

// 工具函数：根据助手获取图标
export const getAssistantIcon = (assistant: Assistant): React.ReactElement => {
  if (assistant.tags.includes('短视频')) return React.createElement(ThunderboltOutlined);
  if (assistant.tags.includes('编程')) return React.createElement(FileTextOutlined);
  if (assistant.tags.includes('创作')) return React.createElement(BulbOutlined);
  if (assistant.tags.includes('问答')) return React.createElement(CommentOutlined);
  return React.createElement(RobotOutlined);
};

// 工具函数：过滤助手数据
export const filterAssistants = (
  assistants: Assistant[],
  activeCategory: string,
  searchQuery: string
): Assistant[] => {
  if (searchQuery.trim()) {
    return assistants.filter(assistant =>
      assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assistant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assistant.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  return assistants.filter(assistant => {
    const matchesCategory = activeCategory === 'my' ? assistant.category === 'my' : true;
    return matchesCategory;
  });
};