'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button, Divider, Input, Space, Switch, Tag, Tooltip } from 'antd';
import {
  GripVertical,
  SquareArrowOutUpRight,
  Bolt,
  ListCheck,
  Plus,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon
} from 'lucide-react';
import { LockOutlined, SearchOutlined } from '@ant-design/icons';

import {
  SettingContainer,
  SettingDescription,
  SettingHelpLink,
  SettingHelpText,
  SettingHelpTextRow,
  SettingSubtitle,
  SettingTitle
} from '../components/SettingElements';
import { CollapsibleSettingGroup } from './SettingGroup';

type ModelStatus = 'notChecked' | 'healthy';

type ProviderModel = {
  name: string;
  description: string;
  tags?: string[];
  status: ModelStatus;
};

type ProviderGroup = {
  name: string;
  defaultOpen?: boolean;
  models: ProviderModel[];
};

type ProviderInfo = {
  id: string;
  name: string;
  description: string;
  secureMode: string;
  enabled: boolean;
  website?: string;
  apiKeyUrl?: string;
  docsUrl?: string;
  modelsUrl?: string;
  apiHost: string;
  notice?: { title: string; description: string };
  supportsCustomHeaders?: boolean;
  supportsAnthropicHost?: boolean;
  supportsApiVersion?: boolean;
  anthropicHost?: string;
  apiVersion?: string;
  groups: ProviderGroup[];
};

