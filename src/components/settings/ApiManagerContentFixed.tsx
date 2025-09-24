/**
 * API 管理器内容组件 - 修复版
 * 采用正确的两栏布局设计
 */

import {
  AppstoreOutlined,
  BulbOutlined,
  CheckOutlined,
  GlobalOutlined,
  PlusOutlined,
  SettingOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { Button, Input, Space, Switch, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import DraggableServiceCard from '../api-manager/DraggableServiceCard';

const { Title } = Typography;

// 主容器 - 完整高度布局
const MainContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// 内容区域 - 占满剩余空间
const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  overflow: hidden;
`;

// 左侧服务列表区域
const ServiceListSection = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
`;

// 右侧详情区域
const DetailSection = styled.div`
  flex: 1;
  display: flex;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
`;

// 服务列表头部
const ServiceHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);

  .services-title {
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .title-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .services-count {
        background: var(--color-primary);
        color: white;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 500;
        min-width: 20px;
        text-align: center;
      }
    }
  }

  .sort-hint {
    color: var(--text-muted);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;

    .drag-icon {
      color: var(--text-secondary);
    }
  }
`;

// 服务列表容器
const ServicesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  .services-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

// 详情面板容器
const DetailContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// 详情内容
const DetailContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  .section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      color: var(--text-primary);
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;

      .section-icon {
        color: var(--color-primary);
        font-size: 16px;
      }
    }

    .ant-input, .ant-input-password {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      border-radius: 8px;
      padding: 12px;

      &::placeholder {
        color: var(--text-muted);
      }

      &:focus, &:hover {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
      }
    }

    .help-text {
      color: var(--text-muted);
      font-size: 12px;
      margin-top: 8px;
      line-height: 1.4;
    }

    .link-text {
      color: var(--color-primary);
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;

      &:hover {
        text-decoration: underline;
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 16px;

      .ant-btn {
        border-radius: 8px;
        height: 40px;
        padding: 0 20px;
        font-weight: 500;
      }
    }

    .model-grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .model-card {
      padding: 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary);
        transform: translateY(-2px);
        box-shadow: var(--ds-shadow-lg);
      }

      .model-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .model-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .model-logo {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          }

          .model-details {
            .model-name {
              color: var(--text-primary);
              font-weight: 600;
              font-size: 14px;
              margin-bottom: 2px;
            }

            .model-group {
              color: var(--text-muted);
              font-size: 12px;
            }
          }
        }

        .model-badges {
          display: flex;
          gap: 6px;
          align-items: center;

          .hot-badge {
            background: #ef4444;
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
          }
        }
      }

      .model-features {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;

        .feature-tag {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }
      }

      .model-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .model-status {
          font-size: 12px;
          color: var(--text-muted);
        }

        .ant-switch {
          background: var(--bg-tertiary);

          &.ant-switch-checked {
            background: #10b981;
          }
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      .stat-card {
        padding: 16px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        text-align: center;

        .stat-value {
          color: var(--color-primary);
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          color: var(--text-muted);
          font-size: 12px;
        }
      }
    }
  }
`;

// 详情头部
const DetailHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);

  .detail-title {
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;

    .service-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
  }

  .detail-subtitle {
    color: var(--text-muted);
    font-size: 14px;
    margin-top: 4px;
  }
