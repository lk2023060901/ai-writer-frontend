import { AssistantGroup, AssistantPreset } from '@/types/launchpad';

const systemPresets: AssistantPreset[] = [
  {
    id: 'preset-ux-writer',
    name: 'UX 写作顾问',
    description: '帮助设计团队迭代交互文案，确保流程的清晰度、语调与品牌一致。',
    category: '产品设计',
    tags: ['UX', 'Copywriting'],
    model: 'gpt-4o-mini',
    prompt: '你是资深 UX Writer，擅长拆解交互流程并输出贴合品牌语调的文案。',
    source: 'system'
  },
  {
    id: 'preset-growth-strategist',
    name: '增长策略顾问',
    description: '分析渠道指标、拆解 AARRR 漏斗，并给出落地的增长实验方案。',
    category: '市场增长',
    tags: ['增长', '渠道'],
    model: 'claude-3-haiku',
    prompt: '你擅长制定增长战略，善于以数据驱动的方式提出实验假设与执行步骤。',
    source: 'system'
  },
  {
    id: 'preset-devrel',
    name: 'DevRel 技术布道师',
    description: '将复杂技术方案编写为面向开发者的指南、样例与发布说明。',
    category: '开发者关系',
    tags: ['文档', 'SDK'],
    model: 'gpt-4o',
    prompt: '你是开发者关系专家，熟悉 API 设计、SDK 打包与开发者生态运营。',
    source: 'system'
  }
];

const communityPresets: AssistantPreset[] = [
  {
    id: 'preset-legal-review',
    name: '合规审阅官',
    description: '面向法务与合规团队，快速识别条款风险并给出修改建议。',
    category: '法务合规',
    tags: ['合同', '监管'],
    model: 'gpt-4o-mini',
    prompt: '你擅长审阅商业合同，熟悉数据合规与跨境条款风险。',
    source: 'community'
  },
  {
    id: 'preset-support-coach',
    name: '客服质检教练',
    description: '自动复盘客服对话，输出改进建议与知识库补充清单。',
    category: '客户支持',
    tags: ['客服', '质检'],
    model: 'claude-3-haiku',
    prompt: '请从专业客服教练角度复盘对话，并以表格列出改进建议。',
    source: 'community'
  }
];

const personalPresets: AssistantPreset[] = [
  {
    id: 'preset-team-brief',
    name: '团队周报助手',
    description: '整理会议纪要、关键指标与行动项，生成结构化的团队周报。',
    category: '内部沟通',
    tags: ['周报', '项目管理'],
    model: 'gpt-4o-mini',
    prompt: '根据提供的会议纪要生成三段式周报：亮点、风险、下一步计划。',
    source: 'custom'
  }
];

export const createInitialAssistantGroups = (): AssistantGroup[] => [
  {
    id: 'my-presets',
    name: '我的',
    presets: personalPresets
  },
  {
    id: 'featured',
    name: '精选',
    presets: communityPresets
  },
  {
    id: 'system',
    name: '系统推荐',
    presets: systemPresets
  }
];
