// Mock数据 - AI模型列表
import type { ModelProvider } from '@/types/model';

export const mockProviders: ModelProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        description: '最强大的模型，适合复杂任务',
        isPro: true,
        capabilities: ['高级推理', '创意写作', '代码生成', '多模态']
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        description: '平衡性能与效率',
        isDefault: true,
        capabilities: ['通用对话', '代码辅助', '内容创作']
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        description: '快速响应，适合简单任务',
        capabilities: ['快速响应', '简单任务']
      },
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4 (Thinking)',
        provider: 'Anthropic',
        description: '具备思考能力的新一代模型',
        isNew: true,
        capabilities: ['深度思考', '复杂推理', '问题分析', '多模态']
      }
    ]
  },
  {
    id: 'qwen',
    name: '通义千问',
    models: [
      {
        id: 'qwen-max',
        name: 'Qwen-Max',
        provider: '通义千问',
        description: '千亿级参数，最强中文能力',
        isPro: true,
        capabilities: ['中文理解', '长文本', '专业知识']
      },
      {
        id: 'qwen-plus',
        name: 'Qwen-Plus',
        provider: '通义千问',
        description: '增强版本，性价比高',
        capabilities: ['中文对话', '知识问答']
      },
      {
        id: 'qwen-turbo',
        name: 'Qwen-Turbo',
        provider: '通义千问',
        description: '快速版本，响应迅速',
        capabilities: ['快速响应', '日常对话']
      },
      {
        id: 'qwen-2-5-7b',
        name: 'Qwen2.5-7B-Instruct',
        provider: '通义千问',
        description: '开源可部署版本',
        capabilities: ['本地部署', '隐私保护']
      }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: [
      {
        id: 'deepseek-v3',
        name: 'DeepSeek-V3',
        provider: 'DeepSeek',
        description: '最新一代模型，性能卓越',
        isNew: true,
        capabilities: ['代码生成', '数学推理', '逻辑分析', '工具调用']
      },
      {
        id: 'deepseek-r1',
        name: 'DeepSeek-R1',
        provider: 'DeepSeek',
        description: '推理增强版本',
        capabilities: ['深度推理', '问题求解', '数学分析']
      },
      {
        id: 'deepseek-coder-v2',
        name: 'DeepSeek-Coder-V2',
        provider: 'DeepSeek',
        description: '专注于代码生成与分析',
        capabilities: ['代码生成', '代码解释', 'Debug辅助']
      }
    ]
  },
  {
    id: 'google',
    name: 'Google',
    models: [
      {
        id: 'gemini-2-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'Google',
        description: '最新快速版本，支持多模态',
        isNew: true,
        capabilities: ['多模态', '实时响应', '视觉理解', '联网搜索']
      },
      {
        id: 'gemini-1-5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        description: '专业版，支持超长上下文',
        isPro: true,
        capabilities: ['100万token', '多模态', '复杂任务', '视觉理解']
      },
      {
        id: 'gemini-1-5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'Google',
        description: '轻量快速版本',
        capabilities: ['快速响应', '日常任务']
      },
      {
        id: 'gemini-1-5-flash-8b',
        name: 'Gemini 1.5 Flash (8B)',
        provider: 'Google',
        description: '8B参数版本，更快速',
        capabilities: ['超快响应', '轻量任务']
      }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        description: '最新GPT-4版本，128K上下文',
        isPro: true,
        capabilities: ['长上下文', '高级推理', '视觉理解', '工具调用']
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        description: '标准GPT-4模型',
        capabilities: ['通用任务', '稳定可靠']
      },
      {
        id: 'gpt-3-5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        description: '快速且经济的选择',
        capabilities: ['快速响应', '日常对话']
      }
    ]
  },
  {
    id: 'moonshot',
    name: 'Moonshot',
    models: [
      {
        id: 'moonshot-v1-32k',
        name: 'Moonshot-32K',
        provider: 'Moonshot',
        description: '支持32K上下文',
        capabilities: ['长文本', '文档分析']
      },
      {
        id: 'moonshot-v1-128k',
        name: 'Moonshot-128K',
        provider: 'Moonshot',
        description: '支持128K超长上下文',
        isPro: true,
        capabilities: ['超长文本', '全文分析']
      }
    ]
  }
];

// 获取默认模型
export const getDefaultModel = () => {
  const defaultModel = mockProviders
    .flatMap(provider => provider.models)
    .find(model => model.isDefault);

  return defaultModel || mockProviders[0].models[1]; // Claude 3.5 Sonnet as fallback
};