'use client';

import React, { useState, useEffect } from 'react';
import { Input, Switch, Button, Collapse, Modal, Form, App } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SyncOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import AppLayout from '@/components/AppLayout';
import { authService } from '@/services/auth';
import { providerService, AIProviderConfig } from '@/services/provider';
import { useRouter } from 'next/navigation';

const { Panel } = Collapse;

interface Provider {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  added: string;
}

interface Model {
  id: string;
  name: string;
  services: string[];
}

const mockProviders: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'https://seeklogo.com/images/O/openai-logo-83762C9523-seeklogo.com.png',
    enabled: true,
    added: '2024-07-29T10:00:00Z',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: 'https://seeklogo.com/images/A/anthropic-logo-E3275A272A-seeklogo.com.png',
    enabled: true,
    added: '2024-07-28T14:00:00Z',
  },
  {
    id: 'google',
    name: 'Google',
    icon: 'https://seeklogo.com/images/G/google-ai-logo-996E854153-seeklogo.com.png',
    enabled: false,
    added: '2024-07-27T12:00:00Z',
  },
];

const mockModels: Record<string, Model[]> = {
  'Claude 3': [
    { id: 'claude-3-opus', name: 'Claude 3 Opus', services: ['text', 'image'] },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', services: ['text', 'image'] },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', services: ['text', 'image'] },
  ],
  'GPT-4': [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', services: ['text', 'image', 'video'] },
    { id: 'gpt-4', name: 'GPT-4', services: ['text', 'image'] },
  ],
  Other: [
    { id: 'dall-e-3', name: 'DALL-E 3', services: ['image'] },
    { id: 'text-embedding-ada-002', name: 'text-embedding-ada-002', services: ['embedding'] },
  ],
};

