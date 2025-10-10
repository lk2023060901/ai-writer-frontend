import { useState, useCallback, useRef } from 'react';
import { DocumentUploadOrchestrator } from '@/lib/upload/DocumentUploadOrchestrator';

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
// 主 Hook - 纯状态管理
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
  const orchestratorRef = useRef<DocumentUploadOrchestrator | null>(null);
  const uploadedCountRef = useRef(0);
  const processedCountRef = useRef(0);

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
    orchestratorRef.current?.cancel();
    orchestratorRef.current = null;
    setUploading(false);
    updateProgress({ status: 'idle' });
  }, [updateProgress]);

  // 核心上传逻辑
  const upload = useCallback(
    async (files: File[]) => {
      if (uploading) {
        console.warn('⚠️ Upload already in progress');
        return;
      }

      if (files.length === 0) return;

      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No access token');

        // 初始化状态
        setUploading(true);
        uploadedCountRef.current = 0;
        processedCountRef.current = 0;

        updateProgress({
          uploadedCount: 0,
          totalCount: files.length,
          processedCount: 0,
          percentage: 0,
          status: 'uploading',
        });

        // 创建 Orchestrator
        orchestratorRef.current = new DocumentUploadOrchestrator(knowledgeBaseId, token, {
          onProgress: (uploaded, total) => {
            uploadedCountRef.current = uploaded;
            const percentage = Math.round((uploaded / total) * 50);

            updateProgress({
              uploadedCount: uploaded,
              totalCount: total,
              percentage,
              status: 'uploading',
            });
          },
          onFileSuccess: (filename, document) => {
            updateProgress({ currentFile: filename });
            onFileUploaded?.(document);
          },
          onComplete: () => {
            updateProgress({
              status: 'processing',
              percentage: 50,
            });
          },
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
                orchestratorRef.current?.cancel();
                orchestratorRef.current = null;

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
        });

        // 启动上传
        await orchestratorRef.current.upload(files);
      } catch (error) {
        console.error('Upload failed:', error);

        orchestratorRef.current?.cancel();
        orchestratorRef.current = null;

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
