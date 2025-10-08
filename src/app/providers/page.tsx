'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import Navbar from '@/components/Navbar';
import { authService } from '@/services/auth';
import { providerService, AIProviderConfig } from '@/services/provider';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    const currentProvider = providers.find(p => p.id === selectedProvider);
    if (currentProvider) {
      setSelectedProviderData(currentProvider);
      form.setFieldsValue(currentProvider);
    }
  }, [selectedProvider, providers, form]);

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
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-background-dark dark:text-background-light">
            AI Providers
          </h1>
          <p className="mt-1 text-sm text-background-dark/60 dark:text-background-light/60">
            Manage your AI service providers and their configurations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Providers List */}
          <div className="md:col-span-1 space-y-4">
            {/* Search and Add */}
            <div className="flex gap-2">
              <Input
                placeholder="Search providers..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Add
              </Button>
            </div>

            {/* Provider Cards */}
            <div className="space-y-2">
              {providers
                .filter((p) =>
                  p.provider_name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedProvider === provider.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border-light dark:border-border-dark hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={'/default-provider.png'}
                          alt={provider.provider_name}
                          className="w-8 h-8 rounded"
                        />
                        <div>
                          <h3 className="font-medium text-background-dark dark:text-background-light">
                            {provider.provider_name}
                          </h3>
                          <p className="text-xs text-background-dark/60 dark:text-background-light/60">
                            {provider.provider_type}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={provider.is_enabled}
                        onChange={(checked) => handleToggleEnabled(provider.id, provider.is_enabled)}
                        size="small"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Provider Settings */}
          <div className="md:col-span-2">
            {selectedProviderData ? (
              <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={'/default-provider.png'}
                      alt={selectedProviderData.provider_name}
                      className="w-12 h-12 rounded"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-background-dark dark:text-background-light">
                        {selectedProviderData.provider_name}
                      </h2>
                      <p className="text-sm text-background-dark/60 dark:text-background-light/60">
                        {selectedProviderData.provider_type}
                      </p>
                    </div>
                  </div>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteProvider(selectedProviderData.id)}
                  >
                    Delete
                  </Button>
                </div>

                <Form
                  form={form}
                  onFinish={handleUpdateProvider}
                  layout="vertical"
                  initialValues={selectedProviderData}
                >
                  <Form.Item
                    label="API Key"
                    name="api_key"
                    rules={[{ required: true, message: 'Please input API key' }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item label="API Base URL" name="api_base_url">
                    <Input />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Save Changes
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ) : (
              <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-12 text-center">
                <p className="text-background-dark/60 dark:text-background-light/60">
                  Select a provider to view settings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Provider Modal */}
      <Modal
        title="Add New Provider"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateProvider} layout="vertical">
          <Form.Item
            label="Provider Type"
            name="provider_type"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Provider Name"
            name="provider_name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="API Key"
            name="api_key"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item label="API Base URL" name="api_base_url">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Create Provider
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
