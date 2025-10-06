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
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { authService } from '@/services/auth';
import { knowledgeBaseService, KnowledgeBase as KBType, Document as APIDocument } from '@/services/knowledgeBase';
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
  const [aiProviders, setAiProviders] = useState<AIProviderWithModels[]>([]);
  const [loadingAiProviders, setLoadingAiProviders] = useState(false);
  const [loadingKbs, setLoadingKbs] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [kbPage, setKbPage] = useState(1);
  const [kbHasMore, setKbHasMore] = useState(true);
  const [kbSearchKeyword, setKbSearchKeyword] = useState('');
  const [docPage, setDocPage] = useState(1);
  const [docHasMore, setDocHasMore] = useState(true);
  const [uploadFileList, setUploadFileList] = useState<any[]>([]);

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

      if (response.error) {
        message.error(response.error);
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

        // Debug log - Full API response
        console.log('🔍 Full API Response:', JSON.stringify(response.data, null, 2));

        // Debug log for embedding models
        const totalEmbeddingModels = response.data.reduce((count, provider) => {
          const embeddingCount = provider.models?.filter(m => m.capabilities?.includes('embedding')).length || 0;

          // Log each provider's embedding models
          if (embeddingCount > 0) {
            console.log(`📦 Provider "${provider.provider_name}" has ${embeddingCount} embedding models:`,
              provider.models.filter(m => m.capabilities?.includes('embedding')).map(m => ({
                id: m.id,
                name: m.model_name,
                capabilities: m.capabilities
              }))
            );
          }

          return count + embeddingCount;
        }, 0);

        if (totalEmbeddingModels === 0) {
          console.warn('⚠️ No embedding models found. Please check if backend has configured embedding models.');
          console.warn('📋 Total providers:', response.data.length);
          console.warn('📋 Total models:', response.data.reduce((sum, p) => sum + (p.models?.length || 0), 0));
        } else {
          console.log(`✅ Loaded ${totalEmbeddingModels} embedding models from ${response.data.length} AI providers`);
        }
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load AI providers');
      console.error('❌ Error loading AI providers:', error);
    } finally {
      setLoadingAiProviders(false);
    }
  };

  useEffect(() => {
    if (isCreateModalOpen) {
      loadAiProviders();
    }
  }, [isCreateModalOpen]);

  const handleEmbeddingModelChange = (modelId: string) => {
    setEmbeddingModel(modelId);
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
        console.log('📄 Loaded documents:', newDocs.map(d => ({
          id: d.id,
          name: d.file_name,
          status: d.process_status,
          chunk_count: d.chunk_count
        })));
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

      console.log('📤 Creating knowledge base with data:', createData);

      const response = await knowledgeBaseService.createKnowledgeBase(createData);

      if (response.error) {
        message.error(`Failed to create knowledge base: ${response.error}`);
        console.error('❌ Create KB error:', response.error);
        return;
      }

      if (response.data) {
        message.success('✅ Knowledge base created successfully');
        console.log('✅ Created KB:', response.data);

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
      console.error('❌ Exception creating KB:', error);
    }
  };

  const handleUpload = (file: any) => {
    if (!selectedKb) {
      message.error('Please select a knowledge base first');
      return Upload.LIST_IGNORE;
    }

    const uid = `${Date.now()}-${file.name}`;
    let documentId: string | null = null;
    let documentAdded = false;

    // Add file to upload list with uploading status
    setUploadFileList((prev) => [
      ...prev,
      {
        uid,
        name: file.name,
        status: 'uploading',
        percent: 0,
      },
    ]);

    // Use SSE upload
    knowledgeBaseService.uploadDocumentSSE(
      selectedKb,
      file,
      (event) => {
        console.log('📡 SSE Event:', event);

        // 文档创建成功，立即添加到列表
        if (event.type === 'document_created' && !documentAdded) {
          documentId = event.document_id || event.id;
          documentAdded = true;

          const newDoc: APIDocument = {
            id: documentId,
            knowledge_base_id: selectedKb,
            file_name: file.name,
            file_type: event.file_type || file.name.split('.').pop() || 'txt',
            file_size: file.size,
            process_status: 'processing',
            chunk_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // 立即添加到文档列表，显示处理中状态
          setDocuments((prev) => [newDoc, ...prev]);
        }

        // 处理进度更新
        if (event.type === 'processing' && documentId) {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === documentId
                ? { ...doc, chunk_count: event.chunks_processed || 0 }
                : doc
            )
          );
        }

        // 处理完成
        if (event.status === 'completed') {
          setUploadFileList((prev) =>
            prev.map((item) =>
              item.uid === uid ? { ...item, status: 'done', percent: 100 } : item
            )
          );

          if (documentId) {
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === documentId
                  ? { ...doc, process_status: 'completed', chunk_count: event.total_chunks || doc.chunk_count }
                  : doc
              )
            );
          }

          message.success(`${file.name} processed successfully`);

          setTimeout(() => {
            setUploadFileList((prev) => prev.filter((item) => item.uid !== uid));
          }, 2000);

          loadKnowledgeBases(kbPage, false);
        }
      }
    ).then((result) => {
      console.log('✅ Upload complete:', result);
    }).catch((error) => {
      console.error('❌ SSE Upload error:', error);

      setUploadFileList((prev) =>
        prev.map((item) =>
          item.uid === uid ? { ...item, status: 'error', percent: 0 } : item
        )
      );

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
      console.log('✅ Document deleted');

      // Reload documents list
      loadDocuments(selectedKb, 1, true);

      // Reload KB list to update document count
      loadKnowledgeBases(kbPage, false);
    } catch (error: any) {
      message.error(error.message || 'Delete failed');
      console.error('❌ Delete error:', error);
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
      console.log('✅ Document reprocessing started');

      // Reload documents to show updated status
      loadDocuments(selectedKb, 1, true);
    } catch (error: any) {
      message.error(error.message || 'Reprocess failed');
      console.error('❌ Reprocess error:', error);
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
    const date = new Date(dateString);
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
      <div className="grid h-full grid-cols-12">
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
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    selectedKb === kb.id
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
        <div className="col-span-9 flex flex-col overflow-y-auto bg-white p-6 dark:bg-background-dark/50">
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
              beforeUpload={handleUpload}
              showUploadList={false}
              className="rounded-lg"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-4xl text-primary/60" />
              </p>
              <p className="ant-upload-text text-base font-medium">
                Click or drag file to this area
              </p>
              <p className="ant-upload-hint text-sm text-background-dark/60 dark:text-background-light/60">
                Support for single file upload
              </p>
            </Dragger>

            {/* Custom upload list */}
            {uploadFileList.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadFileList.map((file) => (
                  <div
                    key={file.uid}
                    className="flex items-center gap-3 rounded-lg border border-background-dark/10 bg-background-light p-3 dark:border-background-light/10 dark:bg-background-dark/30"
                  >
                    <FileTextOutlined className="text-2xl text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-background-dark dark:text-background-light">
                        {file.name}
                      </p>
                      <p
                        className={`text-xs ${
                          file.status === 'done'
                            ? 'text-green-600 dark:text-green-400'
                            : file.status === 'error'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-background-dark/60 dark:text-background-light/60'
                        }`}
                      >
                        {file.status === 'uploading' && 'Uploading...'}
                        {file.status === 'done' && 'Upload completed'}
                        {file.status === 'error' && 'Upload failed'}
                      </p>
                    </div>
                    {file.status === 'uploading' && (
                      <SyncOutlined spin className="text-lg text-blue-600" />
                    )}
                    {file.status === 'done' && (
                      <CheckCircleOutlined className="text-lg text-green-600" />
                    )}
                    {file.status === 'error' && (
                      <CheckCircleOutlined className="text-lg text-red-600" />
                    )}
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => setUploadFileList((prev) => prev.filter((item) => item.uid !== file.uid))}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 rounded-lg border border-background-dark/10 bg-background-light p-4 dark:border-background-light/10 dark:bg-background-dark/30"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    doc.file_type === 'pdf'
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
                        className="text-orange-600 dark:text-orange-400"
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
                        className="text-green-600 dark:text-green-400"
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
                    <Button
                      type="text"
                      icon={<SyncOutlined />}
                      onClick={() => handleReprocess(doc.id)}
                      title="Retry processing"
                    />
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