export default function ProvidersPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedProviderData, setSelectedProviderData] = useState<AIProviderConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  const [activeKeys, setActiveKeys] = useState(['Claude 3', 'GPT-4', 'Other']);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      message.warning('Please login first');
      router.push('/login');
    } else {
      loadProviders();
    }
  }, [router]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const response = await providerService.getProviders();
      if (response.error) {
        message.error(response.error);
        return;
      }
      if (response.data) {
        setProviders(response.data);
        if (response.data.length > 0 && !selectedProvider) {
          setSelectedProvider(response.data[0].id);
          setSelectedProviderData(response.data[0]);
        }
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProvider) {
      const provider = providers.find((p) => p.id === selectedProvider);
      setSelectedProviderData(provider || null);
    }
  }, [selectedProvider, providers]);

  const sortedProviders = [...providers].sort((a, b) => {
    if (a.enabled !== b.enabled) {
      return a.enabled ? -1 : 1;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const filteredProviders = sortedProviders.filter((provider) =>
    provider.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleProvider = async (id: string, enabled: boolean) => {
    try {
      const response = await providerService.toggleProvider(id, !enabled);
      if (response.error) {
        message.error(response.error);
        return;
      }
      message.success(`Provider ${!enabled ? 'enabled' : 'disabled'} successfully`);
      loadProviders();
    } catch (error: any) {
      message.error(error.message || 'Failed to toggle provider');
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
          if (response.error) {
            message.error(response.error);
            return;
          }
          message.success('Provider deleted successfully');
          loadProviders();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete provider');
        }
      },
    });
  };

  const handleUpdateProvider = async (values: any) => {
    if (!selectedProvider) return;

    setLoading(true);
    try {
      const response = await providerService.updateProvider(selectedProvider, {
        api_key: values.api_key,
        api_base_url: values.api_base_url,
      });

      if (response.error) {
        message.error(response.error);
        return;
      }

      message.success('Provider updated successfully');
      loadProviders();
    } catch (error: any) {
      message.error(error.message || 'Failed to update provider');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async (values: any) => {
    setLoading(true);
    try {
      const response = await providerService.createProvider({
        provider_type: values.provider_type,
        provider_name: values.provider_name,
        api_key: values.api_key,
        api_base_url: values.api_base_url,
        supports_chat: true,
        supports_embedding: true,
      });

      if (response.error) {
        message.error(response.error);
        return;
      }

      message.success('Provider created successfully');
      setIsModalOpen(false);
      form.resetFields();
      loadProviders();
    } catch (error: any) {
      message.error(error.message || 'Failed to create provider');
    } finally {
      setLoading(false);
    }
  };

  const totalModels = Object.values(mockModels).flat().length;

  const serviceIcons: Record<string, { icon: string; title: string }> = {
    text: { icon: '📝', title: 'Text' },
    image: { icon: '🖼️', title: 'Image' },
    video: { icon: '🎥', title: 'Video' },
    embedding: { icon: '🔢', title: 'Embedding' },
  };

  return (
    <AppLayout>
      <div className="grid h-full grid-cols-12">
        {/* Providers List */}
        <div className="col-span-3 flex flex-col border-r border-background-dark/10 bg-background-light dark:border-background-light/10 dark:bg-background-dark/30">
          <div className="p-4">
            <Input
              prefix={<SearchOutlined className="text-background-dark/50 dark:text-background-light/50" />}
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-md"
            />
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`flex cursor-pointer items-center justify-between rounded-lg bg-card-light p-3 transition-colors dark:bg-card-dark ${
                  selectedProvider === provider.id
                    ? 'bg-primary/10 ring-1 ring-primary/50 dark:bg-primary/20'
                    : 'hover:bg-background-dark/5 dark:hover:bg-background-light/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <span className="text-sm font-medium text-background-dark dark:text-background-light">
                    {provider.provider_name}
                  </span>
                </div>
                <Switch
                  checked={provider.enabled}
                  onChange={() => handleToggleProvider(provider.id, provider.enabled)}
                  onClick={(e) => e.stopPropagation()}
                  size="small"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-background-dark/10 bg-background-light p-4 dark:border-background-light/10 dark:bg-background-dark/30">
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              className="w-full border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Provider Details */}
        <div className="col-span-9 overflow-y-auto bg-card-light p-6 dark:bg-card-dark">
          {selectedProviderData && (
            <>
              <div className="flex items-center justify-between border-b border-background-dark/10 pb-4 dark:border-background-light/10">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-background-dark dark:text-background-light">
                    {selectedProviderData.provider_name}
                  </h2>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDeleteProvider(selectedProviderData.id)}
                    className="flex h-7 w-7 items-center justify-center"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-background-dark/70 dark:text-background-light/70">
                    Enable
                  </span>
                  <Switch
                    checked={selectedProviderData.enabled}
                    onChange={() => handleToggleProvider(selectedProviderData.id, selectedProviderData.enabled)}
                  />
                </div>
              </div>

              <Form
                layout="vertical"
                initialValues={{
                  api_key: selectedProviderData.api_key,
                  api_base_url: selectedProviderData.api_base_url,
                }}
                onFinish={handleUpdateProvider}
              >
                <div className="py-6">
                  <Form.Item
                    label="API Key"
                    name="api_key"
                    rules={[{ required: true, message: 'Please enter API key' }]}
                  >
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      suffix={
                        <div className="flex items-center gap-1">
                          <Button
                            type="text"
                            size="small"
                            icon={showApiKey ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            onClick={() => setShowApiKey(!showApiKey)}
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<SyncOutlined />}
                            htmlType="submit"
                            loading={loading}
                          />
                        </div>
                      }
                    />
                  </Form.Item>
                </div>

                <div className="pb-6">
                  <Form.Item label="API Address" name="api_base_url">
                    <Input placeholder="https://api.openai.com/v1" />
                  </Form.Item>
                  <p className="mt-2 text-xs text-background-dark/50 dark:text-background-light/50">
                    Example:{' '}
                    <code className="rounded bg-background-dark/10 px-1 py-0.5 dark:bg-background-light/10">
                      https://api.cursorai.art/v1/chat/completions/
                    </code>{' '}
                    (ignore /v1 if ending with /), or{' '}
                    <code className="rounded bg-background-dark/10 px-1 py-0.5 dark:bg-background-light/10">
                      #
                    </code>{' '}
                    for forced input address.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Changes
                  </Button>
                </div>
              </Form>
            </>
          )}

          {!selectedProviderData && (
            <div className="flex h-full items-center justify-center">
              <p className="text-background-dark/60 dark:text-background-light/60">
                Select a provider to view details
              </p>
            </div>
          )}

          <div className="border-t border-background-dark/10 pt-6 dark:border-background-light/10">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-background-dark dark:text-background-light">
                  Models
                </h3>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:bg-primary/20">
                  {totalModels}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Search models..."
                  value={modelSearchTerm}
                  onChange={(e) => setModelSearchTerm(e.target.value)}
                  style={{ width: 200 }}
                />
                <Button type="primary" icon={<SyncOutlined />} className="bg-primary/10 text-primary hover:bg-primary/20 border-primary">
                  Validate
                </Button>
              </div>
            </div>

            <Collapse
              activeKey={activeKeys}
              onChange={(keys) => setActiveKeys(keys as string[])}
              className="space-y-2 bg-transparent"
            >
              {Object.entries(mockModels).map(([category, models]) => (
                <Panel header={category} key={category} className="rounded-lg border border-background-dark/10 bg-background-light dark:border-background-light/10 dark:bg-background-dark/50">
                  {models.map((model) => (
                    <div key={model.id} className="flex items-center border-t border-background-dark/10 p-3 dark:border-background-light/10">
                      <div className="flex flex-1 items-center gap-3">
                        <span className="text-primary">🧠</span>
                        <span className="text-sm font-medium text-background-dark dark:text-background-light">
                          {model.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {model.services.map((service) => (
                            <span key={service} title={serviceIcons[service]?.title}>
                              {serviceIcons[service]?.icon}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="text" size="small" icon={<SettingOutlined />} />
                        <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                      </div>
                    </div>
                  ))}
                </Panel>
              ))}
            </Collapse>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button icon={<EditOutlined />}>Manage</Button>
              <Button type="primary" icon={<PlusOutlined />} className="bg-primary/10 text-primary hover:bg-primary/20 border-primary">
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Provider Modal */}
      <Modal
        title="Create AI Provider"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateProvider}>
          <Form.Item
            label="Provider Type"
            name="provider_type"
            rules={[{ required: true, message: 'Please enter provider type' }]}
          >
            <Input placeholder="e.g., openai, anthropic, google" />
          </Form.Item>

          <Form.Item
            label="Provider Name"
            name="provider_name"
            rules={[{ required: true, message: 'Please enter provider name' }]}
          >
            <Input placeholder="e.g., OpenAI GPT-4" />
          </Form.Item>

          <Form.Item
            label="API Key"
            name="api_key"
            rules={[{ required: true, message: 'Please enter API key' }]}
          >
            <Input.Password placeholder="sk-..." />
          </Form.Item>

          <Form.Item label="API Base URL" name="api_base_url">
            <Input placeholder="https://api.openai.com/v1" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
          </div>
        </Form>
      </Modal>
    </AppLayout>
  );
}
