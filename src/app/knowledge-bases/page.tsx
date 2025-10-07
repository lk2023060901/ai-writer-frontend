'use client';

import React, { useState, useEffect } from 'react';
import { Button, Upload, Tabs, Progress, App, Modal, Form, Input, Select, Slider, InputNumber } from 'antd';
import {
  PlusOutlined,
  SettingOutlined,
  SearchOutlined,
  InboxOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  LinkOutlined,
  DeleteOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { authService } from '@/services/auth';
import { knowledgeBaseService, KnowledgeBase as KBType, Document as APIDocument, DocumentProvider } from '@/services/knowledgeBase';
import { providerService, AIProviderWithModels } from '@/services/provider';
import { useRouter } from 'next/navigation';

const { Dragger } = Upload;

export default function KnowledgeBasesPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [knowledgeBases, setKnowledgeBases] = useState<KBType[]>([]);
  const [selectedKb, setSelectedKb] = useState<string | null>(null);
  const [documents, setDocuments] = useState<APIDocument[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalTabKey, setModalTabKey] = useState('general');
  const [embeddingModel, setEmbeddingModel] = useState<string>();
  const [embeddingDimension, setEmbeddingDimension] = useState<number>();
  const [aiProviders, setAiProviders] = useState<AIProviderWithModels[]>([]);
  const [documentProviders, setDocumentProviders] = useState<DocumentProvider[]>([]);
  const [loadingAiProviders, setLoadingAiProviders] = useState(false);
  const [loadingDocProviders, setLoadingDocProviders] = useState(false);
  const [loadingKbs, setLoadingKbs] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [kbPage, setKbPage] = useState(1);
  const [kbHasMore, setKbHasMore] = useState(true);
  const [kbSearchKeyword, setKbSearchKeyword] = useState('');
  const [docPage, setDocPage] = useState(1);
  const [docHasMore, setDocHasMore] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      message.warning('Please login first');
      router.push('/login');
    } else {
      loadKnowledgeBases(1, true);
    }
  }, [router]);

  const loadKnowledgeBases = async (page: number, reset: boolean = false) => {
    if (loadingKbs || (!reset && !kbHasMore)) return;

    setLoadingKbs(true);
    try {
      const response = await knowledgeBaseService.getKnowledgeBases({
        page,
        page_size: 20,
        keyword: kbSearchKeyword || undefined,
      });

      // 检查响应状态
      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || 'Failed to load knowledge bases');
        return;
      }

      if (response.data) {
        const newKbs = response.data.items;
        setKnowledgeBases(reset ? newKbs : [...knowledgeBases, ...newKbs]);
        setKbPage(page);
        setKbHasMore(page < response.data.pagination.total_page);

        // Select first KB if none selected
        if (reset && newKbs.length > 0 && !selectedKb) {
          setSelectedKb(newKbs[0].id);
        }
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load knowledge bases');
    } finally {
      setLoadingKbs(false);
    }
  };

  const handleKbScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (bottom && kbHasMore && !loadingKbs) {
      loadKnowledgeBases(kbPage + 1);
    }
  };

  const handleDocScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (bottom && docHasMore && !loadingDocs && selectedKb) {
      loadDocuments(selectedKb, docPage + 1);
    }
  };


  const loadAiProviders = async () => {
    setLoadingAiProviders(true);
    try {
      const response = await providerService.getProvidersWithModels();
      if (response.error) {
        message.error(response.error);
        return;
      }
      if (response.data) {
        setAiProviders(response.data);


      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load AI providers');
    } finally {
      setLoadingAiProviders(false);
    }
  };

  useEffect(() => {
    if (isCreateModalOpen) {
      loadAiProviders();
      loadDocumentProviders();
    }
  }, [isCreateModalOpen]);

  const loadDocumentProviders = async () => {
    setLoadingDocProviders(true);
    try {
      const response = await knowledgeBaseService.getDocumentProviders();
      if ((response.code === 200 || response.code === 0) && response.data) {
        setDocumentProviders(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load document providers:', error);
    } finally {
      setLoadingDocProviders(false);
    }
  };

  const handleEmbeddingModelChange = (modelId: string) => {
    setEmbeddingModel(modelId);

    // Find the selected model and get its default embedding dimension
    for (const provider of aiProviders) {
      const model = provider.models?.find(m => m.id === modelId);
      if (model && model.embedding_dimensions) {
        setEmbeddingDimension(model.embedding_dimensions);
        form.setFieldsValue({ embedding_dimension: model.embedding_dimensions });
        break;
      }
    }
  };

  const handleRefreshEmbeddingDimension = () => {
    if (embeddingModel) {
      for (const provider of aiProviders) {
        const model = provider.models?.find(m => m.id === embeddingModel);
        if (model && model.embedding_dimensions) {
          setEmbeddingDimension(model.embedding_dimensions);
          form.setFieldsValue({ embedding_dimension: model.embedding_dimensions });
          message.success(`已重置为默认维度: ${model.embedding_dimensions}`);
          break;
        }
      }
    } else {
      message.warning('请先选择嵌入模型');
    }
  };

  const loadDocuments = async (kbId: string, page: number, reset: boolean = false) => {
    if (loadingDocs || (!reset && !docHasMore)) return;

    setLoadingDocs(true);
    try {
      const response = await knowledgeBaseService.getDocuments(kbId, {
        page,
        page_size: 20,
      });

      if (response.error) {
        message.error(response.error);
        return;
      }

      if (response.data) {
        const newDocs = response.data.items;
        setDocuments(reset ? newDocs : [...documents, ...newDocs]);
        setDocPage(page);
        setDocHasMore(page < response.data.pagination.total_page);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (selectedKb) {
      loadDocuments(selectedKb, 1, true);
    } else {
      setDocuments([]);
    }
  }, [selectedKb]);

  const handleCreateKnowledgeBase = async (values: any) => {
    try {
      const createData: any = {
        name: values.name,
        embedding_model_id: values.embedding_model,
      };

      // Add optional fields
      if (values.rerank_model) {
        createData.rerank_model_id = values.rerank_model;
      }
      if (values.chunk_size) {
        createData.chunk_size = values.chunk_size;
      }
      if (values.overlap_size !== undefined) {
        createData.chunk_overlap = values.overlap_size;
      }
      if (values.chunk_strategy) {
        createData.chunk_strategy = values.chunk_strategy;
      }

      const response = await knowledgeBaseService.createKnowledgeBase(createData);

      if (response.error) {
        message.error(`Failed to create knowledge base: ${response.error}`);
        return;
      }

      if (response.data) {
        message.success('✅ Knowledge base created successfully');

        // Close modal and reset form
        setIsCreateModalOpen(false);
        form.resetFields();
        setModalTabKey('general');
        setEmbeddingModel(undefined);

        // Reload knowledge bases list
        loadKnowledgeBases(1, true);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to create knowledge base');
    }
  };

  const handleUpload = (file: any) => {
    if (!selectedKb) {
      message.error('Please select a knowledge base first');
      return Upload.LIST_IGNORE;
    }

    let documentId: string | null = null;
    let documentAdded = false;

    // Use SSE upload
    knowledgeBaseService.uploadDocumentSSE(
      selectedKb,
      file,
      (event) => {
        // 处理包含文档信息的事件（主要是 status 事件）
        if (!documentAdded && event.document) {
          const doc = event.document;
          documentId = doc.id;
          documentAdded = true;

          const newDoc: APIDocument = {
            id: doc.id,
            knowledge_base_id: doc.knowledge_base_id || selectedKb,
            file_name: doc.file_name || file.name,
            file_type: doc.file_type || file.name.split('.').pop() || 'txt',
            file_size: doc.file_size || file.size,
            process_status: doc.process_status || 'processing',
            chunk_count: doc.chunk_count || 0,
            created_at: doc.created_at || new Date().toISOString(),
            updated_at: doc.updated_at || new Date().toISOString(),
          };

          // 立即添加到文档列表
          setDocuments((prev) => [newDoc, ...prev]);
        }

        // 处理进度更新和状态变化
        if (documentId && event.document) {
          const doc = event.document;
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === documentId
                ? {
                  ...d,
                  process_status: doc.process_status || d.process_status,
                  chunk_count: doc.chunk_count || d.chunk_count,
                  updated_at: doc.updated_at || d.updated_at
                }
                : d
            )
          );
        }

        // 处理消息通知
        if (event.message && documentId && event.document) {
          const doc = event.document;
          if (doc.process_status === 'completed') {
            message.success(`${file.name} processed successfully`);
            // 只更新知识库计数，不重新加载整个列表
            setKnowledgeBases(prev =>
              prev.map(kb =>
                kb.id === selectedKb
                  ? { ...kb, document_count: kb.document_count + 1 }
                  : kb
              )
            );
          } else if (doc.process_status === 'failed') {
            message.error(`${file.name} processing failed`);
          }
        }
      }
    ).then(() => {
      // Upload complete
    }).catch((error) => {

      // 如果文档已经添加到列表，更新其状态为失败
      if (documentId) {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId
              ? { ...doc, process_status: 'failed' }
              : doc
          )
        );
      }

      message.error(error.message || 'Upload failed');
    });

    return Upload.LIST_IGNORE;
  };

  const handleDelete = async (docId: string) => {
    if (!selectedKb) return;

    try {
      const response = await knowledgeBaseService.deleteDocument(selectedKb, docId);

      if (response.error) {
        message.error(`Delete failed: ${response.error}`);
        return;
      }

      message.success('Document deleted successfully');

      // Reload documents list
      loadDocuments(selectedKb, 1, true);

      // Reload KB list to update document count
      loadKnowledgeBases(kbPage, false);
    } catch (error: any) {
      message.error(error.message || 'Delete failed');
    }
  };

  const handleReprocess = async (docId: string) => {
    if (!selectedKb) return;

    try {
      const response = await knowledgeBaseService.reprocessDocument(selectedKb, docId);

      if (response.error) {
        message.error(`Reprocess failed: ${response.error}`);
        return;
      }

      message.info('Document added to processing queue');

      // Reload documents to show updated status
      loadDocuments(selectedKb, 1, true);
    } catch (error: any) {
      message.error(error.message || 'Reprocess failed');
    }
  };

  const getDocumentIcon = (type: string, status: string) => {
    if (type === 'pdf') {
      return <FilePdfOutlined className="text-2xl text-red-600 dark:text-red-400" />;
    } else if (type === 'url') {
      return <LinkOutlined className="text-2xl text-blue-600 dark:text-blue-400" />;
    } else {
      return <FileTextOutlined className="text-2xl text-blue-600 dark:text-blue-400" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string): string => {
    // 处理后端返回的特殊时间格式
    if (!dateString || dateString.startsWith('0001-01-01')) {
      return 'Just now';
    }

    const date = new Date(dateString);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pdf') return doc.file_type === 'pdf';
    if (activeTab === 'text') return doc.file_type === 'txt' || doc.file_type === 'md';
    return true;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar activeTabKey="knowledge" />
      <div className="grid h-[calc(100vh-64px)] grid-cols-12">
        {/* Knowledge Bases Sidebar */}
        <div className="col-span-3 overflow-y-auto border-r border-background-dark/10 bg-background-light p-4 dark:border-background-light/10 dark:bg-background-dark">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="w-full"
            size="large"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Knowledge Base
          </Button>

          <div className="mt-6 flex-1 overflow-y-auto" onScroll={handleKbScroll}>
            <nav className="space-y-2">
              {knowledgeBases.map((kb) => (
                <div
                  key={kb.id}
                  onClick={() => setSelectedKb(kb.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${selectedKb === kb.id
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-background-dark/70 hover:bg-background-dark/5 dark:text-background-light/70 dark:hover:bg-background-light/5'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{kb.is_official ? '🏢' : '📚'}</span>
                    <span>{kb.name}</span>
                  </div>
                  <span className="text-xs text-background-dark/50 dark:text-background-light/50">
                    {kb.document_count}
                  </span>
                </div>
              ))}
              {loadingKbs && (
                <div className="py-4 text-center text-sm text-background-dark/50 dark:text-background-light/50">
                  Loading...
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Documents Area */}
        <div className="col-span-9 flex flex-col bg-white dark:bg-background-dark/50">
          {/* Fixed Header Area */}
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-background-dark/60 dark:text-background-light/60">
                Embedding Model: text-embedding-ada-002
              </p>
              <Button
                type="text"
                icon={<SearchOutlined />}
                className="flex h-9 w-9 items-center justify-center"
              />
            </div>

            <hr className="my-4 border-background-dark/10 dark:border-background-light/10" />

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                { key: 'all', label: 'All' },
                { key: 'text', label: 'Text' },
                { key: 'pdf', label: 'PDF' },
                { key: 'url', label: 'URL' },
              ]}
              className="mb-0"
            />

            <div className="mt-4">
              <Dragger
                multiple
                beforeUpload={handleUpload}
                showUploadList={false}
                className="rounded-lg"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-4xl text-primary/60" />
                </p>
                <p className="ant-upload-text text-base font-medium">
                  Click or drag files to this area
                </p>
                <p className="ant-upload-hint text-sm text-background-dark/60 dark:text-background-light/60">
                  Support for multiple files upload. Select multiple files or drag them here.
                </p>
              </Dragger>


            </div>
          </div>

          {/* Scrollable Documents Area */}
          <div className="flex-1 overflow-y-auto p-6 pt-0" onScroll={handleDocScroll}>
            <div className="mt-4 space-y-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-lg border border-background-dark/10 bg-background-light p-4 dark:border-background-light/10 dark:bg-background-dark/30"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${doc.file_type === 'pdf'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}
                  >
                    {getDocumentIcon(doc.file_type, doc.process_status)}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-background-dark dark:text-background-light">
                      {doc.file_name}
                    </p>
                    <p className="text-sm text-background-dark/60 dark:text-background-light/60">
                      {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)} • {doc.chunk_count} chunks
                    </p>

                    {doc.process_status === 'processing' && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress percent={0} size="small" status="active" showInfo={false} />
                        <span className="text-xs text-background-dark/50">Processing...</span>
                      </div>
                    )}
                    {doc.process_status === 'failed' && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">Processing failed</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.process_status === 'pending' && (
                      <>
                        <Button
                          type="text"
                          icon={<ClockCircleOutlined />}
                          style={{ color: '#ea580c' }}
                          disabled
                          title="Waiting for processing"
                        />
                      </>
                    )}
                    {doc.process_status === 'completed' && (
                      <>
                        <Button
                          type="text"
                          icon={<SyncOutlined />}
                          onClick={() => handleReprocess(doc.id)}
                          title="Reprocess document"
                        />
                        <Button
                          type="text"
                          icon={<CheckCircleOutlined />}
                          style={{ color: '#16a34a' }}
                          title="Completed"
                        />
                      </>
                    )}
                    {doc.process_status === 'processing' && (
                      <Button
                        type="text"
                        icon={<SyncOutlined spin />}
                        disabled
                        title="Processing"
                      />
                    )}
                    {doc.process_status === 'failed' && (
                      <>
                        <Button
                          type="text"
                          icon={<SyncOutlined />}
                          onClick={() => handleReprocess(doc.id)}
                          title="Retry processing"
                        />
                        <Button
                          type="text"
                          icon={<CloseCircleOutlined />}
                          style={{ color: '#dc2626' }}
                          title="Processing failed"
                        />
                      </>
                    )}
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDelete(doc.id)}
                      title="Delete document"
                    />
                  </div>
                </div>
              ))}
              {loadingDocs && (
                <div className="py-4 text-center text-sm text-background-dark/50 dark:text-background-light/50">
                  Loading documents...
                </div>
              )}
            </div>

            {filteredDocuments.length === 0 && !loadingDocs && (
              <div className="flex flex-1 items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-lg text-background-dark/60 dark:text-background-light/60">
                    {selectedKb ? 'No documents found' : 'Select a knowledge base to view documents'}
                  </p>
                  {selectedKb && (
                    <p className="mt-2 text-sm text-background-dark/50 dark:text-background-light/50">
                      Upload your first document to get started
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Knowledge Base Modal */}
      <Modal
        title="Create Knowledge Base"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
          setModalTabKey('general');
          setEmbeddingModel(undefined);
        }}
        footer={null}
        width={800}
      >
        <div className="flex gap-6">
          {/* Left Sidebar - Tabs */}
          <div className="w-40">
            <Tabs
              activeKey={modalTabKey}
              onChange={setModalTabKey}
              tabPosition="left"
              items={[
                {
                  key: 'general',
                  label: '常规设置',
                },
                {
                  key: 'advanced',
                  label: '高级设置',
                },
              ]}
            />
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateKnowledgeBase}
            >
              {modalTabKey === 'general' && (
                <>
                  <Form.Item
                    label="名称"
                    name="name"
                    rules={[{ required: true, message: 'Please enter knowledge base name' }]}
                  >
                    <Input placeholder="Enter knowledge base name" />
                  </Form.Item>

                  <Form.Item
                    label="文档处理服务商"
                    name="document_provider"
                    tooltip="选择用于处理文档的服务商"
                  >
                    <Select
                      placeholder="Select document provider (optional)"
                      allowClear
                      loading={loadingDocProviders}
                    >
                      {documentProviders.map((provider) => (
                        <Select.Option key={provider.id} value={provider.id}>
                          {provider.provider_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="嵌入模型"
                    name="embedding_model"
                    rules={[{ required: true, message: 'Please select an embedding model' }]}
                  >
                    <Select
                      placeholder="Select embedding model"
                      onChange={handleEmbeddingModelChange}
                      loading={loadingAiProviders}
                    >
                      {aiProviders.map((provider) => {
                        const embeddingModels = provider.models?.filter((model) =>
                          model.capabilities?.includes('embedding')
                        ) || [];

                        if (embeddingModels.length === 0) return null;

                        return (
                          <Select.OptGroup key={provider.id} label={provider.provider_name}>
                            {embeddingModels.map((model) => (
                              <Select.Option key={model.id} value={model.id}>
                                {model.display_name || model.model_name}
                              </Select.Option>
                            ))}
                          </Select.OptGroup>
                        );
                      })}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="嵌入维度"
                    name="embedding_dimension"
                    tooltip="向量维度，会在选择嵌入模型后自动填充默认值"
                  >
                    <Input
                      type="number"
                      placeholder="Auto-filled from embedding model"
                      suffix={
                        <SyncOutlined
                          onClick={handleRefreshEmbeddingDimension}
                          style={{ cursor: 'pointer', color: '#1890ff' }}
                          title="重置为默认维度"
                        />
                      }
                    />
                  </Form.Item>

                  <Form.Item label="重排模型" name="rerank_model">
                    <Select
                      placeholder="Select rerank model"
                      allowClear
                      loading={loadingAiProviders}
                    >
                      {aiProviders.map((provider) => {
                        const rerankModels = provider.models?.filter((model) =>
                          model.capabilities?.includes('rerank')
                        ) || [];

                        if (rerankModels.length === 0) return null;

                        return (
                          <Select.OptGroup key={provider.id} label={provider.provider_name}>
                            {rerankModels.map((model) => (
                              <Select.Option key={model.id} value={model.id}>
                                {model.display_name || model.model_name}
                              </Select.Option>
                            ))}
                          </Select.OptGroup>
                        );
                      })}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="检索文档片段数量"
                    name="retrieval_top_k"
                    initialValue={5}
                    tooltip="从知识库中检索的文档片段数量，范围 1-50"
                  >
                    <Slider
                      min={1}
                      max={50}
                      marks={{
                        1: '1',
                        10: '10',
                        20: '20',
                        30: '30',
                        40: '40',
                        50: '50'
                      }}
                    />
                  </Form.Item>
                </>
              )}

              {modalTabKey === 'advanced' && (
                <>
                  <Form.Item
                    label="分段大小"
                    name="chunk_size"
                    initialValue={1000}
                    tooltip="文档分块大小，范围 100-10000，不填则自动设置"
                  >
                    <InputNumber
                      placeholder="Enter chunk size"
                      style={{ width: '100%' }}
                      min={100}
                      max={10000}
                    />
                  </Form.Item>

                  <Form.Item
                    label="重叠大小"
                    name="overlap_size"
                    initialValue={0}
                    tooltip="文档分块重叠大小，默认 0"
                  >
                    <InputNumber
                      placeholder="Enter overlap size"
                      style={{ width: '100%' }}
                      min={0}
                      max={1000}
                    />
                  </Form.Item>

                  <Form.Item
                    label="分块策略"
                    name="chunk_strategy"
                    initialValue="recursive"
                    tooltip="文档分块策略，默认 recursive"
                  >
                    <Select placeholder="Select chunk strategy">
                      <Select.Option value="recursive">Recursive</Select.Option>
                      <Select.Option value="fixed">Fixed Size</Select.Option>
                      <Select.Option value="paragraph">Paragraph</Select.Option>
                    </Select>
                  </Form.Item>
                </>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={() => {
                  setIsCreateModalOpen(false);
                  form.resetFields();
                  setModalTabKey('general');
                  setEmbeddingModel(undefined);
                }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  创建
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
