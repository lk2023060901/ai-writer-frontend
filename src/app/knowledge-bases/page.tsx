'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Upload, Tabs, Progress, App, Modal, Form, Input, Select, Slider, InputNumber, Checkbox } from 'antd';
import { useDocumentUpload, UploadedDocument } from '@/hooks/useDocumentUpload';
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

interface KnowledgeBaseFormValues {
  name: string;
  embedding_model: string;
  rerank_model?: string;
  chunk_size?: number;
  overlap_size?: number;
  chunk_strategy?: string;
}

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
  const [embeddingModelName, setEmbeddingModelName] = useState<string>('');
  const [selectedKbIds, setSelectedKbIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isDeleteDocModalOpen, setIsDeleteDocModalOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const uploadTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const pendingFilesRef = React.useRef<File[]>([]);
  const isUploadingRef = React.useRef(false);
  const isInitialLoadRef = React.useRef(false);

  // Stabilize callbacks with useCallback to prevent hook recreation
  const handleFileUploaded = useCallback((document: UploadedDocument) => {
    // Add document to list immediately
    const newDoc: APIDocument = {
      id: document.id,
      knowledge_base_id: document.knowledge_base_id || selectedKb!,
      file_name: document.file_name || document.filename || 'unknown',
      file_type: document.file_type,
      file_size: document.file_size,
      process_status: document.process_status || document.status || 'pending',
      chunk_count: document.chunk_count || 0,
      created_at: document.created_at || new Date().toISOString(),
      updated_at: document.updated_at || new Date().toISOString(),
    };

    setDocuments((prev) => {
      const exists = prev.some(doc => doc.id === newDoc.id);
      if (exists) {
        return prev.map(doc => doc.id === newDoc.id ? newDoc : doc);
      }
      return [newDoc, ...prev];
    });
  }, [selectedKb]);

  const handleStatusUpdate = useCallback((document: UploadedDocument) => {
    // Update document status in real-time
    const status = document.status;

    setDocuments((prev) =>
      prev.map(doc =>
        doc.id === document.id
          ? {
              ...doc,
              process_status: status || doc.process_status,
              chunk_count: document.chunk_count || doc.chunk_count,
              updated_at: new Date().toISOString(),
            }
          : doc
      )
    );

    // Show notification when document is fully processed
    if (status === 'completed') {
      message.success(`${document.file_name} processed successfully`, 2);
    } else if (status === 'failed') {
      message.error(`${document.file_name} processing failed`, 2);
    }
  }, [message]);

  const handleUploadComplete = useCallback((result: { successCount: number; failedCount: number; processedCount: number }) => {
    message.success(`Successfully uploaded and processed ${result.processedCount} file(s)`);

    // Update knowledge base document count
    setKnowledgeBases(prev =>
      prev.map(kb =>
        kb.id === selectedKb
          ? { ...kb, document_count: kb.document_count + result.successCount }
          : kb
      )
    );

    setUploadingFiles([]);
  }, [selectedKb, message]);

  const handleUploadError = useCallback((error: Error) => {
    message.error(error.message || 'Upload failed');
    setUploadingFiles([]);
  }, [message]);

  // 使用 ref 存储最新的回调，避免依赖变化导致 hook 重建
  const handleFileUploadedRef = React.useRef(handleFileUploaded);
  const handleStatusUpdateRef = React.useRef(handleStatusUpdate);
  const handleUploadCompleteRef = React.useRef(handleUploadComplete);
  const handleUploadErrorRef = React.useRef(handleUploadError);

  // 保持 ref 始终指向最新的回调
  useEffect(() => {
    handleFileUploadedRef.current = handleFileUploaded;
    handleStatusUpdateRef.current = handleStatusUpdate;
    handleUploadCompleteRef.current = handleUploadComplete;
    handleUploadErrorRef.current = handleUploadError;
  }, [handleFileUploaded, handleStatusUpdate, handleUploadComplete, handleUploadError]);

  // 创建稳定的包装函数（永远不变，不会导致 hook 重建）
  const stableHandleFileUploaded = useCallback((doc: UploadedDocument) => {
    handleFileUploadedRef.current(doc);
  }, []);

  const stableHandleStatusUpdate = useCallback((doc: UploadedDocument) => {
    handleStatusUpdateRef.current(doc);
  }, []);

  const stableHandleUploadComplete = useCallback((result: { successCount: number; failedCount: number; processedCount: number }) => {
    handleUploadCompleteRef.current(result);
    isUploadingRef.current = false; // 重置上传状态
  }, []);

  const stableHandleUploadError = useCallback((error: Error) => {
    handleUploadErrorRef.current(error);
    isUploadingRef.current = false; // 重置上传状态
  }, []);

  // Use document upload hook with stable callbacks
  const { upload: uploadDocuments, uploading, progress } = useDocumentUpload({
    knowledgeBaseId: selectedKb || '',
    onFileUploaded: stableHandleFileUploaded,
    onStatusUpdate: stableHandleStatusUpdate,
    onComplete: stableHandleUploadComplete,
    onError: stableHandleUploadError,
  });

  const loadKnowledgeBases = useCallback(async (page: number, reset: boolean = false) => {
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
        setKnowledgeBases(reset ? newKbs : (prev) => [...prev, ...newKbs]);
        setKbPage(page);
        setKbHasMore(page < response.data.pagination.total_page);

        // Select first KB if none selected (使用函数式更新避免依赖 selectedKb)
        if (reset && newKbs.length > 0 && newKbs[0]) {
          setSelectedKb(prev => prev || newKbs[0]!.id);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load knowledge bases';
      message.error(errorMessage);
    } finally {
      setLoadingKbs(false);
    }
  }, [loadingKbs, kbHasMore, kbSearchKeyword, message]);
  // ✅ 移除 selectedKb 依赖，避免无限循环

  useEffect(() => {
    // ✅ 防止重复初始化加载
    if (isInitialLoadRef.current) {
      return;
    }

    if (!authService.isAuthenticated()) {
      message.warning('Please login first');
      router.push('/login');
    } else {
      console.log('🔄 Initial load: loading knowledge bases...');
      isInitialLoadRef.current = true;
      loadKnowledgeBases(1, true);
    }
  }, [message, router, loadKnowledgeBases]);

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
      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || 'Failed to load AI providers');
        return;
      }
      if (response.data) {
        setAiProviders(response.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load AI providers';
      message.error(errorMessage);
    } finally {
      setLoadingAiProviders(false);
    }
  };

  const loadDocumentProviders = useCallback(async () => {
    setLoadingDocProviders(true);
    try {
      const response = await knowledgeBaseService.getDocumentProviders();
      if ((response.code === 200 || response.code === 0) && response.data) {
        setDocumentProviders(response.data);
      }
    } catch (error) {
      console.error('Failed to load document providers:', error);
    } finally {
      setLoadingDocProviders(false);
    }
  }, []);

  useEffect(() => {
    if (isCreateModalOpen) {
      loadAiProviders();
      loadDocumentProviders();
    }
  }, [isCreateModalOpen, loadDocumentProviders]);

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

  const loadDocuments = useCallback(async (kbId: string, page: number, reset: boolean = false) => {
    if (loadingDocs || (!reset && !docHasMore)) return;

    setLoadingDocs(true);
    try {
      const response = await knowledgeBaseService.getDocuments(kbId, {
        page,
        page_size: 20,
      });

      if (response.code !== 200 && response.code !== 0) {
        message.error(response.message || 'Failed to load documents');
        return;
      }

      if (response.data) {
        const newDocs = response.data.items;
        setDocuments(reset ? newDocs : (prevDocs) => [...prevDocs, ...newDocs]);
        setDocPage(page);
        setDocHasMore(page < response.data.pagination.total_page);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load documents';
      message.error(errorMessage);
    } finally {
      setLoadingDocs(false);
    }
  }, [loadingDocs, docHasMore, message]);

  // loadEmbeddingModelInfo 必须在 useEffect 之前定义
  const loadEmbeddingModelInfo = useCallback(async (modelId: string) => {
    try {
      const response = await providerService.getAIModel(modelId);
      if (response.data) {
        setEmbeddingModelName(response.data.display_name || response.data.model_name);
      }
    } catch (error) {
      console.error('Failed to load embedding model info:', error);
      setEmbeddingModelName(modelId); // Fallback to model ID
    }
  }, []);

  // 使用 ref 来存储最新的 knowledgeBases，避免依赖导致重新运行
  const knowledgeBasesRef = React.useRef(knowledgeBases);
  useEffect(() => {
    knowledgeBasesRef.current = knowledgeBases;
  }, [knowledgeBases]);

  useEffect(() => {
    if (selectedKb) {
      console.log(`📂 Loading documents for knowledge base: ${selectedKb}`);
      loadDocuments(selectedKb, 1, true);

      // Load embedding model info - 使用 ref 中的最新值
      const kb = knowledgeBasesRef.current.find(k => k.id === selectedKb);
      if (kb?.embedding_model_id) {
        console.log(`🔍 Loading embedding model info: ${kb.embedding_model_id}`);
        loadEmbeddingModelInfo(kb.embedding_model_id);
      }
    } else {
      setDocuments([]);
      setEmbeddingModelName('');
    }
  }, [selectedKb, loadDocuments, loadEmbeddingModelInfo]); // ✅ 依赖稳定的函数

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKbIds(knowledgeBases.map(kb => kb.id));
    } else {
      setSelectedKbIds([]);
    }
  };

  const handleSelectKb = (kbId: string, checked: boolean) => {
    if (checked) {
      setSelectedKbIds([...selectedKbIds, kbId]);
    } else {
      setSelectedKbIds(selectedKbIds.filter(id => id !== kbId));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedKbIds.length === 0) {
      message.warning('Please select at least one knowledge base');
      return;
    }

    try {
      const response = await knowledgeBaseService.batchDeleteKnowledgeBases(selectedKbIds);

      if (response.code === 200 || response.code === 0) {
        message.success(`Successfully deleted ${selectedKbIds.length} knowledge base(s)`);
        setSelectedKbIds([]);
        setIsDeleteModalOpen(false);

        // If current selected KB is deleted, clear selection
        if (selectedKb && selectedKbIds.includes(selectedKb)) {
          setSelectedKb(null);
        }

        // Reload knowledge bases
        loadKnowledgeBases(1, true);
      } else {
        message.error(response.message || 'Failed to delete knowledge bases');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete knowledge bases';
      message.error(errorMessage);
    }
  };

  const handleSelectAllDocs = (checked: boolean) => {
    if (checked) {
      setSelectedDocIds(filteredDocuments.map(doc => doc.id));
    } else {
      setSelectedDocIds([]);
    }
  };

  const handleSelectDoc = (docId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocIds([...selectedDocIds, docId]);
    } else {
      setSelectedDocIds(selectedDocIds.filter(id => id !== docId));
    }
  };

  const handleBatchDeleteDocs = async () => {
    if (!selectedKb || selectedDocIds.length === 0) {
      message.warning('Please select at least one document');
      return;
    }

    try {
      const response = await knowledgeBaseService.batchDeleteDocuments(selectedKb, selectedDocIds);

      if (response.code === 200 || response.code === 0) {
        const { success_count, failed_count, failed_items } = response.data || {};

        if (failed_count && failed_count > 0) {
          message.warning(
            `Deleted ${success_count} documents successfully, ${failed_count} failed`
          );
          if (failed_items) {
            console.error('Failed items:', failed_items);
          }
        } else {
          message.success(`Successfully deleted ${success_count} document(s)`);
        }

        setSelectedDocIds([]);
        setIsDeleteDocModalOpen(false);

        // Reload documents and knowledge bases (to update count)
        loadDocuments(selectedKb, 1, true);
        loadKnowledgeBases(1, true);
      } else {
        message.error(response.message || 'Failed to delete documents');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete documents';
      message.error(errorMessage);
    }
  };

  const handleCreateKnowledgeBase = async (values: KnowledgeBaseFormValues) => {
    try {
      const createData: {
        name: string;
        embedding_model_id: string;
        rerank_model_id?: string;
        chunk_size?: number;
        chunk_overlap?: number;
        chunk_strategy?: string;
      } = {
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

      if (response.code !== 200 && response.code !== 0) {
        message.error(`Failed to create knowledge base: ${response.message}`);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create knowledge base';
      message.error(errorMessage);
    }
  };

  const handleBatchUpload = async (fileList: File[]) => {
    // ✅ 防止重复上传
    if (isUploadingRef.current) {
      console.warn('⚠️ Upload already in progress, skipping duplicate call');
      return;
    }

    if (!selectedKb) {
      message.error('Please select a knowledge base first');
      setUploadingFiles([]);
      return;
    }

    if (fileList.length === 0) {
      setUploadingFiles([]);
      return;
    }

    if (fileList.length > 50) {
      message.error('Maximum 50 files allowed per upload');
      setUploadingFiles([]);
      return;
    }

    console.log(`🚀 Starting batch upload of ${fileList.length} files...`);
    isUploadingRef.current = true;

    try {
      // Use the upload hook
      await uploadDocuments(fileList);
    } catch (error) {
      console.error('❌ Batch upload failed:', error);
      isUploadingRef.current = false;
      // Error will be handled by handleUploadError callback
    }
  };

  const handleDelete = async (docId: string) => {
    if (!selectedKb) return;

    try {
      const response = await knowledgeBaseService.deleteDocument(selectedKb, docId);

      if (response.code !== 200 && response.code !== 0) {
        message.error(`Delete failed: ${response.message}`);
        return;
      }

      message.success('Document deleted successfully');

      // Reload documents list
      loadDocuments(selectedKb, 1, true);

      // Reload KB list to update document count
      loadKnowledgeBases(1, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      message.error(errorMessage);
    }
  };

  const handleReprocess = async (docId: string) => {
    if (!selectedKb) return;

    try {
      const response = await knowledgeBaseService.reprocessDocument(selectedKb, docId);

      if (response.code !== 200 && response.code !== 0) {
        message.error(`Reprocess failed: ${response.message}`);
        return;
      }

      message.info('Document added to processing queue');

      // Reload documents to show updated status
      loadDocuments(selectedKb, 1, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Reprocess failed';
      message.error(errorMessage);
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
        <div className="col-span-3 flex flex-col border-r border-background-dark/10 bg-background-light dark:border-background-light/10 dark:bg-background-dark">
          <div className="p-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="w-full"
              size="large"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Knowledge Base
            </Button>
          </div>

          {/* Header with Select All and Delete */}
          <div className="border-t border-b border-background-dark/10 px-4 py-3 dark:border-background-light/10">
            <div className="flex items-center justify-between">
              <Checkbox
                checked={knowledgeBases.length > 0 && selectedKbIds.length === knowledgeBases.length}
                indeterminate={selectedKbIds.length > 0 && selectedKbIds.length < knowledgeBases.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                <span className="text-sm text-background-dark/70 dark:text-background-light/70">
                  Select All ({selectedKbIds.length}/{knowledgeBases.length})
                </span>
              </Checkbox>
              {selectedKbIds.length > 0 && (
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete ({selectedKbIds.length})
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4" onScroll={handleKbScroll}>
            <nav className="space-y-2">
              {knowledgeBases.map((kb) => (
                <div
                  key={kb.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${selectedKb === kb.id
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-background-dark/70 hover:bg-background-dark/5 dark:text-background-light/70 dark:hover:bg-background-light/5'
                    }`}
                >
                  <Checkbox
                    checked={selectedKbIds.includes(kb.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectKb(kb.id, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div
                    className="flex flex-1 items-center justify-between"
                    onClick={() => setSelectedKb(kb.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{kb.is_official ? '🏢' : '📚'}</span>
                      <span>{kb.name}</span>
                    </div>
                    <span className="text-xs text-background-dark/50 dark:text-background-light/50">
                      {kb.document_count}
                    </span>
                  </div>
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
                {selectedKb
                  ? `Embedding Model: ${embeddingModelName || 'Loading...'}`
                  : 'Select a knowledge base to view details'
                }
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
                customRequest={({ file, onSuccess }) => {
                  // Add file to pending list using ref (won't trigger re-render)
                  pendingFilesRef.current.push(file as File);

                  // Clear existing timer
                  if (uploadTimerRef.current) {
                    clearTimeout(uploadTimerRef.current);
                  }

                  // Set new timer - only the last file's timer will execute
                  uploadTimerRef.current = setTimeout(() => {
                    const filesToUpload = [...pendingFilesRef.current];
                    pendingFilesRef.current = []; // Clear pending files

                    if (filesToUpload.length > 0) {
                      setUploadingFiles(filesToUpload);
                      handleBatchUpload(filesToUpload);
                    }

                    uploadTimerRef.current = null;
                  }, 200);

                  onSuccess?.('ok');
                }}
                showUploadList={false}
                className="rounded-lg"
                disabled={uploading}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-4xl text-primary/60" />
                </p>
                <p className="ant-upload-text text-base font-medium">
                  {uploading
                    ? `${progress.status === 'uploading' ? 'Uploading' : progress.status === 'processing' ? 'Processing' : 'Uploading'}... ${progress.percentage}%`
                    : 'Click or drag files to this area'
                  }
                </p>
                <p className="ant-upload-hint text-sm text-background-dark/60 dark:text-background-light/60">
                  {uploading
                    ? `${progress.uploadedCount}/${progress.totalCount} uploaded, ${progress.processedCount} processed${progress.currentFile ? `, current: ${progress.currentFile}` : ''}`
                    : 'Support for multiple files upload (max 50 files). Select multiple files or drag them here.'
                  }
                </p>
              </Dragger>

              {/* Progress Bar */}
              {uploading && (
                <div className="mt-4 space-y-2">
                  <Progress 
                    percent={progress.percentage} 
                    status={progress.status === 'error' ? 'exception' : 'active'}
                    strokeColor={{
                      '0%': '#108ee9',
                      '50%': '#87d068', 
                      '100%': '#87d068',
                    }}
                  />
                  <div className="flex justify-between items-center text-sm text-background-dark/60 dark:text-background-light/60">
                    <span>{`${progress.status} - ${progress.percentage}%`}</span>
                    <div className="flex gap-2 text-xs">
                      {progress.status === 'uploading' && (
                        <span>Uploading: {progress.uploadedCount}/{progress.totalCount}</span>
                      )}
                      {progress.status === 'processing' && (
                        <span>Processing: {progress.processedCount}/{progress.uploadedCount}</span>
                      )}
                      {progress.currentFile && (
                        <span>Current: {progress.currentFile}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Document Selection Header */}
            {filteredDocuments.length > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-background-dark/10 px-4 py-2 dark:border-background-light/10">
                <Checkbox
                  checked={filteredDocuments.length > 0 && selectedDocIds.length === filteredDocuments.length}
                  indeterminate={selectedDocIds.length > 0 && selectedDocIds.length < filteredDocuments.length}
                  onChange={(e) => handleSelectAllDocs(e.target.checked)}
                >
                  <span className="text-sm text-background-dark/70 dark:text-background-light/70">
                    Select All ({selectedDocIds.length}/{filteredDocuments.length})
                  </span>
                </Checkbox>
                {selectedDocIds.length > 0 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setIsDeleteDocModalOpen(true)}
                  >
                    Delete ({selectedDocIds.length})
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Scrollable Documents Area */}
          <div className="flex-1 overflow-y-auto p-6 pt-0" onScroll={handleDocScroll}>
            <div className="mt-4 space-y-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-lg border border-background-dark/10 bg-background-light p-4 dark:border-background-light/10 dark:bg-background-dark/30"
                >
                  <Checkbox
                    checked={selectedDocIds.includes(doc.id)}
                    onChange={(e) => handleSelectDoc(doc.id, e.target.checked)}
                  />

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

      {/* Delete Knowledge Bases Confirmation Modal */}
      <Modal
        title="Delete Knowledge Bases"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={handleBatchDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p className="text-background-dark dark:text-background-light">
          Are you sure you want to delete {selectedKbIds.length} knowledge base(s)?
        </p>
        <p className="mt-2 text-sm text-background-dark/60 dark:text-background-light/60">
          This action cannot be undone. All documents in these knowledge bases will also be deleted.
        </p>
      </Modal>

      {/* Delete Documents Confirmation Modal */}
      <Modal
        title="Delete Documents"
        open={isDeleteDocModalOpen}
        onCancel={() => setIsDeleteDocModalOpen(false)}
        onOk={handleBatchDeleteDocs}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p className="text-background-dark dark:text-background-light">
          Are you sure you want to delete {selectedDocIds.length} document(s)?
        </p>
        <p className="mt-2 text-sm text-background-dark/60 dark:text-background-light/60">
          This action cannot be undone. All chunks and vectors for these documents will also be deleted.
        </p>
      </Modal>

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
