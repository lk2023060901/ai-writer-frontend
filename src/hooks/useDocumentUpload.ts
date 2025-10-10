import { useState, useCallback, useRef } from 'react';

// ============================================
// 类型定义
// ============================================

export interface UploadProgress {
  uploadedCount: number;
  totalCount: number;
  processedCount: number;
  percentage: number;
  currentFile?: string;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
}

export interface UploadResult {
  successCount: number;
  failedCount: number;
  processedCount: number;
}

export interface UploadedDocument {
  id: string;
  knowledge_base_id?: string;
  file_name?: string;
  filename?: string;
  file_type: string;
  file_size: number;
  process_status?: 'pending' | 'processing' | 'completed' | 'failed';
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  chunk_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UseDocumentUploadOptions {
  knowledgeBaseId: string;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  onFileUploaded?: (document: UploadedDocument) => void;
  onStatusUpdate?: (document: UploadedDocument) => void;
}

// ============================================
// SSE 连接管理器（知识库级别状态监听）
// ============================================

class KBStatusSSEManager {
  private eventSource: EventSource | null = null;

  constructor(
    private knowledgeBaseId: string,
    private callbacks: {
      onConnected?: (data: any) => void;
      onStatusUpdate?: (document: UploadedDocument) => void;
      onAllProcessed?: () => void;
      onError?: (error: Event) => void;
    }
  ) {}

  connect() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const resource = `kb:${this.knowledgeBaseId}`;
    const sseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${this.knowledgeBaseId}/document-stream/kb-monitor?token=${encodeURIComponent(token)}&resource=${encodeURIComponent(resource)}`;

    console.log('🔗 Connecting to KB-level SSE:', sseUrl);

    this.eventSource = new EventSource(sseUrl);

    this.eventSource.addEventListener('open', () => {
      console.log('🔗 SSE connection opened');
    });

    this.eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      console.log('✅ SSE connected:', data);
      this.callbacks.onConnected?.(data);
    });

    this.eventSource.addEventListener('status', (e) => {
      const data = JSON.parse(e.data);
      const { document } = data;
      const status = document?.process_status || document?.status;

      console.log(`📊 [SSE Status] ${document?.file_name}: ${status}`);

      if (this.callbacks.onStatusUpdate && document) {
        this.callbacks.onStatusUpdate(document);
      }

      // 通知是否所有文档处理完成
      if (status === 'completed' || status === 'failed') {
        this.callbacks.onAllProcessed?.();
      }
    });

    this.eventSource.addEventListener('error', (error) => {
      console.error('❌ SSE connection error:', error);
      this.callbacks.onError?.(error);
      this.disconnect();
    });
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('🔌 SSE connection closed');
    }
  }

  isConnected() {
    return this.eventSource !== null;
  }
}

// ============================================
// SSE 流解析器（批量上传响应流）
// ============================================

class BatchUploadSSEParser {
  private decoder = new TextDecoder();
  private buffer = '';

  async parseStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    handlers: {
      onConnected?: (data: any) => void;
      onBatchStart?: (data: any) => void;
      onFileSuccess?: (filename: string, document: UploadedDocument) => void;
      onFileFailed?: (filename: string, error: string) => void;
      onBatchComplete?: (data: any) => void;
    }
  ) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        this.buffer += this.decoder.decode(value, { stream: true });
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) continue;

          if (line.startsWith('data:')) {
            const dataStr = line.substring(5).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              this.handleSSEEvent(data, handlers);
            } catch (e) {
              console.error('Failed to parse SSE data:', e, dataStr);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream parsing error:', error);
      throw error;
    }
  }

  private handleSSEEvent(data: any, handlers: any) {
    switch (data.type) {
      case 'connected':
        console.log('✅ SSE connected:', data.data);
        handlers.onConnected?.(data.data);
        break;

      case 'batch-start':
        console.log('📦 Batch upload started:', data.data);
        handlers.onBatchStart?.(data.data);
        break;

      case 'file-success':
        const document = data.data?.data;
        const filename = data.data?.item_name;
        console.log(`✅ File uploaded: ${filename}`, document);
        handlers.onFileSuccess?.(filename, document);
        break;

      case 'file-failed':
        const failedFilename = data.data?.item_name;
        const error = data.data?.error;
        console.error(`❌ File upload failed: ${failedFilename}`, error);
        handlers.onFileFailed?.(failedFilename, error);
        break;

      case 'batch-complete':
        console.log('📦 Batch upload completed:', data.data);
        handlers.onBatchComplete?.(data.data);
        break;
    }
  }
}

// ============================================
// 上传 API 客户端
// ============================================

class BatchUploadClient {
  constructor(
    private knowledgeBaseId: string,
    private token: string
  ) {}

  async upload(files: File[]): Promise<Response> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const uploadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${this.knowledgeBaseId}/documents/batch-upload`;

