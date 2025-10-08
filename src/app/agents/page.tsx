'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Dropdown, Input, Tag, Form, App, Tabs, Upload, Modal, Select } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  InboxOutlined,
  LinkOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { authService } from '@/services/auth';
import { chatService, Agent, ImportResponse } from '@/services/chat';
import { knowledgeBaseService, KnowledgeBase } from '@/services/knowledgeBase';
import { useRouter } from 'next/navigation';

const { Dragger } = Upload;

interface AgentFormValues {
  name: string;
  emoji?: string;
  prompt: string;
  tags?: string;
  knowledge_base_ids?: string[];
}

// Categories will be dynamically generated from agent tags

export default function AgentsPage() {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [activeImportTab, setActiveImportTab] = useState('file');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  const [showUserAgents, setShowUserAgents] = useState(true); // Toggle between user and official agents
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loadingKnowledgeBases, setLoadingKnowledgeBases] = useState(false);

  const loadAgentsCallback = useCallback(() => {
    if (!authService.isAuthenticated()) {
      message.warning('Please login first');
      router.push('/login');
    } else {
      loadAgents();
    }
  }, [message, router]);

  useEffect(() => {
    loadAgentsCallback();
  }, [loadAgentsCallback]);

  const loadKnowledgeBasesCallback = useCallback(async () => {
    setLoadingKnowledgeBases(true);
    try {
      console.log('🔍 Loading knowledge bases...');
      const response = await knowledgeBaseService.getKnowledgeBases({
        page: 1,
        page_size: 100, // Load all knowledge bases
      });

      console.log('📦 Knowledge bases response:', response);

      // Check response code (0 or 200 indicates success)
      if ((response.code === 200 || response.code === 0) && response.data) {
        console.log('✅ Loaded knowledge bases:', response.data.items);
        setKnowledgeBases(response.data.items);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        if (response.message) {
          message.warning(response.message);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load knowledge bases:', error);
      message.error('Failed to load knowledge bases');
    } finally {
      setLoadingKnowledgeBases(false);
    }
  }, [message]);

  // Load knowledge bases when modal opens
  useEffect(() => {
    console.log('🎯 Modal state changed:', { isModalOpen, currentKbCount: knowledgeBases.length });
    if (isModalOpen) {
      console.log('🚀 Modal opened, triggering knowledge base load...');
      loadKnowledgeBasesCallback();
    }
  }, [isModalOpen, knowledgeBases.length, loadKnowledgeBasesCallback]);

  const loadAgents = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await chatService.getAgents({
        page,
        page_size: pageSize,
        keyword: searchTerm || undefined,
      });
      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || 'Failed to load agents');
        return;
      }
      if (response.data) {
        setAgents(response.data.items);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load agents';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if agent is official
  const isOfficialAgent = (agent: Agent) => !agent.owner_id;

  // Generate categories from agent tags
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    const categoryList = [
      { key: 'All', label: '全部', icon: <AppstoreOutlined /> }
    ];

    // Collect all unique tags from current agents (user or official)
    agents.forEach(agent => {
      const isOfficial = isOfficialAgent(agent);
      // Show user agents when showUserAgents is true
      // Show official agents when showUserAgents is false
      if ((showUserAgents && !isOfficial) || (!showUserAgents && isOfficial)) {
        agent.tags?.forEach(tag => categorySet.add(tag));
      }
    });

    // Convert to category objects with icons for common categories
    const categoryIcons: Record<string, string> = {
      '写作': '✍️',
      '翻译': '🌐',
      '编程': '💻',
      '设计': '🎨',
      '营销': '📣',
      '教育': '📚',
      '创作': '🎬',
      '编导': '🎭',
      '文案': '📝',
    };

    Array.from(categorySet).sort().forEach(tag => {
      const emoji = categoryIcons[tag];
      categoryList.push({
        key: tag,
        label: tag,
        icon: emoji ? <span className="text-lg">{emoji}</span> : <span className="text-lg">📋</span>
      });
    });

    return categoryList;
  }, [agents, showUserAgents]);

  const filteredAgents = Array.isArray(agents) ? agents
    .filter((agent) => {
      // Filter by user/official
      const isOfficial = isOfficialAgent(agent);
      if (showUserAgents && isOfficial) return false;
      if (!showUserAgents && !isOfficial) return false;

      // Search filter
      const matchesSearch =
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agent.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (agent.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) || false);

      // Category filter
      if (selectedCategory === 'All') {
        return matchesSearch;
      }

      // For tag-based categories
      return matchesSearch && (agent.tags?.includes(selectedCategory) || false);
    })
    .sort((a, b) => {
      // Enabled agents come first
      if (a.is_enabled && !b.is_enabled) return -1;
      if (!a.is_enabled && b.is_enabled) return 1;
      // Within same status, sort by creation time (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }) : [];

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: 'Delete Agent',
      content: 'Are you sure you want to delete this agent? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await chatService.deleteAgent(id);
          if (response.code !== 200 && response.code !== 0) {
            // Handle specific error codes
            if (response.code === 403) {
              message.error('You can only delete agents you created');
            } else if (response.code === 404) {
              message.error('Agent not found');
            } else {
              message.error(response.message || 'Failed to delete agent');
            }
            return;
          }
          message.success('Agent deleted successfully');
          loadAgents(currentPage);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete agent';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleToggleEnabled = async (id: string, isEnabled: boolean) => {
    try {
      const response = isEnabled
        ? await chatService.disableAgent(id)
        : await chatService.enableAgent(id);

      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || 'Failed to toggle agent');
        return;
      }
      message.success(`Agent ${!isEnabled ? 'enabled' : 'disabled'} successfully`);
      loadAgents(currentPage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle agent';
      message.error(errorMessage);
    }
  };

  const handleCreateOrUpdate = async (values: AgentFormValues) => {
    setLoading(true);
    try {
      // Process tags from comma-separated string to array
      // Set default emoji if not provided
      const processedValues = {
        ...values,
        emoji: values.emoji || '🤖',  // Default emoji if not provided
        tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
      };

      if (editingAgent) {
        const response = await chatService.updateAgent(editingAgent.id, processedValues);
        if (response.code !== 200 && response.code !== 0) {
          // Handle specific error codes
          if (response.code === 403) {
            message.error('You can only edit agents you created');
          } else if (response.code === 404) {
            message.error('Agent not found');
          } else if (response.code === 400) {
            message.error(response.message || 'Invalid agent data. Prompt must be at least 10 characters.');
          } else {
            message.error(response.message || 'Failed to update agent');
          }
          return;
        }
        message.success('Agent updated successfully');
      } else {
        const response = await chatService.createAgent(processedValues);
        if (response.code !== 200 && response.code !== 0) {
          if (response.code === 400) {
            message.error(response.message || 'Invalid agent data. Prompt must be at least 10 characters.');
          } else {
            message.error(response.message || 'Failed to create agent');
          }
          return;
        }
        message.success('Agent created successfully');
      }
      setIsModalOpen(false);
      setEditingAgent(null);
      form.resetFields();
      loadAgents(currentPage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save agent';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    form.setFieldsValue({
      name: agent.name,
      emoji: agent.emoji,
      prompt: agent.prompt,
      tags: agent.tags?.join(', '),
      knowledge_base_ids: agent.knowledge_base_ids,
    });
    setIsModalOpen(true);
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      let result: ImportResponse | null = null;

      if (activeImportTab === 'file' && importFile) {
        try {
          // Try the bulk import endpoint first
          result = await chatService.importAgentsFromFile(importFile);
        } catch (error) {
          // If bulk import fails, fall back to parsing and creating individually
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log('Bulk import failed, falling back to individual creation:', errorMessage);

          try {
            const text = await importFile.text();
            const agentsData = JSON.parse(text);

            if (!Array.isArray(agentsData)) {
              throw new Error('Invalid JSON format. Expected an array of agents.');
            }

            let successCount = 0;
            let failCount = 0;
            const errors: string[] = [];

            // Create agents one by one
            for (const agent of agentsData as Array<{
              name?: string;
              emoji?: string;
              prompt?: string;
              tags?: string[];
              knowledge_base_ids?: string[];
            }>) {
              try {
                await chatService.createAgent({
                  name: agent.name || 'Imported Agent',
                  emoji: agent.emoji || '🤖',
                  prompt: agent.prompt || '',
                  tags: agent.tags || [],
                  knowledge_base_ids: agent.knowledge_base_ids || [],
                });
                successCount++;
              } catch (createError) {
                failCount++;
                const errorMessage = createError instanceof Error ? createError.message : 'Unknown error';
                errors.push(`${agent.name || 'Unknown'}: ${errorMessage}`);
              }
            }

            result = {
              success_count: successCount,
              fail_count: failCount,
              errors: errors.length > 0 ? errors : undefined,
              agents: [],
            };
          } catch (parseError) {
            const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
            message.error(`Failed to parse JSON file: ${errorMessage}`);
            return;
          }
        }
      } else if (activeImportTab === 'url' && importUrl) {
        try {
          // Import from URL
          const response = await chatService.importAgentsFromUrl(importUrl);
          if (response.data) {
            result = response.data;
          }
        } catch (error) {
          // If URL import fails, try to fetch and parse manually
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log('URL import failed, trying manual fetch:', errorMessage);

          try {
            const response = await fetch(importUrl);
            const agentsData = await response.json();

            if (!Array.isArray(agentsData)) {
              throw new Error('Invalid JSON format. Expected an array of agents.');
            }

            let successCount = 0;
            let failCount = 0;
            const errors: string[] = [];

            for (const agent of agentsData as Array<{
              name?: string;
              emoji?: string;
              prompt?: string;
              tags?: string[];
              knowledge_base_ids?: string[];
            }>) {
              try {
                await chatService.createAgent({
                  name: agent.name || 'Imported Agent',
                  emoji: agent.emoji || '🤖',
                  prompt: agent.prompt || '',
                  tags: agent.tags || [],
                  knowledge_base_ids: agent.knowledge_base_ids || [],
                });
                successCount++;
              } catch (createError) {
                failCount++;
                const errorMessage = createError instanceof Error ? createError.message : 'Unknown error';
                errors.push(`${agent.name}: ${errorMessage}`);
              }
            }

            result = {
              success_count: successCount,
              fail_count: failCount,
              errors: errors.length > 0 ? errors : undefined,
              agents: [],
            };
          } catch (fetchError) {
            const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
            message.error(`Failed to fetch or parse URL: ${errorMessage}`);
            return;
          }
        }
      } else {
        message.error('Please select a file or enter a URL');
        return;
      }

      // Handle import result
      if (result) {
        if (result.success_count > 0) {
          message.success(`Successfully imported ${result.success_count} agent(s)`);
        }
        if (result.fail_count > 0 && result.errors) {
          message.warning(`Failed to import ${result.fail_count} agent(s): ${result.errors.join(', ')}`);
        }
      } else {
        message.error('Import failed. Please check your file or URL.');
      }

      setIsImportModalOpen(false);
      setImportFile(null);
      setImportUrl('');
      loadAgents(currentPage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import agents';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setImportFile(file);
    return false; // Prevent automatic upload
  };

  const getMenuItems = (agent: Agent) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => handleEdit(agent),
    },
    {
      key: 'toggle',
      icon: agent.is_enabled ? (
        <span className="material-symbols-outlined text-base">
          block
        </span>
      ) : (
        <span className="material-symbols-outlined text-base">
          check_circle
        </span>
      ),
      label: agent.is_enabled ? 'Disable' : 'Enable',
      onClick: () => handleToggleEnabled(agent.id, agent.is_enabled),
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar activeTabKey="agents" />
      <div className="grid h-full grid-cols-12">
        {/* Sidebar Categories */}
        <div className="col-span-3 overflow-y-auto border-r border-background-dark/10 bg-background-light p-4 dark:border-background-light/10 dark:bg-background-dark">
          {/* Toggle between user and official agents */}
          <div className="mb-6 flex gap-2">
            <Button
              type={showUserAgents ? 'primary' : 'default'}
              size="small"
              onClick={() => {
                setShowUserAgents(true);
                setSelectedCategory('All');
              }}
              className="flex-1"
            >
              我的智能体
            </Button>
            <Button
              type={!showUserAgents ? 'primary' : 'default'}
              size="small"
              onClick={() => {
                setShowUserAgents(false);
                setSelectedCategory('All');
              }}
              className="flex-1"
            >
              官方智能体
            </Button>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-background-dark/50 dark:text-background-light/50">
              分类
            </h3>
            <nav className="space-y-1">
              {categories.map((category) => (
                <div
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-background-dark/70 hover:bg-background-dark/5 dark:text-background-light/70 dark:hover:bg-background-light/5'
                  }`}
                >
                  {category.icon && (
                    typeof category.icon === 'string' ? (
                      <span className="text-lg">{category.icon}</span>
                    ) : (
                      <span className="text-lg">{category.icon}</span>
                    )
                  )}
                  <span>{category.label}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="col-span-9 flex flex-col overflow-y-auto bg-white p-6 dark:bg-background-dark/50">
          <h2 className="mb-4 text-xl font-bold text-background-dark dark:text-background-light">
            {showUserAgents ? '我的智能体' : '官方智能体'}
          </h2>
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
              <Button
                icon={<UploadOutlined />}
                onClick={() => setIsImportModalOpen(true)}
              >
                Import
              </Button>
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
                className={`group relative transition-all ${
                  agent.is_enabled
                    ? 'hover:shadow-lg'
                    : 'opacity-50 grayscale bg-gray-100 dark:bg-gray-800'
                }`}
                styles={{ body: { padding: '1.25rem' } }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{agent.emoji || '🤖'}</span>
                    <div className="flex-1">
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
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      className={`transition-opacity ${
                        agent.is_enabled
                          ? 'opacity-0 group-hover:opacity-100'
                          : 'opacity-60'
                      }`}
                    />
                  </Dropdown>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
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
            help="Optional. Default emoji will be used if not provided."
          >
            <Input placeholder="📝 (Optional)" maxLength={2} />
          </Form.Item>

          <Form.Item
            label="Prompt"
            name="prompt"
            rules={[
              { required: true, message: 'Please enter agent prompt' },
              { min: 10, message: 'Prompt must be at least 10 characters' }
            ]}
          >
            <Input.TextArea
              placeholder="You are a professional content writing assistant..."
              rows={6}
              showCount
              maxLength={10000}
              onChange={(e) => {
                // 将所有转义符转换为实际字符
                let value = e.target.value;
                value = value.replace(/\\n/g, '\n');    // 换行
                value = value.replace(/\\t/g, '\t');    // Tab
                value = value.replace(/\\r/g, '\r');    // 回车
                value = value.replace(/\\"/g, '"');     // 双引号
                value = value.replace(/\\'/g, "'");     // 单引号
                value = value.replace(/\\\\/g, '\\');   // 反斜杠（最后处理）
                form.setFieldsValue({ prompt: value });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Knowledge Bases"
            name="knowledge_base_ids"
            help={`Select knowledge bases to provide context for this agent ${knowledgeBases.length > 0 ? `(${knowledgeBases.length} available)` : ''}`}
          >
            <Select
              mode="multiple"
              placeholder={loadingKnowledgeBases ? "Loading..." : `Select knowledge bases (${knowledgeBases.length} available)`}
              loading={loadingKnowledgeBases}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={knowledgeBases.map(kb => ({
                value: kb.id,
                label: kb.name,
                disabled: false,
              }))}
              maxTagCount="responsive"
              style={{
                minHeight: '32px',
              }}
              maxTagTextLength={20}
              tagRender={(props) => {
                const { label, closable, onClose } = props;
                return (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0 8px',
                      margin: '2px 4px 2px 0',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      fontSize: '14px',
                      lineHeight: '22px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                    }}
                  >
                    <span style={{ flex: 1 }}>{label}</span>
                    {closable && (
                      <span
                        onClick={onClose}
                        style={{
                          marginLeft: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#00000073',
                        }}
                      >
                        ×
                      </span>
                    )}
                  </span>
                );
              }}
              onOpenChange={(open) => {
                console.log('📋 Dropdown open change:', open);
                console.log('📦 Current knowledge bases:', knowledgeBases);
                console.log('🔄 Loading state:', loadingKnowledgeBases);
              }}
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

      {/* Import Modal */}
      <Modal
        title="Import Agents"
        open={isImportModalOpen}
        onCancel={() => {
          setIsImportModalOpen(false);
          setImportFile(null);
          setImportUrl('');
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsImportModalOpen(false);
              setImportFile(null);
              setImportUrl('');
            }}
          >
            Cancel
          </Button>,
          <Button
            key="import"
            type="primary"
            loading={loading}
            onClick={handleImport}
          >
            Import
          </Button>,
        ]}
        width={600}
      >
        <Tabs
          activeKey={activeImportTab}
          onChange={setActiveImportTab}
          items={[
            {
              key: 'file',
              label: 'Upload JSON File',
              children: (
                <div className="py-4">
                  <Dragger
                    beforeUpload={handleFileUpload}
                    showUploadList={false}
                    accept=".json"
                    className="rounded-lg"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined className="text-4xl text-primary/60" />
                    </p>
                    <p className="ant-upload-text text-base font-medium">
                      Click or drag JSON file to this area
                    </p>
                    <p className="ant-upload-hint text-sm text-background-dark/60 dark:text-background-light/60">
                      Support for single JSON file upload containing agent configurations
                    </p>
                  </Dragger>
                  {importFile && (
                    <div className="mt-3 rounded-lg bg-background-dark/5 p-3 dark:bg-background-light/5">
                      <div className="flex items-center gap-2">
                        <FileTextOutlined className="text-primary" />
                        <span className="text-sm font-medium">{importFile.name}</span>
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => setImportFile(null)}
                          className="ml-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'url',
              label: 'Import from URL',
              children: (
                <div className="py-4">
                  <Form.Item
                    label="JSON URL"
                    help="Enter the URL of a JSON file containing agent configurations"
                  >
                    <Input
                      placeholder="https://example.com/agents.json"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      prefix={<LinkOutlined />}
                    />
                  </Form.Item>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
