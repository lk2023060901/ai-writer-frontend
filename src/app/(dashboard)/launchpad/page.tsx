'use client';

import { useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import {
  Code,
  FileSearch,
  Folder,
  Languages,
  LayoutGrid,
  Notebook,
  Palette,
  Sparkle
} from 'lucide-react';

import Navbar from '@/features/chat/components/Navbar';
import { useLaunchpad } from '@/features/launchpad/hooks/useLaunchpad';
import { useTabs } from '@/shared/context/TabsContext';

interface AppCard {
  key: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  gradient: string;
  tabId: string;
  tabIcon: React.ReactNode;
}

export default function LaunchpadPage() {
  const router = useRouter();
  const { knowledgeBases, assistantGroups, files } = useLaunchpad();
  const { addTab } = useTabs();

  const handleNavigate = useCallback(
    (tab: { id: string; name: string; path: string; icon: React.ReactNode }) => {
      addTab({
        id: tab.id,
        name: tab.name,
        icon: tab.icon,
        path: tab.path,
        closable: true,
      });
      router.push(tab.path);
    },
    [addTab, router]
  );

  const appCards: AppCard[] = useMemo(() => {
    const assistantsCount = assistantGroups.reduce((total, group) => total + group.presets.length, 0);

    return [
      {
        key: 'apps',
        title: '小程序中心',
        description: '管理已安装的小程序，浏览工具生态。',
        path: '/apps',
        icon: <LayoutGrid size={28} className="icon" />,
        gradient: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
        tabId: 'apps',
        tabIcon: <LayoutGrid size={14} />
      },
      {
        key: 'knowledge',
        title: '知识库',
        description: `${knowledgeBases.length} 个知识空间，支持语义检索与分发。`,
        path: '/knowledge',
        icon: <FileSearch size={28} className="icon" />,
        gradient: 'linear-gradient(135deg, #10B981, #34D399)',
        tabId: 'knowledge',
        tabIcon: <FileSearch size={14} />
      },
      {
        key: 'assistants',
        title: '智能体',
        description: `${assistantsCount} 个智能体模版，支持导入与自定义。`,
        path: '/agents',
        icon: <Sparkle size={28} className="icon" />,
        gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
        tabId: 'agents',
        tabIcon: <Sparkle size={14} />
      },
      {
        key: 'paintings',
        title: '多模态绘制',
        description: '调用视觉模型生成插画、海报与品牌素材。',
        path: '/paintings',
        icon: <Palette size={28} className="icon" />,
        gradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
        tabId: 'paintings',
        tabIcon: <Palette size={14} />
      },
      {
        key: 'translate',
        title: '翻译工作台',
        description: '多语种翻译、润色与术语表管理。',
        path: '/translate',
        icon: <Languages size={28} className="icon" />,
        gradient: 'linear-gradient(135deg, #06B6D4, #0EA5E9)',
        tabId: 'translate',
        tabIcon: <Languages size={14} />
      },
      {
        key: 'files',
        title: '文件中心',
        description: `${files.length} 个文件已索引，支持批量管理。`,
        path: '/files',
        icon: <Folder size={28} className="icon" />,
        gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
        tabId: 'files',
        tabIcon: <Folder size={14} />
      },
      {
        key: 'code',
        title: '代码助手',
        description: '生成脚本、代码审查与命令行辅助。',
        path: '/code',
        icon: <Code size={28} className="icon" />,
        gradient: 'linear-gradient(135deg, #1F2937, #374151)',
        tabId: 'code',
        tabIcon: <Code size={14} />
      },
      {
        key: 'notes',
        title: '知识笔记',
        description: '整合灵感片段、会议纪要与行动项。',
        path: '/notes',
        icon: <Notebook size={28} className="icon" />,
        gradient: 'linear-gradient(135deg, #F97316, #FB923C)',
        tabId: 'notes',
        tabIcon: <Notebook size={14} />
      }
    ];
  }, [assistantGroups, files.length, knowledgeBases.length]);

  return (
    <PageContainer>
      <Navbar />
      <Container>
        <Content>
          <Section>
            <SectionHeader>
              <SectionTitle>工作区入口</SectionTitle>
              <SectionHint>快速进入知识、智能体、文件等核心模块，统一管理业务资产。</SectionHint>
            </SectionHeader>
            <Grid>
              {appCards.map((item) => (
                <AppCardContainer
                  key={item.key}
                  onClick={() =>
                    handleNavigate({
                      id: item.tabId,
                      name: item.title,
                      path: item.path,
                      icon: item.tabIcon,
                    })
                  }>
                  <IconWrapper $gradient={item.gradient}>{item.icon}</IconWrapper>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </AppCardContainer>
              ))}
            </Grid>
          </Section>

          <TipsSection>
            <TipsTitle>推荐操作</TipsTitle>
            <TipsGrid>
              <TipsCard
                onClick={() =>
                  handleNavigate({
                    id: 'knowledge',
                    name: '知识库',
                    path: '/knowledge',
                    icon: <FileSearch size={14} />,
                  })
                }>
                <CardBadge>24h 内更新</CardBadge>
                <TipsCardTitle>同步品牌知识库</TipsCardTitle>
                <TipsCardDescription>
                  上传最新的品牌手册与物料，启用知识识别后可在对话中直接引用。
                </TipsCardDescription>
              </TipsCard>
              <TipsCard
                onClick={() =>
                  handleNavigate({
                    id: 'agents',
                    name: '智能体',
                    path: '/agents',
                    icon: <Sparkle size={14} />,
                  })
                }>
                <CardBadge>团队共建</CardBadge>
                <TipsCardTitle>创建智能体模版</TipsCardTitle>
                <TipsCardDescription>
                  将日常 SOP、提示词沉淀为智能体，分享给团队成员复用。
                </TipsCardDescription>
              </TipsCard>
              <TipsCard
                onClick={() =>
                  handleNavigate({
                    id: 'files',
                    name: '文件中心',
                    path: '/files',
                    icon: <Folder size={14} />,
                  })
                }>
                <CardBadge>批量操作</CardBadge>
                <TipsCardTitle>整理文件资料</TipsCardTitle>
                <TipsCardDescription>
                  分类查看文档、图片与音视频，支持多选批量删除与重命名。
                </TipsCardDescription>
              </TipsCard>
            </TipsGrid>
          </TipsSection>
        </Content>
      </Container>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: var(--color-background);
`;

const Container = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  padding: 48px 0;
`;

const Content = styled.div`
  max-width: 960px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 0 24px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
`;

const SectionHint = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--color-text-2);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const AppCardContainer = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  border: none;
  border-radius: 18px;
  padding: 20px;
  background: var(--color-background-soft);
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: var(--color-text);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
  }
`;

const IconWrapper = styled.div<{ $gradient: string }>`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$gradient};
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.18);

  .icon {
    color: #fff;
  }
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--color-text-2);
  line-height: 1.5;
`;

const TipsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const TipsTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
`;

const TipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`;

const TipsCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  border: none;
  border-radius: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.07), rgba(17, 94, 89, 0.05));
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: var(--color-text);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
  }
`;

const CardBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.16);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 500;
`;

const TipsCardTitle = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
`;

const TipsCardDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--color-text-2);
  line-height: 1.5;
`;
