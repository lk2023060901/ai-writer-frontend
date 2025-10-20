import { FileEntry } from '@/types/launchpad';

const formatSize = (size: number): string => {
  if (size >= 1_048_576) {
    return `${(size / 1_048_576).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${size} B`;
};

const baseFiles: FileEntry[] = [
  {
    id: 'file-1',
    name: '产品白皮书.pdf',
    category: 'document',
    extension: '.pdf',
    size: 1_890_000,
    formattedSize: formatSize(1_890_000),
    usageCount: 86,
    createdAt: '2024-03-12 09:24',
    updatedAt: '2024-05-28 11:12',
    owner: 'Mia'
  },
  {
    id: 'file-2',
    name: '品牌视觉集锦.ai',
    category: 'image',
    extension: '.ai',
    size: 3_240_000,
    formattedSize: formatSize(3_240_000),
    usageCount: 24,
    createdAt: '2024-02-20 15:41',
    updatedAt: '2024-05-19 09:05',
    owner: 'Leo'
  },
  {
    id: 'file-3',
    name: '客服培训录音.mp3',
    category: 'audio',
    extension: '.mp3',
    size: 12_480_000,
    formattedSize: formatSize(12_480_000),
    usageCount: 12,
    createdAt: '2024-04-01 08:12',
    updatedAt: '2024-04-07 13:52',
    owner: 'Joy'
  },
  {
    id: 'file-4',
    name: '发布会演示稿.key',
    category: 'document',
    extension: '.key',
    size: 4_580_000,
    formattedSize: formatSize(4_580_000),
    usageCount: 48,
    createdAt: '2024-03-29 10:15',
    updatedAt: '2024-05-31 16:26',
    owner: 'Aria'
  },
  {
    id: 'file-5',
    name: '操作指南视频.mp4',
    category: 'video',
    extension: '.mp4',
    size: 56_900_000,
    formattedSize: formatSize(56_900_000),
    usageCount: 37,
    createdAt: '2024-03-07 18:30',
    updatedAt: '2024-06-01 09:18',
    owner: 'Mia'
  },
  {
    id: 'file-6',
    name: '实验数据归档.zip',
    category: 'archive',
    extension: '.zip',
    size: 8_420_000,
    formattedSize: formatSize(8_420_000),
    usageCount: 6,
    createdAt: '2024-04-11 14:20',
    updatedAt: '2024-05-08 21:02',
    owner: 'Evan'
  },
  {
    id: 'file-7',
    name: 'Logo 变体.svg',
    category: 'image',
    extension: '.svg',
    size: 420_000,
    formattedSize: formatSize(420_000),
    usageCount: 63,
    createdAt: '2024-02-08 10:12',
    updatedAt: '2024-05-02 18:10',
    owner: 'Ivy'
  }
];

export const createInitialFiles = (): FileEntry[] => baseFiles;
