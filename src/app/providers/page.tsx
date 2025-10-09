'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input, Switch, Button, Modal, Form, App, Select, Upload, Collapse, Badge } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  SettingOutlined,
  DeleteOutlined,
  UploadOutlined,
  ShareAltOutlined,
  EyeOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  MinusOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import SettingsNavbar from '@/components/SettingsNavbar';
import { authService } from '@/services/auth';
import { providerService, AIProviderConfig, AIProviderWithModels, AIModel } from '@/services/provider';
import { useRouter } from 'next/navigation';

interface ProviderFormValues {
  provider_type: string;
  provider_name: string;
  base_url?: string;
  api_key?: string;
  api_base_url?: string;
  enabled?: boolean;
  [key: string]: string | boolean | undefined;
}

export default function ProvidersPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedProviderData, setSelectedProviderData] = useState<AIProviderConfig | null>(null);
  const [selectedProviderModels, setSelectedProviderModels] = useState<AIModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [authMethod, setAuthMethod] = useState<'api_key' | 'oauth'>('api_key');
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [expandedModels, setExpandedModels] = useState<string[]>(['claude-3', 'claude-3.5']);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      message.warning('Please login first');
      router.push('/login');
    } else {
      loadProviders();
    }
  }, [message, router]);

  const loadProvidersCallback = useCallback(async () => {
    setLoading(true);
    try {
      const response = await providerService.getProviders();

      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || 'Failed to load providers');
        return;
      }

      if (response.data) {
        setProviders(response.data);

        // Auto-select first provider if none selected
        if (!selectedProvider && response.data[0]) {
          setSelectedProvider(response.data[0].id);
          setSelectedProviderData(response.data[0]);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load providers';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedProvider, message]);

  const loadProviders = () => {
    loadProvidersCallback();
  };

  // 根据模型名称自动提取分组前缀
  const extractModelFamily = (modelName: string): string => {
    const name = modelName.toLowerCase();

    // Claude 系列（按版本从高到低匹配）
    if (name.includes('claude-4.5') || name.includes('claude-4-5')) return 'Claude 4.5';
    if (name.includes('claude-4.1') || name.includes('claude-4-1')) return 'Claude 4.1';
    if (name.includes('claude-4')) return 'Claude 4';
    if (name.includes('claude-3.5') || name.includes('claude-3-5')) return 'Claude 3.5';
    if (name.includes('claude-3')) return 'Claude 3';
    if (name.includes('claude-2')) return 'Claude 2';
    if (name.includes('claude')) return 'Claude';

    // GPT 系列
    if (name.includes('gpt-4o')) return 'GPT-4o';
    if (name.includes('gpt-4-turbo')) return 'GPT-4 Turbo';
    if (name.includes('gpt-4')) return 'GPT-4';
    if (name.includes('gpt-3.5')) return 'GPT-3.5';
    if (name.includes('gpt')) return 'GPT';

    // Gemini 系列
    if (name.includes('gemini-2')) return 'Gemini 2';
    if (name.includes('gemini-1.5')) return 'Gemini 1.5';
    if (name.includes('gemini-1')) return 'Gemini 1';
    if (name.includes('gemini')) return 'Gemini';

    // Llama 系列
    if (name.includes('llama-3.3') || name.includes('llama-3-3')) return 'Llama 3.3';
    if (name.includes('llama-3.2') || name.includes('llama-3-2')) return 'Llama 3.2';
    if (name.includes('llama-3.1') || name.includes('llama-3-1')) return 'Llama 3.1';
    if (name.includes('llama-3')) return 'Llama 3';
    if (name.includes('llama-2')) return 'Llama 2';
    if (name.includes('llama')) return 'Llama';

    // 其他
    return 'Other Models';
  };

  // 根据模型名称分组
  const groupModelsByFamily = (models: AIModel[]) => {
    const groups: Record<string, AIModel[]> = {};

    models.forEach(model => {
      const family = extractModelFamily(model.model_name);

      if (!groups[family]) {
        groups[family] = [];
      }
      groups[family].push(model);
    });

    return groups;
  };

  // 获取当前服务商的模型分组
  const modelGroups = groupModelsByFamily(selectedProviderModels);
  const modelGroupKeys = Object.keys(modelGroups);

  useEffect(() => {
    const currentProvider = providers.find(p => p.id === selectedProvider);
    if (currentProvider) {
      setSelectedProviderData(currentProvider);
      form.setFieldsValue(currentProvider);
      // 切换服务商时，自动隐藏 API 密钥
      setShowApiKey(false);

      // 加载该服务商的模型列表
      if (selectedProvider) {
        loadProviderModels(selectedProvider);
      }
    }
  }, [selectedProvider, providers, form]);

  const loadProviderModels = async (providerId: string) => {
    try {
      const response = await providerService.getProviderModels(providerId);
      if (response.code === 200 || response.code === 0) {
        setSelectedProviderModels(response.data?.items || []);
      } else {
        setSelectedProviderModels([]);
      }
    } catch (error) {
      console.error('Failed to load provider models:', error);
      setSelectedProviderModels([]);
    }
  };

  const handleToggleEnabled = async (id: string, is_enabled: boolean) => {
    try {
      const response = await providerService.toggleProvider(id, !is_enabled);

      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || 'Failed to toggle provider');
        return;
      }
      message.success(`Provider ${!is_enabled ? 'enabled' : 'disabled'} successfully`);
      loadProviders();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle provider';
      message.error(errorMessage);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    Modal.confirm({
      title: 'Delete Provider',
      content: 'Are you sure you want to delete this provider?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await providerService.deleteProvider(id);
          if (response.code !== 200 && response.code !== 0) {
            message.error(response.message || 'Failed to delete provider');
            return;
          }
          message.success('Provider deleted successfully');
          loadProviders();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete provider';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleUpdateProvider = async (values: ProviderFormValues) => {
    if (!selectedProvider) return;

    setLoading(true);
    try {
      const response = await providerService.updateProvider(selectedProvider, {
        api_key: values.api_key,
        api_base_url: values.api_base_url,
      });

      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || 'Failed to update provider');
        return;
      }

      message.success('Provider updated successfully');
      loadProviders();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update provider';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncModels = async () => {
    if (!selectedProvider) return;

    setLoading(true);
    try {
      const response = await providerService.syncProviderModels(selectedProvider);

      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || '同步模型失败');
        return;
      }

      const data = response.data;
      if (data) {
        message.success(
          `模型同步完成！新增 ${data.models_added} 个，更新 ${data.models_updated} 个，移除 ${data.models_removed} 个，共 ${data.total_models} 个模型`
        );
        // 重新加载服务商和模型列表
        loadProviders();
        // 重新加载当前服务商的模型
        if (selectedProvider) {
          loadProviderModels(selectedProvider);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '同步模型失败';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async (values: ProviderFormValues) => {
    setLoading(true);
    try {
      const response = await providerService.createProvider({
        provider_type: values.provider_type,
        provider_name: values.provider_name,
        api_key: values.api_key || '',
        api_base_url: values.api_base_url,
        supports_chat: true,
        supports_embedding: true,
      });

      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || 'Failed to create provider');
        return;
      }

      message.success('Provider created successfully');
      setIsModalOpen(false);
      form.resetFields();
      loadProviders();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create provider';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background-light dark:bg-background-dark">
      <Navbar activeTabKey="providers" />
      <div className="flex flex-1 overflow-hidden">
        {/* Settings Navigation */}
        <SettingsNavbar activeKey="model-service" />

        {/* Providers List */}
        <div className="flex flex-col w-80 border-r border-background-dark/10 bg-background-light dark:border-background-light/10 dark:bg-background-dark/30">
          {/* Search Bar */}
          <div className="p-4 border-b border-background-dark/10 dark:border-background-light/10">
            <Input
              placeholder="搜索模型平台"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Provider List */}
          <div className="flex-1 overflow-y-auto relative">
            <div className="px-4 py-2">
              {providers
                .filter((p) =>
                  p.provider_name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-md cursor-pointer transition-colors ${
                      selectedProvider === provider.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-background-dark/5 dark:hover:bg-background-light/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={'/default-provider.png'}
                        alt={provider.provider_name}
                        className="w-6 h-6 rounded flex-shrink-0"
                      />
                      <span className="font-medium text-sm text-background-dark dark:text-background-light truncate">
                        {provider.provider_name}
                      </span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={provider.is_enabled}
                        onChange={() => handleToggleEnabled(provider.id, provider.is_enabled)}
                        size="small"
                      />
                    </div>
                  </div>
                ))}
            </div>

            {/* Floating Add Button */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                className="pointer-events-auto shadow-lg"
                onClick={() => setIsModalOpen(true)}
              >
                添加
              </Button>
            </div>
          </div>
        </div>

        {/* Provider Settings */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
          {selectedProviderData ? (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-background-dark dark:text-background-light">
                    {selectedProviderData.provider_name}
                  </h2>
                  <Button
                    type="text"
                    size="small"
                    icon={<ShareAltOutlined />}
                    className="text-background-dark/60 dark:text-background-light/60"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<SettingOutlined />}
                    className="text-background-dark/60 dark:text-background-light/60"
                  />
                </div>
                <Switch
                  checked={selectedProviderData.is_enabled}
                  onChange={() => handleToggleEnabled(selectedProviderData.id, selectedProviderData.is_enabled)}
                />
              </div>

              {/* Divider */}
              <div className="mx-4 mb-6 border-t border-background-dark/10 dark:border-background-light/10" />

              {/* Authentication Method */}
              <div className="px-4 mb-6">
                <Form form={form} layout="vertical" initialValues={selectedProviderData} onFinish={handleUpdateProvider}>
                  <Form.Item label="认证方式">
                    <Select
                      value={authMethod}
                      onChange={setAuthMethod}
                    >
                      <Select.Option value="api_key">API 密钥</Select.Option>
                      <Select.Option value="oauth">网页 OAuth</Select.Option>
                    </Select>
                  </Form.Item>

                  {authMethod === 'api_key' ? (
                    <>
                      <Form.Item
                        label={
                          <div className="flex items-center justify-between w-full">
                            <span>API 密钥</span>
                            <Button
                              type="link"
                              size="small"
                              onClick={handleSyncModels}
                              loading={loading}
                              className="p-0 h-auto"
                            >
                              检测
                            </Button>
                          </div>
                        }
                        name="api_key"
                        rules={[{ required: true, message: '请输入 API 密钥' }]}
                      >
                        <Input.Password
                          placeholder="请输入 API 密钥"
                          visibilityToggle={{
                            visible: showApiKey,
                            onVisibleChange: setShowApiKey
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        label="API 地址"
                        name="api_base_url"
                      >
                        <Input placeholder="可选，默认使用官方地址" />
                      </Form.Item>

                      <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                          保存配置
                        </Button>
                      </Form.Item>
                    </>
                  ) : (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-background-dark dark:text-background-light mb-3">
                        使用 OAuth 方式授权访问您的账户
                      </p>
                      <Button type="primary" block>
                        点击授权
                      </Button>
                    </div>
                  )}
                </Form>
              </div>

              {/* Divider */}
              <div className="mx-4 mb-6 border-t border-background-dark/10 dark:border-background-light/10" />

              {/* Models Section */}
              <div className="px-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-background-dark dark:text-background-light">
                      模型
                    </span>
                    <Badge
                      count={selectedProviderModels.length}
                      className="bg-primary"
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<AppstoreOutlined />}
                    onClick={() => setIsModelModalOpen(true)}
                  />
                </div>

                {/* Model Categories */}
                {selectedProviderModels.length > 0 ? (
                  <Collapse
                    activeKey={expandedModels}
                    onChange={(keys) => setExpandedModels(keys as string[])}
                    bordered={false}
                    className="bg-transparent"
                    items={Object.entries(modelGroups).map(([family, models]) => ({
                      key: family,
                      label: `${family} (${models.length})`,
                      children: (
                        <div className="space-y-2">
                          {models.map((model) => (
                            <div
                              key={model.id}
                              className="flex items-center justify-between p-3 rounded-md bg-background-light dark:bg-background-dark border border-background-dark/10 dark:border-background-light/10"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <img
                                  src="/default-provider.png"
                                  alt={model.display_name || model.model_name}
                                  className="w-6 h-6 rounded"
                                />
                                <span className="text-sm font-medium text-background-dark dark:text-background-light">
                                  {model.display_name || model.model_name}
                                </span>
                                <div className="flex gap-2">
                                  {model.supports_vision && (
                                    <EyeOutlined className="text-xs text-background-dark/40 dark:text-background-light/40" title="视觉" />
                                  )}
                                  {model.supports_function_calling && (
                                    <ToolOutlined className="text-xs text-background-dark/40 dark:text-background-light/40" title="工具" />
                                  )}
                                  {model.supports_reasoning && (
                                    <ThunderboltOutlined className="text-xs text-background-dark/40 dark:text-background-light/40" title="推理" />
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button type="text" size="small" icon={<SettingOutlined />} />
                                <Button type="text" size="small" icon={<MinusOutlined />} danger />
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    }))}
                  />
                ) : (
                  <div className="text-center py-8 text-background-dark/40 dark:text-background-light/40">
                    <p className="text-sm">暂无模型</p>
                  </div>
                )}

                {/* Documentation Link */}
                <div className="mt-4 text-sm text-background-dark/60 dark:text-background-light/60">
                  查看 Anthropic 文档 和 模型 获得更多详情
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <Button icon={<AppstoreOutlined />}>
                    管理
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />}>
                    添加
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-background-dark/40 dark:text-background-light/40">
              <div className="text-center">
                <SettingOutlined className="mb-2 text-4xl" />
                <p>请选择一个服务商</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Provider Modal */}
      <Modal
        title="添加服务商"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={500}
      >
        <Form form={form} onFinish={handleCreateProvider} layout="vertical" className="mt-6">
          {/* AI 服务商图标 */}
          <Form.Item
            label="AI 服务商图标"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              maxCount={1}
              beforeUpload={() => false}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传图标</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {/* 服务商名称 */}
          <Form.Item
            label="服务商名称"
            name="provider_name"
            rules={[{ required: true, message: '请输入服务商名称' }]}
          >
            <Input placeholder="请输入服务商名称" />
          </Form.Item>

          {/* 服务商类型 */}
          <Form.Item
            label="服务商类型"
            name="provider_type"
            rules={[{ required: true, message: '请选择服务商类型' }]}
          >
            <Select placeholder="请选择服务商类型">
              <Select.Option value="openai">OpenAI</Select.Option>
              <Select.Option value="anthropic">Anthropic</Select.Option>
              <Select.Option value="google">Google</Select.Option>
              <Select.Option value="azure">Azure</Select.Option>
              <Select.Option value="custom">自定义</Select.Option>
            </Select>
          </Form.Item>

          {/* API Key */}
          <Form.Item
            label="API Key"
            name="api_key"
            rules={[{ required: true, message: '请输入 API Key' }]}
          >
            <Input.Password placeholder="请输入 API Key" />
          </Form.Item>

          {/* API Base URL */}
          <Form.Item label="API Base URL" name="api_base_url">
            <Input placeholder="可选，默认使用官方地址" />
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              添加服务商
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Model Management Modal */}
      <Modal
        title="模型管理"
        open={isModelModalOpen}
        onCancel={() => setIsModelModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <div className="py-4">
          <p className="text-background-dark/60 dark:text-background-light/60">
            模型管理功能开发中...
          </p>
        </div>
      </Modal>
    </div>
  );
}
