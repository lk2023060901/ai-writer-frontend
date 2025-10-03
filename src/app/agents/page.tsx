'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Dropdown, Input, Tag, Modal, Form, App } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  AppstoreOutlined,
} from '@ant-design/icons';
import AppLayout from '@/components/AppLayout';
import { authService } from '@/services/auth';
import { chatService, Agent as APIAgent } from '@/services/chat';
import { useRouter } from 'next/navigation';

interface Agent {
  id: string;
  emoji: string;
  name: string;
  category: string;
  description: string;
  isFavorite: boolean;
}

const mockAgents: Agent[] = [
  {
    id: '1',
    emoji: '📝',
    name: 'Content Writer',
    category: 'Writing',
    description: 'Professional content writing assistant',
    isFavorite: true,
  },
  {
    id: '2',
    emoji: '🌐',
    name: 'Translator',
    category: 'Translation',
    description: 'Multilingual translation expert',
    isFavorite: false,
  },
  {
    id: '3',
    emoji: '📊',
    name: 'Data Analyst',
    category: 'Analytics',
    description: 'Data analysis and insights',
    isFavorite: false,
  },
  {
    id: '4',
    emoji: '🎨',
    name: 'Creative Designer',
    category: 'Design',
    description: 'Creative design assistance',
    isFavorite: true,
  },
  {
    id: '5',
    emoji: '💼',
    name: 'Business Consultant',
    category: 'Business',
    description: 'Business strategy and consulting',
    isFavorite: false,
  },
  {
    id: '6',
    emoji: '🎯',
    name: 'Marketing Expert',
    category: 'Marketing',
    description: 'Marketing strategy and campaigns',
    isFavorite: false,
  },
];

const categories = [
  { key: 'My Favorites', icon: <StarFilled />, custom: true },
  { key: 'Customer Service', icon: '🎧', custom: true },
  { key: 'All', icon: <AppstoreOutlined />, custom: false },
  { key: 'Writing', icon: '✍️', custom: false },
  { key: 'Translation', icon: '🌐', custom: false },
  { key: 'Marketing', icon: '📣', custom: false },
];