const PROVIDERS: ProviderInfo[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: '官方 GPT-4o / o1 系列模型，支持多模态对话与函数调用。',
    secureMode: 'HTTPS + Bearer Token',
    enabled: true,
    website: 'https://platform.openai.com/',
    apiKeyUrl: 'https://platform.openai.com/account/api-keys',
    docsUrl: 'https://platform.openai.com/docs',
    modelsUrl: 'https://platform.openai.com/docs/models',
    apiHost: 'https://api.openai.com/v1',
    notice: {
      title: 'OpenAI 提醒',
      description: '请确认已在上方填写官方 API Key，否则无法调用模型。'
    },
    supportsCustomHeaders: true,
    groups: [
      {
        name: '已启用模型',
        defaultOpen: true,
        models: [
          {
            name: 'gpt-4o',
            description: '旗舰多模态模型，适合长文本与复杂工具调用。',
            tags: ['多模态', '函数调用'],
            status: 'healthy'
          },
          {
            name: 'gpt-4o-mini',
            description: '轻量版本，响应更快，适合自动化流程。',
            tags: ['快速'],
            status: 'healthy'
          }
        ]
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet / Haiku 提供优秀的对话与编码体验。',
    secureMode: 'HTTPS + API Key',
    enabled: false,
    website: 'https://www.anthropic.com/claude',
    apiKeyUrl: 'https://console.anthropic.com/account/keys',
    docsUrl: 'https://docs.anthropic.com/claude',
    modelsUrl: 'https://docs.anthropic.com/claude/docs/models-overview',
    apiHost: 'https://api.anthropic.com/v1',
    supportsCustomHeaders: true,
    supportsAnthropicHost: true,
    anthropicHost: '',
    groups: [
      {
        name: '已启用模型',
        defaultOpen: true,
        models: [
          {
            name: 'claude-3-5-sonnet',
            description: '旗舰模型，适合知识总结、长文写作与协作。',
            tags: ['对话', '写作'],
            status: 'notChecked'
          }
        ]
      }
    ]
  },
  {
    id: 'azure-openai',
    name: 'Azure OpenAI',
    description: '微软托管的 OpenAI 服务，适合企业合规部署。',
    secureMode: 'Azure AD / API Key',
    enabled: true,
    website: 'https://learn.microsoft.com/azure/ai-services/openai',
    docsUrl: 'https://learn.microsoft.com/azure/ai-services/openai/overview',
    modelsUrl: 'https://learn.microsoft.com/azure/ai-services/openai/concepts/models',
    apiHost: 'https://example-resource.openai.azure.com/openai',
    supportsCustomHeaders: true,
    supportsApiVersion: true,
    apiVersion: '2024-02-15-preview',
    groups: [
      {
        name: '已启用模型',
        defaultOpen: true,
        models: [
          {
            name: 'gpt-4o (deployment)',
            description: 'Azure 自定义部署的 GPT-4o 模型。',
            tags: ['自定义部署'],
            status: 'notChecked'
          }
        ]
      }
    ]
  }
];

const ProviderSettingsSection: React.FC = () => {
  const [providers, setProviders] = useState(PROVIDERS);
  const [searchValue, setSearchValue] = useState('');
  const [selectedId, setSelectedId] = useState(PROVIDERS[0].id);
  const [modelSearch, setModelSearch] = useState('');

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const filteredProviders = useMemo(() => {
    const keywords = searchValue.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!keywords.length) return providers;
    return providers.filter((provider) =>
      keywords.some(
        (keyword) =>
          provider.name.toLowerCase().includes(keyword) ||
          provider.groups.flatMap((g) => g.models).some((m) => m.name.toLowerCase().includes(keyword))
      )
    );
  }, [providers, searchValue]);

  const selectedProvider = useMemo(
    () => providers.find((p) => p.id === selectedId) ?? providers[0],
    [providers, selectedId]
  );

  useEffect(() => {
    const defaults: Record<string, boolean> = {};
    selectedProvider.groups.forEach((g) => (defaults[g.name] = g.defaultOpen ?? true));
    setExpandedGroups(defaults);
  }, [selectedProvider]);

  const groupsWithFilter = useMemo(() => {
    if (!modelSearch.trim()) return selectedProvider.groups;
    const keywords = modelSearch.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return selectedProvider.groups
      .map((group) => ({
        ...group,
        models: group.models.filter(
          (m) =>
            keywords.some((k) => m.name.toLowerCase().includes(k)) ||
            keywords.some((k) => m.description.toLowerCase().includes(k)) ||
            m.tags?.some((t) => keywords.some((k) => t.toLowerCase().includes(k)))
        )
      }))
      .filter((g) => g.models.length > 0);
  }, [modelSearch, selectedProvider]);

  const modelCount = groupsWithFilter.reduce((sum, g) => sum + g.models.length, 0);

  // Preview helpers to mimic Cherry Studio URL preview behaviour
  const buildHostPreview = (host: string) => {
    if (!host || !host.trim()) return '—';
    const trimmed = host.trim().replace(/\/$/, '');
    return trimmed.endsWith('/messages') ? trimmed : `${trimmed}/messages`;
  };

  const buildAnthropicPreview = (host: string) => {
    if (!host || !host.trim()) return '—';
    const trimmed = host.trim().replace(/\/$/, '');
    return `${trimmed}/messages`;
  };

  return (
    <Layout>
      <Sidebar>
        <Input
          allowClear
          value={searchValue}
          prefix={<SearchOutlined style={{ color: 'var(--color-icon)' }} />}
          placeholder="搜索模型平台..."
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <ProviderList>
          {filteredProviders.map((provider) => (
            <ProviderItem
              key={provider.id}
              $active={provider.id === selectedProvider.id}
              onClick={() => setSelectedId(provider.id)}>
              <Dragger>
                <GripVertical size={12} strokeWidth={1.4} />
              </Dragger>
              <ProviderName>{provider.name}</ProviderName>
              <Tag color={provider.enabled ? 'green' : 'default'}>{provider.enabled ? 'ON' : 'OFF'}</Tag>
            </ProviderItem>
          ))}
        </ProviderList>
        {null}
      </Sidebar>

      <DetailArea>
        <SettingContainer style={{ background: 'var(--color-background)', padding: 0 }}>
          <DetailHeader>
            <SettingTitle>
              <Space align="center" size={8} wrap>
                <ProviderHeading>{selectedProvider.name}</ProviderHeading>
                {selectedProvider.website && (
                  <Tooltip title="访问官网" mouseEnterDelay={0.5}>
                    <Button
                      size="small"
                      type="text"
                      icon={<SquareArrowOutUpRight size={14} />}
                      href={selectedProvider.website}
                      target="_blank"
                    />
                  </Tooltip>
                )}
              </Space>
              <Switch
                checked={selectedProvider.enabled}
                onChange={(checked) =>
                  setProviders((prev) => prev.map((p) => (p.id === selectedProvider.id ? { ...p, enabled: checked } : p)))
                }
              />
            </SettingTitle>
          </DetailHeader>

          <Divider style={{ margin: '10px 0' }} />

          <DetailContent>

            <CollapsibleSettingGroup title="API 密钥">
              <Space.Compact style={{ width: '100%', marginTop: 6 }}>
                <Input.Password
                  placeholder="API 密钥"
                  iconRender={() => <LockOutlined style={{ color: 'var(--color-icon)', fontSize: 12 }} />}
                />
                <Button type="primary">检测</Button>
              </Space.Compact>
              <SettingHelpTextRow style={{ justifyContent: 'space-between' }}>
                {selectedProvider.apiKeyUrl ? (
                  <SettingHelpLink href={selectedProvider.apiKeyUrl} target="_blank">点击这里获取密钥</SettingHelpLink>
                ) : (
                  <span />
                )}
                <SettingHelpText>多个密钥使用逗号或空格分隔</SettingHelpText>
              </SettingHelpTextRow>
            </CollapsibleSettingGroup>

            <CollapsibleSettingGroup title="API 地址">
              <Input style={{ marginTop: 8 }} defaultValue={selectedProvider.apiHost} />
              <SettingHelpText style={{ marginTop: 6 }}>预览：{buildHostPreview(selectedProvider.apiHost)}</SettingHelpText>
              <SettingHelpText style={{ marginTop: 6 }}>/ 结尾忽略 v1 版本，# 结尾强制使用输入地址</SettingHelpText>
            </CollapsibleSettingGroup>

            {/* 统一布局：移除其它服务商的额外专属区块，保持与 OpenAI 一致 */}

            <SettingSubtitle style={{ marginBottom: 5 }}>
              <Space align="center" size={8} wrap>
                <span>模型</span>
                {modelCount > 0 && <Tag color="#8c8c8c">{modelCount}</Tag>}
                <Input
                  allowClear
                  size="small"
                  prefix={<SearchOutlined style={{ color: 'var(--color-icon)', fontSize: 12 }} />}
                  placeholder="搜索模型"
                  style={{ width: 220 }}
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                />
              </Space>
              <Button type="text" icon={<Bolt size={16} />}>检测</Button>
            </SettingSubtitle>

            {groupsWithFilter.length > 0 ? (
              <ModelGroupList>
                {groupsWithFilter.map((group) => {
                  const expanded = expandedGroups[group.name] ?? true;
                  return (
                    <ModelGroup key={group.name}>
                      <GroupHeader onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.name]: !expanded }))}>
                        <Space align="center" size={6}>
                          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span>{group.name}</span>
                        </Space>
                        <Tag color="default">{group.models.length}</Tag>
                      </GroupHeader>
                      {expanded && (
                        <ModelItems>
                          {group.models.map((model) => (
                            <ModelCard key={model.name}>
                              <div>
                                <span>{model.name}</span>
                                <ModelDescription>{model.description}</ModelDescription>
                                {model.tags && model.tags.length > 0 && (
                                  <Space size={6} wrap style={{ marginTop: 4 }}>
                                    {model.tags.map((tag) => (
                                      <Tag key={tag} color="blue" style={{ borderRadius: 12 }}>
                                        {tag}
                                      </Tag>
                                    ))}
                                  </Space>
                                )}
                              </div>
                              <ModelActions>
                                {model.status === 'healthy' ? (
                                  <Tag color="green">健康</Tag>
                                ) : (
                                  <Tag color="default">未检查</Tag>
                                )}
                                <Button type="text" size="small">编辑</Button>
                                <Button type="text" size="small">删除</Button>
                              </ModelActions>
                            </ModelCard>
                          ))}
                        </ModelItems>
                      )}
                    </ModelGroup>
                  );
                })}
              </ModelGroupList>
            ) : (
              <EmptyHint>未找到符合条件的模型。</EmptyHint>
            )}

            {(selectedProvider.docsUrl || selectedProvider.modelsUrl) && (
              <SettingHelpTextRow style={{ marginTop: 12 }}>
                <SettingHelpText>查看</SettingHelpText>
                {selectedProvider.docsUrl && (
                  <SettingHelpLink href={selectedProvider.docsUrl} target="_blank">
                    {selectedProvider.name} 文档
                  </SettingHelpLink>
                )}
                {selectedProvider.docsUrl && selectedProvider.modelsUrl && (
                  <SettingHelpText>和</SettingHelpText>
                )}
                {selectedProvider.modelsUrl && (
                  <SettingHelpLink href={selectedProvider.modelsUrl} target="_blank">模型</SettingHelpLink>
                )}
                <SettingHelpText>获取更多详情</SettingHelpText>
              </SettingHelpTextRow>
            )}

            <Space size={12} style={{ marginTop: 12 }}>
              <Button icon={<ListCheck size={16} />} type="primary">管理</Button>
              <Button icon={<Plus size={16} />}>添加</Button>
            </Space>
          </DetailContent>
        </SettingContainer>
      </DetailArea>
    </Layout>
  );
};

