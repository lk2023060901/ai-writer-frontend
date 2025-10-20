'use client';

import { nanoid } from 'nanoid';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  assistantId: string;
  name: string;
  prompt?: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface KnowledgeBase {
  id: string;
  name: string;
  summary?: string;
}

export interface AssistantModel {
  name: string;
  provider: string;
}

export interface AssistantQuickPhrase {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface MCPServer {
  id: string;
  name: string;
  description?: string;
  baseUrl?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  isActive: boolean;
}

export interface AssistantCustomParameter {
  name: string;
  value: string | number | boolean | Record<string, unknown>;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface AssistantSettings {
  temperature: number;
  enableTemperature: boolean;
  contextCount: number;
  enableMaxTokens: boolean;
  maxTokens: number;
  streamOutput: boolean;
  topP: number;
  enableTopP: boolean;
  toolUseMode: 'prompt' | 'auto' | 'manual';
  customParameters: AssistantCustomParameter[];
}

export interface Assistant {
  id: string;
  name: string;
  prompt: string;
  systemPrompt?: string;
  emoji?: string;
  type: 'chat' | string;
  topics: Topic[];
  defaultModel?: AssistantModel;
  model?: AssistantModel;
  knowledge_bases?: KnowledgeBase[];
  knowledgeRecognition?: 'off' | 'on';
  regularPhrases?: AssistantQuickPhrase[];
  enableMemory?: boolean;
  settings: AssistantSettings;
  mcpServers?: MCPServer[];
}

const defaultSettings = (): AssistantSettings => ({
  temperature: 1,
  enableTemperature: true,
  contextCount: 10,
  enableMaxTokens: false,
  maxTokens: 0,
  streamOutput: true,
  topP: 1,
  enableTopP: false,
  toolUseMode: 'prompt',
  customParameters: [],
});

export const knowledgeBaseCatalog: KnowledgeBase[] = [
  { id: 'kb-products', name: '产品知识库', summary: '涵盖产品功能、FAQ 与最佳实践。' },
  { id: 'kb-policies', name: '政策摘要', summary: '内部政策、合规与法务摘要。' },
  { id: 'kb-style', name: '品牌风格指南', summary: '统一文案语气、品牌设定与示例。' },
];

export const createDefaultTopic = (assistantId: string, name = '新的对话'): Topic => ({
  id: nanoid(),
  assistantId,
  name,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [],
});

const createQuickPhrase = (title: string, content: string): AssistantQuickPhrase => ({
  id: nanoid(),
  title,
  content,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const mockAssistants: Assistant[] = [
  {
    id: 'assistant-general',
    name: '🤖 通用助手',
    emoji: '🤖',
    prompt:
      '你是一位通用 AI 助手，需要用简洁、专业的方式回答各种问题并提出可执行建议。',
    systemPrompt:
      '保持友好语气，回答要分条展示；若无法确定答案，请说明不确定并提供可能的下一步。',
    type: 'chat',
    defaultModel: { name: 'gpt-4o-mini', provider: 'openai' },
    model: { name: 'gpt-4o-mini', provider: 'openai' },
    topics: [
      {
        id: 'topic-general-1',
        assistantId: 'assistant-general',
        name: '欢迎对话',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-general-1',
            role: 'user',
            content: '你好，能介绍一下平台吗？',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'msg-general-2',
            role: 'assistant',
            content:
              '当然可以！AI Writer Platform 支持多模型协作、知识库检索以及团队级权限管理。',
            createdAt: new Date().toISOString(),
          },
        ],
      },
      createDefaultTopic('assistant-general'),
    ],
    knowledge_bases: [knowledgeBaseCatalog[0], knowledgeBaseCatalog[2]],
    knowledgeRecognition: 'on',
    regularPhrases: [
      createQuickPhrase('欢迎语', '你好，我是你的写作助手，很高兴为你服务。'),
      createQuickPhrase('追问', '还有其他内容需要我继续完善吗？'),
    ],
    enableMemory: false,
    mcpServers: [],
    settings: {
      ...defaultSettings(),
      temperature: 0.9,
      contextCount: 8,
    },
  },
  {
    id: 'assistant-writer',
    name: '📝 文案创作专家',
    emoji: '📝',
    prompt:
      '你是一名品牌文案专家，擅长撰写社交媒体文案与营销内容，保持激励性的口吻。',
    systemPrompt:
      '确保输出遵循品牌风格指南，必要时引用示例语句；遵循 Markdown 排版。',
    type: 'chat',
    defaultModel: { name: 'claude-3-haiku', provider: 'anthropic' },
    model: { name: 'claude-3-haiku', provider: 'anthropic' },
    topics: [
      createDefaultTopic('assistant-writer', '营销周报草稿'),
      createDefaultTopic('assistant-writer', '社媒脚本创意'),
    ],
    knowledge_bases: [knowledgeBaseCatalog[2]],
    knowledgeRecognition: 'off',
    regularPhrases: [
      createQuickPhrase('品牌提醒', '请按照品牌风格指南保持积极、进取的语气。'),
    ],
    enableMemory: true,
    mcpServers: [],
    settings: {
      ...defaultSettings(),
      temperature: 1.2,
      enableTemperature: true,
      contextCount: 12,
      toolUseMode: 'prompt',
    },
  },
  {
    id: 'assistant-engineer',
    name: '🧑‍💻 技术顾问',
    emoji: '🧑‍💻',
    prompt:
      '你是全栈技术顾问，请以步骤化方式协助定位问题、编写代码与撰写 ADR。',
    systemPrompt:
      '优先提供代码片段与命令行示例，必要时提示安全与性能注意事项。',
    type: 'chat',
    defaultModel: { name: 'gpt-4o', provider: 'openai' },
    model: { name: 'gpt-4o', provider: 'openai' },
    topics: [createDefaultTopic('assistant-engineer', '服务监控治理')],
    knowledge_bases: [knowledgeBaseCatalog[0], knowledgeBaseCatalog[1]],
    knowledgeRecognition: 'on',
    regularPhrases: [
      createQuickPhrase('代码审查提示', '请按照 Clean Architecture 原则分析风险并提出优化建议。'),
    ],
    enableMemory: false,
    mcpServers: [],
    settings: {
      ...defaultSettings(),
      temperature: 0.7,
      enableTopP: true,
      topP: 0.95,
      toolUseMode: 'auto',
      customParameters: [
        { name: 'retryCount', value: 2, type: 'number' },
        { name: 'observability', value: true, type: 'boolean' },
      ],
    },
  },
];

export const chatLayoutPreferences = {
  showAssistants: true,
  showTopics: true,
  topicPosition: 'left' as const,
  messageStyle: 'bubble' as const,
  messageNavigation: 'scroll' as const,
  narrowMode: false,
};

export const chatNavbarPreference = {
  isLeftNavbar: true,
  isTopNavbar: false,
};