export default function AgentsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [agents, setAgents] = useState<APIAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<APIAgent | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      message.warning('Please login first');
      router.push('/login');
    } else {
      loadAgents();
    }
  }, [router]);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = await chatService.getAgents();
      if (response.error) {
        message.error(response.error);
        return;
      }
      if (response.data) {
        setAgents(response.data);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Agent',
      content: 'Are you sure you want to delete this agent?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await chatService.deleteAgent(id);
          if (response.error) {
            message.error(response.error);
            return;
          }
          message.success('Agent deleted successfully');
          loadAgents();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete agent');
        }
      },
    });
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      const response = enabled
        ? await chatService.updateAgent(id, { enabled: false })
        : await chatService.updateAgent(id, { enabled: true });

      if (response.error) {
        message.error(response.error);
        return;
      }
      message.success(`Agent ${!enabled ? 'enabled' : 'disabled'} successfully`);
      loadAgents();
    } catch (error: any) {
      message.error(error.message || 'Failed to toggle agent');
    }
  };

  const handleCreateOrUpdate = async (values: any) => {
    setLoading(true);
    try {
      if (editingAgent) {
        const response = await chatService.updateAgent(editingAgent.id, values);
        if (response.error) {
          message.error(response.error);
          return;
        }
        message.success('Agent updated successfully');
      } else {
        const response = await chatService.createAgent(values);
        if (response.error) {
          message.error(response.error);
          return;
        }
        message.success('Agent created successfully');
      }
      setIsModalOpen(false);
      setEditingAgent(null);
      form.resetFields();
      loadAgents();
    } catch (error: any) {
      message.error(error.message || 'Failed to save agent');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agent: APIAgent) => {
    setEditingAgent(agent);
    form.setFieldsValue(agent);
    setIsModalOpen(true);
  };

  const getMenuItems = (agent: APIAgent) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => handleEdit(agent),
    },
    {
      key: 'toggle',
      icon: agent.enabled ? <StarFilled /> : <StarOutlined />,
      label: agent.enabled ? 'Disable' : 'Enable',
      onClick: () => handleToggleEnabled(agent.id, agent.enabled),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => handleDelete(agent.id),
    },
  ];

  return (
    <AppLayout>
      <div className="grid h-full grid-cols-12">
        {/* Sidebar Categories */}
        <div className="col-span-3 overflow-y-auto border-r border-background-dark/10 bg-background-light p-4 dark:border-background-light/10 dark:bg-background-dark">
          <div className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase text-background-dark/50 dark:text-background-light/50">
              Custom Categories
            </h3>
            <nav className="space-y-1">
              {categories
                .filter((cat) => cat.custom)
                .map((category) => (
                  <div
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === category.key
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-background-dark/70 hover:bg-background-dark/5 dark:text-background-light/70 dark:hover:bg-background-light/5'
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span>{category.key}</span>
                  </div>
                ))}
            </nav>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-background-dark/50 dark:text-background-light/50">
              Official Categories
            </h3>
            <nav className="space-y-1">
              {categories
                .filter((cat) => !cat.custom)
                .map((category) => (
                  <div
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === category.key
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-background-dark/70 hover:bg-background-dark/5 dark:text-background-light/70 dark:hover:bg-background-light/5'
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span>{category.key}</span>
                  </div>
                ))}
            </nav>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="col-span-9 flex flex-col overflow-y-auto bg-white p-6 dark:bg-background-dark/50">
          <div className="mb-6 flex items-center justify-between">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <div className="flex items-center gap-2">
              <Button icon={<SearchOutlined />}>Search</Button>
              <Button icon={<UploadOutlined />}>Import</Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingAgent(null);
                  form.resetFields();
                  setIsModalOpen(true);
                }}
              >
                Create Agent
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className="group relative transition-shadow hover:shadow-lg"
                bodyStyle={{ padding: '1.25rem' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{agent.emoji || '🤖'}</span>
                    <div>
                      <h4 className="font-semibold text-background-dark dark:text-background-light">
                        {agent.name}
                      </h4>
                      {agent.tags && agent.tags.length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {agent.tags.slice(0, 2).map((tag) => (
                            <Tag key={tag} className="text-xs">{tag}</Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Dropdown
                    menu={{ items: getMenuItems(agent) }}
                    trigger={['click']}
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </Dropdown>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-background-dark/60 dark:text-background-light/60">
                  {agent.prompt}
                </p>
              </Card>
            ))}
          </div>

          {filteredAgents.length === 0 && !loading && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-background-dark/60 dark:text-background-light/60">
                  No agents found
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="mt-4"
                  onClick={() => {
                    setEditingAgent(null);
                    form.resetFields();
                    setIsModalOpen(true);
                  }}
                >
                  Create your first agent
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Agent Modal */}
      <Modal
        title={editingAgent ? 'Edit Agent' : 'Create Agent'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingAgent(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter agent name' }]}
          >
            <Input placeholder="e.g., Content Writer" />
          </Form.Item>

          <Form.Item
            label="Emoji"
            name="emoji"
            rules={[{ required: true, message: 'Please enter an emoji' }]}
          >
            <Input placeholder="📝" maxLength={2} />
          </Form.Item>

          <Form.Item
            label="Prompt"
            name="prompt"
            rules={[{ required: true, message: 'Please enter agent prompt' }]}
          >
            <Input.TextArea
              placeholder="You are a professional content writing assistant..."
              rows={4}
            />
          </Form.Item>

          <Form.Item label="Tags" name="tags">
            <Input placeholder="writing, content, blog (comma-separated)" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingAgent(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingAgent ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>
    </AppLayout>
  );
}
