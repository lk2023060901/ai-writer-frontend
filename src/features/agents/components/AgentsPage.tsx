'use client';

import { useMemo, useState, type ReactNode } from 'react';
import styled from 'styled-components';
import { Button, Dropdown, Empty, Form, Input, Modal, Popover, Space, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { ImportOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Bot, Ellipsis, Library, Sparkle, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';

import Scrollbar from '@/shared/ui/Scrollbar';
import ListItem from '@/shared/ui/ListItem';
import CustomTag from '@/shared/ui/tags/CustomTag';
import { useLaunchpad } from '@/features/launchpad/hooks/useLaunchpad';
import type { AssistantGroup, AssistantPreset } from '@/types/launchpad';
import ImportAgentsModal from './ImportAgentsModal';

const SOURCE_LABEL: Record<AssistantPreset['source'], string> = {
  custom: '我的',
  community: '精选',
  system: '系统推荐'
};

const GROUP_ICON = {
  '我的': <Bot size={16} />,
  '精选': <Star size={16} />,
  '系统推荐': <Sparkle size={16} />,
} as Record<string, ReactNode>;

const getLeadingEmoji = (text: string) => {
  const emojiRegex = /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/u;
  const match = text.match(emojiRegex);
  return match ? match[0] : '';
};

const estimateTokens = (text: string) => Math.max(0, Math.ceil(text.trim().length / 4));
const EmojiPicker = dynamic(() => import('@/shared/ui/emoji/EmojiPicker').then((mod) => mod.default), {
  ssr: false
});

const AgentsPage: React.FC = () => {
  const { assistantGroups, addAssistantPreset } = useLaunchpad();
  const [searchValue, setSearchValue] = useState('');
  const [activeGroupId, setActiveGroupId] = useState(assistantGroups[0]?.id ?? '');
  const [isAddOpen, setAddOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [tokenCount, setTokenCount] = useState(0);

  const groupsWithFallback = useMemo<AssistantGroup[]>(
    () => assistantGroups ?? [],
    [assistantGroups]
  );

  const activeGroup = useMemo(() => {
    if (searchValue.trim()) return undefined;
    return groupsWithFallback.find((group) => group.id === activeGroupId) ?? groupsWithFallback[0];
  }, [activeGroupId, groupsWithFallback, searchValue]);

  const allPresets = useMemo(
    () => groupsWithFallback.flatMap((group) => group.presets),
    [groupsWithFallback]
  );

  const presetsToRender = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return activeGroup ? activeGroup.presets : [];
    }
    return allPresets.filter((preset) => {
      const fields = [preset.name, preset.description ?? '', ...preset.tags];
      return fields.some((field) => field.toLowerCase().includes(keyword));
    });
  }, [activeGroup, allPresets, searchValue]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleCreatePreset = () => {
    setSelectedEmoji('');
    setTokenCount(0);
    addForm.resetFields();
    setAddOpen(true);
  };

  const handleImportPreset = () => {
    setImportOpen(true);
  };

  const handleImportClose = () => {
    setImportOpen(false);
  };

  const handlePreviewPreset = (preset: AssistantPreset) => {
    Modal.confirm({
      title: preset.name,
      centered: true,
      width: 560,
      icon: <Sparkle size={18} color="var(--color-primary)" />,
      okText: '添加到我的助手',
      cancelText: '取消',
      content: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {preset.description && <p style={{ margin: 0 }}>{preset.description}</p>}
          {preset.tags.length > 0 && (
            <Space size={[6, 6]} wrap>
              {preset.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          )}
          {preset.prompt && (
            <PromptBox className="markdown">
              <ReactMarkdown>{preset.prompt}</ReactMarkdown>
            </PromptBox>
          )}
        </Space>
      ),
      onOk: () => {
        addAssistantPreset({
          name: `${preset.name}（副本）`,
          description: preset.description,
          category: preset.category,
          tags: preset.tags,
          model: preset.model,
          prompt: preset.prompt
        });
      }
    });
  };

  const buildCardMenu = (preset: AssistantPreset): MenuProps['items'] => [
    {
      key: 'duplicate',
      label: '添加到我的助手',
      onClick: ({ domEvent }) => {
        domEvent?.stopPropagation();
        addAssistantPreset({
          name: `${preset.name}（副本）`,
          description: preset.description,
          category: preset.category,
          tags: preset.tags,
          model: preset.model,
          prompt: preset.prompt
        });
      }
    },
    {
      key: 'preview',
      label: '查看详情',
      onClick: ({ domEvent }) => {
        domEvent?.stopPropagation();
        handlePreviewPreset(preset);
      }
    }
  ];

  return (
    <>
      <Container>
      <Sidebar>
        <SidebarList>
          {groupsWithFallback.map((group) => {
            const isActive = !searchValue.trim() && activeGroupId === group.id;
            return (
              <ListItem
                key={group.id}
                $active={isActive}
                onClick={() => {
                  setActiveGroupId(group.id);
                  setSearchValue('');
                }}
                title={
                  <SidebarItemContent>
                    <SidebarIcon>{GROUP_ICON[group.name] ?? <Library size={16} />}</SidebarIcon>
                    <SidebarName>{group.name}</SidebarName>
                    <CustomTag color="#A0A0A0" size={9}>
                      {group.presets.length}
                    </CustomTag>
                  </SidebarItemContent>
                }
              />
            );
          })}
        </SidebarList>
      </Sidebar>

      <ContentArea>
        <ContentHeader>
          <HeaderTitle>
            <Bot size={18} />
            <span>{searchValue.trim() ? '搜索结果' : activeGroup?.name ?? '智能体'}</span>
            <CustomTag color="#A0A0A0" size={10}>
              {presetsToRender.length}
            </CustomTag>
          </HeaderTitle>
          <HeaderActions>
            <Input
              allowClear
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="搜索名称、能力或标签"
              prefix={<SearchOutlined />}
              style={{ width: 260 }}
            />
            <Button type="text" icon={<ImportOutlined />} onClick={handleImportPreset}>
              导入模版
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePreset}>
              新建智能体
            </Button>
          </HeaderActions>
        </ContentHeader>

        <CardGrid>
          {presetsToRender.length > 0 ? (
            presetsToRender.map((preset) => {
              const emoji = getLeadingEmoji(preset.name);
              const displayName = emoji ? preset.name.replace(emoji, '').trim() : preset.name;
              const summaryRaw = (preset.description || preset.prompt || '').replace(/\s+/g, ' ').trim();
              const summary = summaryRaw ? summaryRaw.slice(0, 160) : '尚未填写简介';
              const sourceLabel = SOURCE_LABEL[preset.source] ?? preset.source;
              const isCustom = preset.source === 'custom';

              return (
                <PresetCard key={preset.id} onClick={() => handlePreviewPreset(preset)}>
                  <CardBackground>{emoji || '🤖'}</CardBackground>
                  <CardBody>
                    <CardHeader>
                      <HeaderInfo>
                        <CardTitle>{displayName}</CardTitle>
                        <GroupTagRow>
                          <CustomTag color="#A0A0A0" size={10}>
                            {sourceLabel}
                          </CustomTag>
                          {preset.category && (
                            <CustomTag color="#A0A0A0" size={10}>
                              {preset.category}
                            </CustomTag>
                          )}
                        </GroupTagRow>
                      </HeaderInfo>
                      <CardActions $hasMenu={isCustom}>
                        <ActionEmoji data-menu={isCustom ? 'menu' : undefined}>{emoji || '🤖'}</ActionEmoji>
                        {isCustom && (
                          <Dropdown menu={{ items: buildCardMenu(preset) }} trigger={['click']}>
                            <MenuButton
                              type="text"
                              shape="circle"
                              icon={<Ellipsis size={16} />}
                              onClick={(event) => event.stopPropagation()}
                            />
                          </Dropdown>
                        )}
                      </CardActions>
                    </CardHeader>
                    <CardPrompt>{summary}</CardPrompt>
                    <CardFooter>
                      <CustomTag color="#6366F1" size={10}>
                        {preset.model}
                      </CustomTag>
                      {preset.tags.map((tag) => (
                        <CustomTag key={tag} color="#A0A0A0" size={10}>
                          {tag}
                        </CustomTag>
                      ))}
                    </CardFooter>
                  </CardBody>
                </PresetCard>
              );
            })
          ) : (
            <EmptyHolder>
              <Empty description={searchValue.trim() ? '未找到匹配的智能体' : '当前分组暂无智能体'} />
            </EmptyHolder>
          )}
        </CardGrid>
      </ContentArea>
    </Container>

      <ImportAgentsModal open={isImportOpen} onClose={handleImportClose} />

      <Modal
        title="创建智能体模版"
        open={isAddOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => addForm.submit()}
        okText="创建"
        cancelText="取消"
        width={520}
        centered>
        <Form
          form={addForm}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if (changedValues.prompt !== undefined) {
              setTokenCount(estimateTokens(changedValues.prompt || ''));
            }
          }}
          onFinish={(values: { name: string; prompt: string }) => {
            const name = values.name?.trim();
            const prompt = values.prompt?.trim();
            if (!name || !prompt) {
              return;
            }
            const emoji = selectedEmoji || getLeadingEmoji(name);
            addAssistantPreset({
              id: crypto.randomUUID(),
              name,
              description: prompt,
              category: '自定义',
              tags: [],
              model: 'gpt-4o-mini',
              prompt,
              source: 'custom',
              emoji
            });
            setAddOpen(false);
          }}>
          <Form.Item label="Emoji">
            <Popover
              trigger="click"
              arrow
              content={
                <EmojiPicker
                  onEmojiClick={(emoji) => {
                    setSelectedEmoji(emoji);
                  }}
                />
              }>
              <Button>{selectedEmoji ? <span style={{ fontSize: 20 }}>{selectedEmoji}</span> : '选择 Emoji'}</Button>
            </Popover>
          </Form.Item>
          <Form.Item
            name="name"
            label="智能体名称"
            rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="输入智能体名称" allowClear spellCheck={false} />
          </Form.Item>
          <Form.Item
            name="prompt"
            label="提示词"
            rules={[{ required: true, message: '请输入提示词' }]}>
            <Input.TextArea rows={8} placeholder="描述智能体能力或提示词" spellCheck={false} />
          </Form.Item>
          <TokenCounter>Tokens 约 {tokenCount}</TokenCounter>
        </Form>
      </Modal>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex: 1;
  height: calc(100vh - var(--navbar-height));
  background: var(--color-background);