    console.log('📤 Starting batch upload:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    return response;
  }
}

// ============================================
// 主 Hook
// ============================================

export function useDocumentUpload(options: UseDocumentUploadOptions) {
  const {
    knowledgeBaseId,
    onProgress,
    onComplete,
    onError,
    onFileUploaded,
    onStatusUpdate,
  } = options;

  // 状态
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    uploadedCount: 0,
    totalCount: 0,
    processedCount: 0,
    percentage: 0,
    status: 'idle',
  });

  // 引用
  const kbSSEManagerRef = useRef<KBStatusSSEManager | null>(null);
  const uploadedCountRef = useRef(0);
  const processedCountRef = useRef(0);
  const totalCountRef = useRef(0);

  // 更新进度
  const updateProgress = useCallback(
    (updates: Partial<UploadProgress>) => {
      setProgress((prev) => {
        const newProgress = { ...prev, ...updates };
        onProgress?.(newProgress);
        return newProgress;
      });
    },
    [onProgress]
  );

  // 取消上传
  const cancel = useCallback(() => {
    kbSSEManagerRef.current?.disconnect();
    kbSSEManagerRef.current = null;
    setUploading(false);
    updateProgress({ status: 'idle' });
  }, [updateProgress]);

  // 核心上传逻辑
  const upload = useCallback(
    async (files: File[]) => {
      // 防重复调用
      if (uploading) {
        console.warn('⚠️ Upload already in progress');
        return;
      }

      if (files.length === 0) return;

      try {
        // 1. 初始化状态
        setUploading(true);
        uploadedCountRef.current = 0;
        processedCountRef.current = 0;
        totalCountRef.current = files.length;

        updateProgress({
          uploadedCount: 0,
          totalCount: files.length,
          processedCount: 0,
          percentage: 0,
          status: 'uploading',
        });

        // 2. 建立知识库状态监听 SSE
        const kbSSEManager = new KBStatusSSEManager(knowledgeBaseId, {
          onStatusUpdate: (document) => {
            onStatusUpdate?.(document);

            const status = document?.process_status || document?.status;
            if (status === 'completed' || status === 'failed') {
              processedCountRef.current++;

              const percentage = 50 + Math.round((processedCountRef.current / uploadedCountRef.current) * 50);

              updateProgress({
                processedCount: processedCountRef.current,
                percentage,
                currentFile: document?.file_name,
                status: 'processing',
              });

              // 所有文档处理完成
              if (processedCountRef.current >= uploadedCountRef.current) {
                console.log('🎉 All documents processed!');

                kbSSEManager.disconnect();
                kbSSEManagerRef.current = null;

                updateProgress({
                  percentage: 100,
                  status: 'completed',
                });

                setUploading(false);

                onComplete?.({
                  successCount: uploadedCountRef.current,
                  failedCount: 0,
                  processedCount: processedCountRef.current,
                });
              }
            }
          },
          onError: () => {
            kbSSEManager.disconnect();
            kbSSEManagerRef.current = null;
          },
        });

        kbSSEManager.connect();
        kbSSEManagerRef.current = kbSSEManager;

        // 3. 发送批量上传请求
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No access token');

        const uploadClient = new BatchUploadClient(knowledgeBaseId, token);
        const response = await uploadClient.upload(files);

        // 4. 解析上传响应流
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const parser = new BatchUploadSSEParser();
        await parser.parseStream(reader, {
          onFileSuccess: (filename, document) => {
            uploadedCountRef.current++;

            const percentage = Math.round((uploadedCountRef.current / totalCountRef.current) * 50);

            updateProgress({
              uploadedCount: uploadedCountRef.current,
              currentFile: filename,
              percentage,
              status: 'uploading',
            });

            onFileUploaded?.(document);
          },
          onBatchComplete: () => {
            updateProgress({
              status: 'processing',
              percentage: 50,
            });
          },
        });

        console.log(`📊 All files uploaded: ${uploadedCountRef.current}/${files.length}`);
      } catch (error) {
        console.error('Upload failed:', error);

        kbSSEManagerRef.current?.disconnect();
        kbSSEManagerRef.current = null;

        setUploading(false);
        updateProgress({ status: 'error' });

        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    },
    [knowledgeBaseId, onProgress, onComplete, onError, onFileUploaded, onStatusUpdate, updateProgress, uploading]
  );

  return {
    upload,
    cancel,
    uploading,
    progress,
  };
}
