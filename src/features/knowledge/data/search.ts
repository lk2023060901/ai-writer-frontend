import type { KnowledgeSearchResult } from '@/types/launchpad';

type KnowledgeSearchDataset = Record<string, KnowledgeSearchResult[]>;

export const knowledgeSearchDataset: KnowledgeSearchDataset = {
  'kb-1': [
    {
      id: 'kb-1-search-1',
      title: '产品白皮书：核心功能概览',
      pageContent:
        '产品白皮书梳理了核心功能模块，以及对应的价值陈述与上线节奏。该章节重点强调自动化写作、团队协同与权限控制三大亮点。',
      score: 0.87,
      metadata: {
        source: 'https://docs.example.com/products/whitepaper',
        type: 'text'
      }
    },
    {
      id: 'kb-1-search-2',
      title: 'FAQ：如何配置多语言知识库',
      pageContent:
        '若需要为海外团队提供多语言知识库，建议先启用分区配置，再通过批量导入工具同步翻译后的 Markdown 文档。',
      score: 0.78,
      metadata: {
        source: 'https://docs.example.com/faq/multi-language',
        type: 'text'
      }
    },
    {
      id: 'kb-1-search-3',
      title: '市场素材：品牌语调与应用场景',
      pageContent:
        '品牌语调需保持“专业、可信、亲和”。宣传场景涵盖官网首屏、行业活动邮件以及社媒内容，建议统一引用标准术语。',
      score: 0.74,
      metadata: {
        source: 'file://产品知识库/市场素材/品牌语调.md',
        type: 'text'
      }
    }
  ],
  'kb-2': [
    {
      id: 'kb-2-search-1',
      title: '客服 SOP：高优先级工单处理',
      pageContent:
        '当收到高优先级工单时，需在 10 分钟内完成响应，并同步微信群值班负责人。表格附带追踪字段与模板回复。',
      score: 0.9,
      metadata: {
        source: 'file://客服SOP/高优先级处理流程.docx',
        type: 'text'
      },
      file: {
        name: 'priority-handling.docx',
        originName: '高优先级处理流程.docx',
        path: '/files/support/priority-handling.docx'
      }
    },
    {
      id: 'kb-2-search-2',
      title: 'SLA 公告：响应与解决时间',
      pageContent:
        '企业版 SLA 要求工作时间内 30 分钟响应、4 小时解决。若预计延时，需向客户发送沟通邮件模板。',
      score: 0.82,
      metadata: {
        source: 'https://support.example.com/sla/enterprise',
        type: 'text'
      }
    }
  ],
  'kb-3': [
    {
      id: 'kb-3-search-1',
      title: '品牌素材：视觉规范速查',
      pageContent:
        '视觉规范速查表包含 logo 保护区、色板与字体搭配建议，建议下载最新版本以防止使用过期素材。',
      score: 0.86,
      metadata: {
        source: 'file://品牌素材库/视觉规范速查表.pdf',
        type: 'text'
      },
      file: {
        name: 'visual-style-guide.pdf',
        originName: '视觉规范速查表.pdf',
        path: '/files/brand/visual-style-guide.pdf'
      }
    },
    {
      id: 'kb-3-search-2',
      title: '宣发模板：新品发布短视频脚本',
      pageContent:
        '短视频脚本包含 45 秒成片示例，开头三秒聚焦痛点，中段展示价值，结尾加入 CTA 与二维码。',
      score: 0.76,
      metadata: {
        source: 'https://cdn.example.com/brand/video-launch-script',
        type: 'text'
      }
    }
  ]
};
