/**
 * API 管理器内容组件
 * 从 api-manager.tsx 中提取的核心功能，用于设置面板
 */

import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Input, Button, Space, Typography, Tooltip, Modal, Form } from 'antd';
import {
  SettingOutlined,
  MinusOutlined,
  EyeOutlined,
  CheckOutlined,
  AppstoreOutlined,
  PlusOutlined,
  RightOutlined,
  GlobalOutlined,
  ToolOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import DraggableServiceCard from '../api-manager/DraggableServiceCard';

const { Title } = Typography;

// 使用 CSS 变量替代硬编码主题

const ContentContainer = styled.div`
  display: flex;
  gap: 24px;
  height: 100%;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
`;

const MainSection = styled.div`
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ServicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .services-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .services-title {
      color: var(--text-primary);
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;

      .services-count {
        background: var(--color-primary);
        color: white;
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
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
  }
`;

const DetailPanel = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;

  .section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      color: var(--text-primary);
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .ant-input, .ant-input-password {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);

      &::placeholder {
        color: var(--text-muted);
      }

      &:focus, &:hover {
        border-color: var(--color-primary);
      }
    }

    .help-text {
      color: var(--text-muted);
      font-size: 12px;
      margin-top: 8px;
    }

    .link-text {
      color: var(--color-primary);
      cursor: pointer;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const ModelCard = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary);
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
      color: var(--text-primary);
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
      background: var(--border-color);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--color-primary);
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

const ModelActionsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);

  .model-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--color-primary);
      background: var(--bg-tertiary);
      color: var(--color-primary);
    }

    &:active {
      transform: translateY(1px);
    }

    .anticon {
      font-size: 16px;
    }
  }
`;

const ModelTreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ModelGroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
    border-color: var(--color-primary);
  }

  .group-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .expand-icon {
      color: var(--text-secondary);
      font-size: 12px;
      transition: transform 0.2s;
    }

    .group-name {
      color: var(--text-primary);
      font-weight: 500;
      font-size: 14px;
    }

    .model-count {
      background: var(--color-primary);
      color: white;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 8px;
    }
  }

  .group-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &.expanded .expand-icon {
    transform: rotate(90deg);
  }
`;

const ModelSubList = styled.div`
  margin-left: 0;
  overflow: hidden;
  transition: all 0.3s ease;

  &.collapsed {
    max-height: 0;
    opacity: 0;
  }

  &.expanded {
    max-height: 1000px;
    opacity: 1;
  }
`;

const ModelSubItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 12px 32px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-top: none;
  transition: all 0.2s;

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  &:hover {
    background: var(--bg-tertiary);
  }

  .model-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .model-avatar {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: bold;
    }

    .model-name {
      color: var(--text-primary);
      font-size: 14px;
    }

    .model-badge {
      background: #f59e0b;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 8px;
    }

    .model-features {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;

      .feature-icon {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;

        &.vision {
          background: #10b981;
        }

        &.web {
          background: #3b82f6;
        }

        &.reasoning {
          background: #f59e0b;
        }

        &.tools {
          background: #8b5cf6;
        }
      }
    }
  }

  .model-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .action-btn {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 4px;
      background: var(--border-color);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 12px;

      &:hover {
        background: var(--color-primary);
        color: white;
      }

      &.danger:hover {
        background: #ef4444;
        color: white;
      }
    }
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: var(--bg-primary);
    border-radius: 12px;
    padding: 0;
    overflow: hidden;
  }

  .ant-modal-header {
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    padding: 24px 24px 16px;
    border-radius: 12px 12px 0 0;

    .ant-modal-title {
      color: var(--text-primary);
      font-size: 18px;
      font-weight: 600;
    }
  }

  .ant-modal-close {
    top: 24px;
    right: 24px;
    color: var(--text-secondary);

    &:hover {
      color: var(--text-primary);
    }

    .ant-modal-close-x {
      width: 32px;
      height: 32px;
      line-height: 32px;
      font-size: 16px;
    }
  }

  .ant-modal-body {
    padding: 24px;
    background: var(--bg-primary);
  }

  .ant-modal-footer {
    padding: 16px 24px 24px;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-color);
    text-align: right;

    .ant-btn {
      margin-left: 12px;

      &:first-child {
        margin-left: 0;
      }
    }
  }
