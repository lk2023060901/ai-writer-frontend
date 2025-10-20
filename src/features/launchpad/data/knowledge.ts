import { KnowledgeBase, KnowledgeDirectoryItem, KnowledgeFileItem, KnowledgeNoteItem, KnowledgeSitemapItem, KnowledgeUrlItem } from '@/types/launchpad';

const fileItems: KnowledgeFileItem[] = [
  {
    id: 'kb-file-1',
    title: '产品白皮书.pdf',
    size: '1.8 MB',
    tokens: 18540,
    createdAt: '2024-05-12 09:20',
    status: 'ready',
    tags: ['产品', '市场']
  },
  {
    id: 'kb-file-2',
    title: '操作手册.docx',
    size: '732 KB',
    tokens: 8540,
    createdAt: '2024-04-18 16:35',
    status: 'ready',
    tags: ['入门', '培训']
  },
  {
    id: 'kb-file-3',
    title: '客服回复模版.xlsx',
    size: '96 KB',
    tokens: 2140,
    createdAt: '2024-03-02 11:05',
    status: 'processing'
  }
];

const noteItems: KnowledgeNoteItem[] = [
  {
    id: 'kb-note-1',
    title: '季度发布会亮点',
    author: 'Mia',
    createdAt: '2024-05-05 14:22',
    status: 'ready',
    tags: ['发布会']
  },
  {
    id: 'kb-note-2',
    title: '品牌语调关键词',
    author: 'Leo',
    createdAt: '2024-04-28 10:12',
    status: 'ready',
    tags: ['品牌', '语调']
  }
];

const directoryItems: KnowledgeDirectoryItem[] = [
  {
    id: 'kb-dir-1',
    title: '产品介绍',
    path: '/docs/products',
    documentCount: 18,
    createdAt: '2024-02-19 18:40',
    status: 'ready'
  },
  {
    id: 'kb-dir-2',
    title: '常见问题',
    path: '/docs/faq',
    documentCount: 12,
    createdAt: '2024-02-02 09:10',
    status: 'ready'
  }
];

const urlItems: KnowledgeUrlItem[] = [
  {
    id: 'kb-url-1',
    title: '帮助中心：账户配置',
    url: 'https://support.example.com/account',
    createdAt: '2024-05-22 08:30',
    lastCrawlAt: '2024-06-01 21:40',
    status: 'ready'
  },
  {
    id: 'kb-url-2',
    title: '博客：产品路线图',
    url: 'https://blog.example.com/roadmap',
    createdAt: '2024-04-15 12:20',
    lastCrawlAt: '2024-05-27 09:20',
    status: 'ready',
    tags: ['产品', '路线图']
  }
];

const sitemapItems: KnowledgeSitemapItem[] = [
  {
    id: 'kb-sitemap-1',
    title: 'docs.example.com',
    rootUrl: 'https://docs.example.com/sitemap.xml',
    pageCount: 64,
    createdAt: '2024-04-02 10:50',
    status: 'ready'
  }
];

export const createInitialKnowledgeBases = (): KnowledgeBase[] => [
  {
    id: 'kb-1',
    name: '产品知识库',
    description: '聚合产品功能说明、用户常见问题与市场物料，支撑多渠道对外沟通。',
    tags: ['产品', '市场', 'FAQ'],
    knowledgeRecognition: 'on',
    modelInfo: {
      provider: 'OpenAI',
      model: 'gpt-4o-mini',
      embeddingModel: 'text-embedding-3-large'
    },
    stats: {
      documents: 46,
      tokens: 154320,
      size: '3.6 GB',
      lastUpdated: '2024-06-03 18:20'
    },
    files: fileItems,
    notes: noteItems,
    directories: directoryItems,
    urls: urlItems,
    sitemaps: sitemapItems
  },
  {
    id: 'kb-2',
    name: '服务支持知识库',
    description: '涵盖客服SOP、SLA 与合规准则，辅助服务团队快速响应。',
    tags: ['客服', 'SLA'],
    knowledgeRecognition: 'off',
    modelInfo: {
      provider: 'Anthropic',
      model: 'claude-3-haiku',
      embeddingModel: 'text-embedding-3-small'
    },
    stats: {
      documents: 28,
      tokens: 64320,
      size: '1.4 GB',
      lastUpdated: '2024-05-22 09:10'
    },
    files: fileItems.slice(0, 2),
    notes: noteItems.slice(0, 1),
    directories: directoryItems.slice(0, 1),
    urls: urlItems.slice(0, 1),
    sitemaps: []
  },
  {
    id: 'kb-3',
    name: '品牌素材库',
    description: '存放品牌语调、视觉素材与宣发模板，保障输出一致性。',
    tags: ['品牌', '素材'],
    knowledgeRecognition: 'on',
    modelInfo: {
      provider: 'Moonshot',
      model: 'moonshot-v1-32k',
      embeddingModel: 'moon-embedding-1'
    },
    stats: {
      documents: 36,
      tokens: 103840,
      size: '2.1 GB',
      lastUpdated: '2024-05-11 15:05'
    },
    files: fileItems.filter((item) => item.status !== 'processing'),
    notes: noteItems,
    directories: directoryItems,
    urls: [],
    sitemaps: sitemapItems
  }
];
