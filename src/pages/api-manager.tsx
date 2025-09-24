/**
 * API 密钥管理界面
 * 基于 React 18 + Ant Design + TailwindCSS + Next.js 构建
 * 深色主题的企业级应用界面
 */

import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Layout, Input, Button, Space, Typography, Tooltip } from 'antd';
import DraggableServiceCard from '../components/api-manager/DraggableServiceCard';
import {
  SearchOutlined,
  SettingOutlined,
  MinusOutlined,
  FireOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckOutlined,
  PlusOutlined,
  UserOutlined,
  CreditCardOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Head from 'next/head';
import styled from 'styled-components';

const { Header, Sider, Content } = Layout;
const { Search } = Input;
const { Text, Title } = Typography;

// 主题配置
const theme = {
  colors: {
    primary: '#1a1a1a',
    secondary: '#2a2a2a',
    tertiary: '#3a3a3a',
    accent: '#6366f1',
    success: '#10b981',
    text: {
      primary: '#ffffff',
      secondary: '#888888',
      muted: '#666666',
    },
    border: '#404040',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};

// 样式组件
const AppContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.primary};
  color: ${theme.colors.text.primary};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const MacOSControls = styled.div`
  height: 32px;
  background: ${theme.colors.secondary};
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid ${theme.colors.border};

  .control-buttons {
    display: flex;
    gap: 8px;

    .control-btn {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;

      &.red { background: #ff5f57; }
      &.yellow { background: #ffbd2e; }
      &.green { background: #28ca42; }

      &:hover {
        filter: brightness(1.2);
      }
    }
  }
`;

const StyledSider = styled(Sider)`
  background: ${theme.colors.secondary} !important;
  border-right: 1px solid ${theme.colors.border};

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .menu-item {
    padding: 12px 20px;
    margin: 2px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 12px;
    color: ${theme.colors.text.secondary};

    &:hover {
      background: ${theme.colors.tertiary};
      color: ${theme.colors.text.primary};
    }

    &.active {
      background: ${theme.colors.accent};
      color: white;
    }

    .anticon {
      font-size: 16px;
    }
  }

  .add-button {
    margin: 16px;
    margin-top: auto;
    background: ${theme.colors.accent};
    border: none;
    color: white;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:hover {
      background: #5856eb;
    }
  }
`;

const MainContent = styled.div`
  background: ${theme.colors.primary};
  padding: 24px;
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SearchBar = styled(Search)`
  .ant-input {
    background: ${theme.colors.secondary};
    border: 1px solid ${theme.colors.border};
    color: ${theme.colors.text.primary};

    &::placeholder {
      color: ${theme.colors.text.muted};
    }

    &:focus, &:hover {
      border-color: ${theme.colors.accent};
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }
  }

  .ant-input-search-button {
    background: ${theme.colors.accent};
    border: none;

    &:hover {
      background: #5856eb;
    }
  }
`;

const ServicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;

  .services-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .services-title {
      color: ${theme.colors.text.primary};
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;

      .services-count {
        background: ${theme.colors.accent};
        color: white;
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
      }
    }

    .sort-hint {
      color: ${theme.colors.text.muted};
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;

      .drag-icon {
        color: ${theme.colors.text.secondary};
      }
    }
  }
`;

const DetailPanel = styled.div`
  background: ${theme.colors.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  margin-left: 24px;
  min-width: 400px;
  max-width: 500px;

  .section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      color: ${theme.colors.text.primary};
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .ant-input, .ant-input-password {
      background: ${theme.colors.tertiary};
      border: 1px solid ${theme.colors.border};
      color: ${theme.colors.text.primary};

      &::placeholder {
        color: ${theme.colors.text.muted};
      }

      &:focus, &:hover {
        border-color: ${theme.colors.accent};
      }
    }

    .help-text {
      color: ${theme.colors.text.muted};
      font-size: 12px;
      margin-top: 8px;
    }

    .link-text {
      color: ${theme.colors.accent};
      cursor: pointer;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const ModelCard = styled.div`
  background: ${theme.colors.tertiary};
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.accent};
  }

  .model-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .model-avatar {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .model-name {
      color: ${theme.colors.text.primary};
      font-weight: 500;
    }
  }

  .model-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .action-btn {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 6px;
      background: ${theme.colors.border};
      color: ${theme.colors.text.secondary};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: ${theme.colors.accent};
        color: white;
      }

      &.hot {
        color: #ff6b35;

        &:hover {
          background: #ff6b35;
          color: white;
        }
      }

      &.danger {
        &:hover {
          background: #ef4444;
          color: white;
        }
      }
    }
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .user-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .user-info {
      text-align: right;

      .user-text {
        color: ${theme.colors.text.secondary};
        font-size: 14px;
      }
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
  }