`;

const FormItem = styled(Form.Item)`
  .ant-form-item-label {
    padding-bottom: 8px;

    label {
      color: var(--text-primary);
      font-weight: 500;
      font-size: 14px;

      &.ant-form-item-required::before {
        color: #ff4d4f;
      }
    }

    .ant-form-item-tooltip {
      color: var(--text-secondary);
      margin-left: 4px;
    }
  }

  .ant-input {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;

    &::placeholder {
      color: var(--text-muted);
    }

    &:focus, &:hover {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }
  }

  .ant-form-item-explain-error {
    color: #ff4d4f;
    font-size: 12px;
    margin-top: 4px;
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
  group?: string; // 所属分组
  badge?: string; // 徽章文字
  features?: ('vision' | 'web' | 'reasoning' | 'tools')[]; // 模型特性
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
      {
        id: 'qwen-plus',
        name: 'Qwen-Plus',
        logo: 'QP',
        enabled: true,
        group: 'Qwen',
        features: ['vision', 'web', 'reasoning', 'tools']
      },
      {
        id: 'baai-bge-m3',
        name: 'BAAI/bge-m3',
        logo: 'B',
        enabled: true,
        group: 'BAAI',
        badge: '嵌入'
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek-Coder',
        logo: 'DS',
        enabled: true,
        group: 'deepseek-ai',
        features: ['reasoning', 'tools']
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

const ApiManagerContent: React.FC = () => {
  const [services, setServices] = useState<ApiService[]>(initialServices);
  const [selectedService, setSelectedService] = useState<ApiService | null>(initialServices[0] || null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['BAAI']));
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [addModelForm] = Form.useForm();

  // 初始化时设置第一个服务的API信息
  React.useEffect(() => {
    const firstService = initialServices[0];
    if (firstService && selectedService?.id === firstService.id) {
      setApiKey(firstService.apiKey || '');
      setApiUrl(firstService.apiUrl || '');
    }
  }, []);

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

  const handleManageModels = useCallback(() => {
    // TODO: 实现模型管理逻辑
    console.log('管理模型:', selectedService?.name);
  }, [selectedService]);

  const handleAddModel = useCallback(() => {
    setShowAddModelModal(true);
  }, []);


  // 处理添加模型表单提交
  const handleAddModelSubmit = useCallback(async () => {
    try {
      const values = await addModelForm.validateFields();

      if (!selectedService) return;

      const newModel: ApiModel = {
        id: values.modelId,
        name: values.modelName,
        logo: values.modelName.substring(0, 2).toUpperCase(),
        enabled: true,
        group: values.groupName,
        features: [] // 默认无特性，后续可以编辑
      };

      // 更新服务列表
      setServices(prev => prev.map(service => {
        if (service.id === selectedService.id) {
          return {
            ...service,
            models: [...service.models, newModel]
          };
        }
        return service;
      }));

      // 更新选中的服务
      setSelectedService(prev => prev ? {
        ...prev,
        models: [...prev.models, newModel]
      } : prev);

      // 自动展开新分组
      if (!expandedGroups.has(values.groupName)) {
        setExpandedGroups(prev => new Set([...prev, values.groupName]));
      }

      // 关闭模态框并重置表单
      setShowAddModelModal(false);
      addModelForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  }, [selectedService, addModelForm, expandedGroups]);

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  }, []);

  const handleDeleteModel = useCallback((modelId: string) => {
    if (!selectedService) return;

    setServices(prev => prev.map(service => {
      if (service.id === selectedService.id) {
        const updatedModels = service.models.filter(model => model.id !== modelId);
        return { ...service, models: updatedModels };
      }
      return service;
    }));

    // 更新选中的服务
    if (selectedService) {
      const updatedService = {
        ...selectedService,
        models: selectedService.models.filter(model => model.id !== modelId)
      };
      setSelectedService(updatedService);
    }
  }, [selectedService]);

  const filteredServices = services;

  // 根据选中的服务动态生成分组
  const getModelGroups = useCallback(() => {
    if (!selectedService) return [];

    const groups = new Map<string, ApiModel[]>();

    selectedService.models.forEach(model => {
      const groupName = model.group || 'Other';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(model);
    });

    // 只返回有模型的分组
    return Array.from(groups.entries())
      .filter(([_, models]) => models.length > 0)
      .map(([groupName, models]) => ({
        name: groupName,
        models,
        count: models.length
      }));
  }, [selectedService]);

  // 渲染特性图标
  const renderFeatureIcons = useCallback((features?: string[]) => {
    if (!features || features.length === 0) return null;

    const featureMap = {
      vision: { icon: <EyeOutlined />, title: '视觉' },
      web: { icon: <GlobalOutlined />, title: '联网' },
      reasoning: { icon: <BulbOutlined />, title: '推理' },
      tools: { icon: <ToolOutlined />, title: '工具' }
    };

    return (
      <div className="model-features">
        {features.slice(0, 4).map((feature) => {
          const featureConfig = featureMap[feature as keyof typeof featureMap];
          if (!featureConfig) return null;

          return (
            <Tooltip key={feature} title={featureConfig.title}>
              <div className={`feature-icon ${feature}`}>
                {featureConfig.icon}
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <ContentContainer>
        {/* 主内容区 */}
        <MainSection>

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
        </MainSection>

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
                  style={{ background: '#10b981', border: 'none' }}
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
            <div className="section" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>模型</div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                <ModelTreeContainer>
                  {getModelGroups().map((group) => (
                    <div key={group.name}>
                      <ModelGroupHeader
                        className={expandedGroups.has(group.name) ? 'expanded' : ''}
                        onClick={() => toggleGroup(group.name)}
                      >
                        <div className="group-left">
                          <RightOutlined className="expand-icon" />
                          <span className="group-name">{group.name}</span>
                          <span className="model-count">{group.count}</span>
                        </div>
                      </ModelGroupHeader>
                      <ModelSubList className={expandedGroups.has(group.name) ? 'expanded' : 'collapsed'}>
                        {group.models.map((model) => (
                          <ModelSubItem key={model.id}>
                            <div className="model-info">
                              <div className="model-avatar">{model.logo}</div>
                              <span className="model-name">{model.name}</span>
                              {model.badge && <span className="model-badge">{model.badge}</span>}
                              {renderFeatureIcons(model.features)}
                            </div>
                            <div className="model-actions">
                              <Tooltip title="设置">
                                <div className="action-btn">
                                  <SettingOutlined />
                                </div>
                              </Tooltip>
                              <Tooltip title="删除">
                                <div
                                  className="action-btn danger"
                                  onClick={() => handleDeleteModel(model.id)}
                                >
                                  <MinusOutlined />
                                </div>
                              </Tooltip>
                            </div>
                          </ModelSubItem>
                        ))}
                      </ModelSubList>
                    </div>
                  ))}
                </ModelTreeContainer>

                <ModelActionsContainer>
                  <div className="model-action-btn" onClick={handleManageModels}>
                    <AppstoreOutlined />
                    管理
                  </div>
                  <div className="model-action-btn" onClick={handleAddModel}>
                    <PlusOutlined />
                    添加
                  </div>
                </ModelActionsContainer>
              </div>
            </div>
          </DetailPanel>
        )}
      </ContentContainer>

      {/* 添加模型模态对话框 */}
      <StyledModal
        title="添加模型"
        open={showAddModelModal}
        onOk={handleAddModelSubmit}
        onCancel={() => {
          setShowAddModelModal(false);
          addModelForm.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={480}
        destroyOnHidden
      >
        <Form
          form={addModelForm}
          layout="vertical"
          requiredMark={false}
        >
          <FormItem
            label="模型 ID"
            name="modelId"
            rules={[
              { required: true, message: '请输入模型 ID' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: '模型 ID 只能包含字母、数字、下划线和横线' }
            ]}
          >
            <Input placeholder="例如：gpt-4" />
          </FormItem>

          <FormItem
            label="模型名称"
            name="modelName"
            rules={[
              { required: true, message: '请输入模型名称' },
              { max: 50, message: '模型名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="例如：GPT-4" />
          </FormItem>

          <FormItem
            label="分组名称"
            name="groupName"
            rules={[
              { required: true, message: '请输入分组名称' },
              { max: 30, message: '分组名称不能超过30个字符' }
            ]}
          >
            <Input
              placeholder="例如：OpenAI"
            />
          </FormItem>
        </Form>
      </StyledModal>
    </DndProvider>
  );
};

export default ApiManagerContent;