`;

// 空状态
const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;

  .empty-icon {
    font-size: 48px;
    color: var(--text-muted);
    margin-bottom: 16px;
  }

  .empty-title {
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .empty-description {
    color: var(--text-muted);
    font-size: 14px;
    line-height: 1.5;
    max-width: 280px;
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
  group?: string;
  badge?: string;
  features?: ('vision' | 'web' | 'reasoning' | 'tools')[];
}

// 初始数据
const initialServices: ApiService[] = [
  {
    id: 'siliconflow',
    name: '硅基流动',
    logo: 'SF',
    enabled: true,
    models: [
      {
        id: 'qwen-turbo',
        name: 'Qwen-Turbo',
        logo: 'QT',
        isHot: true,
        enabled: true,
        group: 'Qwen',
        features: ['vision', 'web', 'tools']
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: 'OAI',
    enabled: false,
    models: [
      { id: 'gpt-4', name: 'GPT-4', logo: 'G4', isHot: true, enabled: true },
    ],
  },
];

const ApiManagerContentFixed: React.FC = () => {
  const [services, setServices] = useState<ApiService[]>(initialServices);
  const [selectedService, setSelectedService] = useState<ApiService | null>(initialServices[0] || null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');

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

  return (
    <DndProvider backend={HTML5Backend}>
      <MainContainer>
        <ContentContainer>
          {/* 左侧：API 服务商列表 */}
          <ServiceListSection>
            <ServiceHeader>
              <div className="services-title">
                <div className="title-left">
                  <GlobalOutlined />
                  API 服务商
                  <span className="services-count">{services.length}</span>
                </div>
              </div>
              <div className="sort-hint">
                <span className="drag-icon">⋮⋮</span>
                拖拽排序
              </div>
            </ServiceHeader>

            <ServicesContainer>
              <div className="services-list">
                {services.map((service, index) => (
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
          </ServiceListSection>

          {/* 右侧：详情面板 */}
          <DetailSection>
            {selectedService ? (
              <DetailContainer>
                <DetailHeader>
                  <div className="detail-title">
                    <div className="service-avatar">
                      {selectedService.logo}
                    </div>
                    {selectedService.name} 配置
                  </div>
                  <div className="detail-subtitle">
                    配置 API 密钥和服务设置
                  </div>
                </DetailHeader>

                <DetailContent>
                  <div className="section">
                    <div className="section-title">
                      <ToolOutlined className="section-icon" />
                      API 密钥
                    </div>
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
                          📚 点击这里获取密钥
                        </a>
                      </div>
                      <div className="action-buttons">
                        <Button
                          type="primary"
                          icon={<CheckOutlined />}
                          style={{ background: '#10b981', border: 'none' }}
                        >
                          检测连接
                        </Button>
                        <Button icon={<PlusOutlined />}>
                          添加密钥
                        </Button>
                      </div>
                    </Space>
                  </div>

                  <div className="section">
                    <div className="section-title">
                      <GlobalOutlined className="section-icon" />
                      API 地址
                    </div>
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <Input
                        placeholder="https://api.example.com/v1"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                      />
                      <div className="help-text">
                        💡 自定义 API 端点地址，留空使用默认地址。确保地址格式正确且可访问。
                      </div>
                    </Space>
                  </div>

                  <div className="section">
                    <div className="section-title">
                      <SettingOutlined className="section-icon" />
                      高级设置
                    </div>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-primary)' }}>启用流式输出</span>
                        <Switch defaultChecked />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-primary)' }}>自动重试</span>
                        <Switch defaultChecked />
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>请求超时时间</div>
                        <Input placeholder="30" suffix="秒" style={{ width: '100px' }} />
                      </div>
                    </Space>
                  </div>

                  <div className="section">
                    <div className="section-title">
                      <BulbOutlined className="section-icon" />
                      模型管理 ({selectedService.models.length})
                    </div>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-value">{selectedService.models.length}</div>
                        <div className="stat-label">总模型数</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{selectedService.models.filter(m => m.enabled).length}</div>
                        <div className="stat-label">已启用</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{selectedService.models.filter(m => m.isHot).length}</div>
                        <div className="stat-label">热门模型</div>
                      </div>
                    </div>
                    <div className="model-grid">
                      {selectedService.models.map(model => (
                        <div key={model.id} className="model-card">
                          <div className="model-header">
                            <div className="model-info">
                              <div className="model-logo">
                                {model.logo}
                              </div>
                              <div className="model-details">
                                <div className="model-name">{model.name}</div>
                                <div className="model-group">{model.group || '通用模型'}</div>
                              </div>
                            </div>
                            <div className="model-badges">
                              {model.isHot && (
                                <span className="hot-badge">热门</span>
                              )}
                              <Switch
                                checked={model.enabled}
                                size="small"
                              />
                            </div>
                          </div>
                          {model.features && (
                            <div className="model-features">
                              {model.features.map(feature => (
                                <span key={feature} className="feature-tag">
                                  {feature === 'vision' && '👁️ 视觉'}
                                  {feature === 'web' && '🌐 网络'}
                                  {feature === 'reasoning' && '🧠 推理'}
                                  {feature === 'tools' && '🔧 工具'}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="model-actions">
                            <span className="model-status">
                              {model.enabled ? '已启用' : '已禁用'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">
                      <AppstoreOutlined className="section-icon" />
                      使用统计
                    </div>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-value">1,234</div>
                        <div className="stat-label">今日请求</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">12.3K</div>
                        <div className="stat-label">本月请求</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">98.5%</div>
                        <div className="stat-label">成功率</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">125ms</div>
                        <div className="stat-label">平均延迟</div>
                      </div>
                    </div>
                  </div>
                </DetailContent>
              </DetailContainer>
            ) : (
              <EmptyState>
                <div className="empty-icon">⚙️</div>
                <div className="empty-title">选择 API 服务商</div>
                <div className="empty-description">
                  请从左侧列表中选择一个 API 服务商来配置相关设置
                </div>
              </EmptyState>
            )}
          </DetailSection>
        </ContentContainer>
      </MainContainer>
    </DndProvider>
  );
};

export default ApiManagerContentFixed;