`;

// 类型定义
interface ApiService {
  id: string;
  name: string;
  logo: string;
  enabled: boolean;
  apiKey?: string;
  apiUrl?: string;
  models: ApiModel[];
}

interface ApiModel {
  id: string;
  name: string;
  logo: string;
  isHot?: boolean;
  enabled: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// 菜单项配置
const menuItems: MenuItem[] = [
  { id: 'model-service', label: '模型服务', icon: <SettingOutlined /> },
  { id: 'default-model', label: '默认模型', icon: <UserOutlined /> },
  { id: 'general-settings', label: '常规设置', icon: <SettingOutlined /> },
  { id: 'display-settings', label: '显示设置', icon: <EyeOutlined /> },
  { id: 'data-settings', label: '数据设置', icon: <FileTextOutlined /> },
  { id: 'mcp', label: 'MCP', icon: <SettingOutlined /> },
  { id: 'notes', label: '笔记', icon: <FileTextOutlined /> },
  { id: 'web-search', label: '网络搜索', icon: <SearchOutlined /> },
  { id: 'global-memory', label: '全局记忆', icon: <UserOutlined /> },
  { id: 'document-processing', label: '文档处理', icon: <FileTextOutlined /> },
  { id: 'quick-phrases', label: '快捷短语', icon: <SettingOutlined /> },
  { id: 'shortcuts', label: '快捷键', icon: <SettingOutlined /> },
  { id: 'quick-assistant', label: '快捷助手', icon: <UserOutlined /> },
  { id: 'word-assistant', label: '划词助手', icon: <SettingOutlined /> },
  { id: 'about', label: '关于我们', icon: <UserOutlined /> },
];

// 初始数据
const initialServices: ApiService[] = [
  {
    id: 'siliconflow',
    name: '硅基流动',
    logo: 'SF',
    enabled: true,
    models: [
      { id: 'qwen-turbo', name: 'Qwen-Turbo', logo: 'QT', isHot: true, enabled: true },
      { id: 'qwen-plus', name: 'Qwen-Plus', logo: 'QP', enabled: true },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: 'OAI',
    enabled: false,
    models: [
      { id: 'gpt-4', name: 'GPT-4', logo: 'G4', isHot: true, enabled: true },
      { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', logo: 'G3', enabled: true },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: 'ANT',
    enabled: true,
    models: [
      { id: 'claude-3', name: 'Claude 3 Sonnet', logo: 'C3', isHot: true, enabled: true },
      { id: 'claude-instant', name: 'Claude Instant', logo: 'CI', enabled: false },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    logo: 'GEM',
    enabled: false,
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', logo: 'GP', enabled: true },
      { id: 'gemini-ultra', name: 'Gemini Ultra', logo: 'GU', isHot: true, enabled: false },
    ],
  },
];

const ApiManagerPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('model-service');
  const [services, setServices] = useState<ApiService[]>(initialServices);
  const [selectedService, setSelectedService] = useState<ApiService | null>(services[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');

  // 拖拽排序处理
  const moveService = useCallback((dragIndex: number, hoverIndex: number) => {
    setServices(prev => {
      const newServices = [...prev];
      const draggedItem = newServices[dragIndex];
      newServices.splice(dragIndex, 1);
      newServices.splice(hoverIndex, 0, draggedItem);
      return newServices;
    });
  }, []);

  const handleServiceToggle = useCallback((serviceId: string, enabled: boolean) => {
    setServices(prev => prev.map(service =>
      service.id === serviceId ? { ...service, enabled } : service
    ));
  }, []);

  const handleServiceSelect = useCallback((service: ApiService) => {
    setSelectedService(service);
    setApiKey(service.apiKey || '');
    setApiUrl(service.apiUrl || '');
  }, []);

  const handleApiKeyDetect = useCallback(() => {
    // TODO: 实现 API 密钥检测逻辑
    console.log('检测 API 密钥:', apiKey);
  }, [apiKey]);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Head>
        <title>API 密钥管理 - 企业级AI模型管理平台</title>
        <meta name="description" content="专业的API密钥管理界面，支持多种AI服务商" />
      </Head>

      <AppContainer>
        {/* macOS 风格控制栏 */}
        <MacOSControls>
          <div className="control-buttons">
            <div className="control-btn red" />
            <div className="control-btn yellow" />
            <div className="control-btn green" />
          </div>
        </MacOSControls>

        <Layout style={{ background: theme.colors.primary, minHeight: 'calc(100vh - 32px)' }}>
          {/* 左侧边栏 */}
          <StyledSider width={240} collapsible={false}>
            <div style={{ padding: '16px 0' }}>
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <Button className="add-button" icon={<PlusOutlined />}>
              添加
            </Button>
          </StyledSider>

          <Layout>
            <Content>
              <MainContent>
                {activeMenu === 'model-service' && (
                  <div style={{ display: 'flex', height: '100%' }}>
                    {/* 主内容区 */}
                    <div style={{ flex: 1 }}>
                      {/* 顶部区域 */}
                      <TopBar>
                        <SearchBar
                          placeholder="搜索模型平台..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ maxWidth: 400 }}
                        />

                        <div className="user-section">
                          <Space>
                            <Button
                              type="primary"
                              icon={<CreditCardOutlined />}
                              style={{ background: theme.colors.accent, border: 'none' }}
                            >
                              余额充值
                            </Button>
                            <Button
                              icon={<FileTextOutlined />}
                              style={{
                                background: theme.colors.secondary,
                                border: `1px solid ${theme.colors.border}`,
                                color: theme.colors.text.primary
                              }}
                            >
                              费用账单
                            </Button>
                          </Space>

                          <div className="user-info">
                            <div className="user-text">管理员用户</div>
                          </div>

                          <div className="user-avatar">
                            <UserOutlined />
                          </div>
                        </div>
                      </TopBar>

                      {/* API 服务商列表 */}
                      <ServicesContainer>
                        <div className="services-header">
                          <div className="services-title">
                            API 服务商
                            <span className="services-count">{filteredServices.length}</span>
                          </div>
                          <div className="sort-hint">
                            <span className="drag-icon">⋮⋮</span>
                            拖拽排序
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {filteredServices.map((service, index) => (
                            <DraggableServiceCard
                              key={service.id}
                              service={service}
                              index={index}
                              isSelected={selectedService?.id === service.id}
                              onSelect={handleServiceSelect}
                              onToggle={handleServiceToggle}
                              onMove={moveService}
                            />
                          ))}
                        </div>
                      </ServicesContainer>
                    </div>

                    {/* 右侧详情面板 */}
                    {selectedService && (
                      <DetailPanel>
                        {/* API 密钥部分 */}
                        <div className="section">
                          <div className="section-title">API 密钥</div>
                          <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Input.Password
                              placeholder="请输入 API 密钥"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              visibilityToggle={{
                                visible: showApiKey,
                                onVisibleChange: setShowApiKey,
                              }}
                            />
                            <div>
                              <a className="link-text" href="#" onClick={(e) => e.preventDefault()}>
                                点击这里获取密钥
                              </a>
                            </div>
                            <Button
                              type="primary"
                              icon={<CheckOutlined />}
                              onClick={handleApiKeyDetect}
                              style={{ background: theme.colors.success, border: 'none' }}
                            >
                              检测
                            </Button>
                          </Space>
                        </div>

                        {/* API 地址部分 */}
                        <div className="section">
                          <div className="section-title">API 地址</div>
                          <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <Input
                              placeholder="https://api.example.com/v1"
                              value={apiUrl}
                              onChange={(e) => setApiUrl(e.target.value)}
                            />
                            <div className="help-text">
                              自定义 API 端点地址，留空使用默认地址
                            </div>
                          </Space>
                        </div>

                        {/* 模型列表部分 */}
                        <div className="section">
                          <div className="section-title">模型</div>
                          <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Search
                              placeholder="搜索模型..."
                              style={{ marginBottom: 16 }}
                            />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {selectedService.models.map((model) => (
                                <ModelCard key={model.id}>
                                  <div className="model-info">
                                    <div className="model-avatar">
                                      {model.logo}
                                    </div>
                                    <div className="model-name">
                                      {model.name}
                                    </div>
                                  </div>

                                  <div className="model-actions">
                                    <Button size="small" className="action-btn">
                                      输入
                                    </Button>
                                    {model.isHot && (
                                      <Tooltip title="热门模型">
                                        <div className="action-btn hot">
                                          <FireOutlined />
                                        </div>
                                      </Tooltip>
                                    )}
                                    <Tooltip title="设置">
                                      <div className="action-btn">
                                        <SettingOutlined />
                                      </div>
                                    </Tooltip>
                                    <Tooltip title="删除">
                                      <div className="action-btn danger">
                                        <MinusOutlined />
                                      </div>
                                    </Tooltip>
                                  </div>
                                </ModelCard>
                              ))}
                            </div>
                          </Space>
                        </div>
                      </DetailPanel>
                    )}
                  </div>
                )}

                {/* 其他菜单项的内容 */}
                {activeMenu !== 'model-service' && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '50vh',
                    color: theme.colors.text.secondary
                  }}>
                    <Title level={3} style={{ color: theme.colors.text.secondary }}>
                      {menuItems.find(item => item.id === activeMenu)?.label} 功能开发中...
                    </Title>
                  </div>
                )}
              </MainContent>
            </Content>
          </Layout>
        </Layout>
      </AppContainer>
    </DndProvider>
  );
};

export default ApiManagerPage;