const Layout = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  background: var(--color-background);
`;

const Sidebar = styled.div`
  width: 280px;
  border-right: 0.5px solid var(--color-border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProviderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
`;

const ProviderItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--list-item-border-radius);
  border: 0.5px solid ${({ $active }) => ($active ? 'var(--color-border)' : 'transparent')};
  background: ${({ $active }) => ($active ? 'var(--color-background-soft)' : 'transparent')};
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--color-background-soft);
  }
`;

const Dragger = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  color: var(--color-text-3);
`;

const ProviderName = styled.span`
  flex: 1;
  text-align: left;
  font-size: 13px;
`;

const DetailArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.div`
  padding: 18px 20px 0;
`;

const DetailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px 24px;
`;

const Block = styled.div`
  border: 0.5px solid var(--color-border);
  border-radius: var(--list-item-border-radius);
  padding: 14px;
  background: var(--color-background);
`;

const ProviderHeading = styled.span`
  font-size: 15px;
  font-weight: 600;
`;

const ModelGroupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;

const ModelGroup = styled.div`
  border: 0.5px solid var(--color-border);
  border-radius: var(--list-item-border-radius);
  padding: 10px 12px;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const ModelItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModelCard = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 0.5px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
`;

const ModelDescription = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--color-text-3);
`;

const ModelActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmptyHint = styled.div`
  padding: 24px;
  text-align: center;
  color: var(--color-text-3);
  font-size: 12px;
`;

export default ProviderSettingsSection;