`;

const Sidebar = styled.div`
  width: 220px;
  border-right: 0.5px solid var(--color-border);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SidebarList = styled(Scrollbar)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SidebarItemContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const SidebarIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.18);
`;

const SidebarName = styled.span`
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 12px;
  border-bottom: 0.5px solid var(--color-border);
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
`;

const HeaderActions = styled(Space)`
  align-items: center;
`;

const CardGrid = styled.div`
  flex: 1;
  padding: 8px 16px 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 160px;
  gap: 16px;
  overflow: auto;
`;

const MenuButton = styled(Button)`
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  border: none;
  background: transparent;
  padding: 0;
`;

const ActionEmoji = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transition: opacity 0.2s ease;
`;

const CardActions = styled.div<{ $hasMenu: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 8px;

  ${MenuButton} {
    opacity: 0;
  }
`;

const PresetCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: var(--list-item-border-radius);
  background: var(--color-background);
  border: 0.5px solid var(--color-border);
  box-shadow:
    0 5px 7px -3px var(--color-border-soft),
    0 2px 3px -4px var(--color-border-soft);
  height: 100%;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 10px 15px -3px var(--color-border-soft),
      0 4px 6px -4px var(--color-border-soft);
  }

  &:hover ${MenuButton} {
    opacity: 1;
    pointer-events: auto;
  }

  &:hover ${ActionEmoji}[data-menu='menu'] {
    opacity: 0;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
`;

const GroupTagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
`;

const CardBody = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  z-index: 1;
`;

const CardBackground = styled.div`
  position: absolute;
  top: -20px;
  right: -40px;
  font-size: 160px;
  opacity: 0.12;
  filter: blur(16px);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardPrompt = styled.div`
  font-size: 13px;
  color: var(--color-text-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const EmptyHolder = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
`;

const PromptBox = styled.div`
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px;
  background: var(--color-background-soft);

  p {
    margin: 0 0 8px;
    font-size: 13px;
    color: var(--color-text-2);
  }

  code {
    background: rgba(148, 163, 184, 0.18);
    padding: 2px 4px;
    border-radius: 4px;
  }
`;

const TokenCounter = styled.div`
  margin-top: -6px;
  color: var(--color-text-3);
  font-size: 12px;
  text-align: right;
`;

export default AgentsPage;
