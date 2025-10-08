import { useState, useCallback, useRef } from 'react';

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


export function useDocumentUpload(options: UseDocumentUploadOptions) {
  const {
    knowledgeBaseId,
    onProgress,
    onComplete,
    onError,
    onFileUploaded,
    onStatusUpdate,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    uploadedCount: 0,
    totalCount: 0,
    processedCount: 0,
    percentage: 0,
    status: 'idle',
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const uploadedCountRef = useRef(0);
  const processedCountRef = useRef(0);
  const totalCountRef = useRef(0);

  const updateProgress = useCallback(
    (updates: Partial<UploadProgress>) => {
      setProgress((prev) => {
        const newProgress = { ...prev, ...updates };
        if (onProgress) {
          onProgress(newProgress);
        }
        return newProgress;
      });
    },
    [onProgress]
  );

  const cancel = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setUploading(false);
    updateProgress({ status: 'idle' });
  }, [updateProgress]);

  const upload = useCallback(
    async (files: File[]) => {
      // ✅ 防止重复调用
      if (uploading) {
        console.warn('⚠️ Upload already in progress, ignoring duplicate call');
        return;
      }

      if (files.length === 0) {
        return;
      }

      // ✅ 关闭旧的 SSE 连接（如果存在）
      if (eventSourceRef.current) {
        console.log('🔌 Closing existing SSE connection before starting new upload');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

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

      try {
        // Step 1: 建立 SSE 连接监听文档处理状态
        const resource = `kb:${knowledgeBaseId}`;
        const token = localStorage.getItem('access_token');

        if (!token) {
          throw new Error('No access token found');
        }

        // 使用任意 doc_id（这里用 'batch'），通过 query 参数传递 token 和 resource
        const sseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${knowledgeBaseId}/document-stream/batch?token=${encodeURIComponent(token)}&resource=${encodeURIComponent(resource)}`;

        console.log('🔗 Connecting to SSE:', sseUrl);

        const eventSource = new EventSource(sseUrl);
        eventSourceRef.current = eventSource;

        // Handle SSE connection open
        eventSource.addEventListener('open', () => {
          console.log('🔗 SSE connection opened');
        });

        // Handle connected event (sent by server)
        eventSource.addEventListener('connected', (e) => {
          const data = JSON.parse(e.data);
          console.log('✅ SSE connected:', data);
        });

        // Handle message event (for debugging)
        eventSource.addEventListener('message', (e) => {
          console.log('📨 SSE message:', e.data);
        });

        // Handle status event (processing/completed/failed)
        eventSource.addEventListener('status', (e) => {
          const data = JSON.parse(e.data);
          const { document } = data;
          const status = document?.process_status || document?.status;

          console.log(`📊 [SSE Status] ${document?.file_name}: ${status}`);

          if (onStatusUpdate && document) {
            onStatusUpdate(document);
          }

          // Track completed documents
          if (status === 'completed' || status === 'failed') {
            processedCountRef.current++;

            const processingPercentage =
              50 + Math.round((processedCountRef.current / uploadedCountRef.current) * 50);

            updateProgress({
              processedCount: processedCountRef.current,
              percentage: processingPercentage,
              currentFile: document?.file_name,
              status: 'processing',
            });

            // All documents processed
            if (processedCountRef.current >= uploadedCountRef.current) {
              console.log('🎉 All documents processed!');

              eventSource.close();
              eventSourceRef.current = null;

              updateProgress({
                percentage: 100,
                status: 'completed',
              });

              setUploading(false);

              if (onComplete) {
                onComplete({
                  successCount: uploadedCountRef.current,
                  failedCount: 0,
                  processedCount: processedCountRef.current,
                });
              }
            }
          }
        });

        // Handle SSE errors
        eventSource.addEventListener('error', (e) => {
          console.error('❌ SSE connection error:', e);
          eventSource.close();
          eventSourceRef.current = null;
          setUploading(false);

          updateProgress({ status: 'error' });

          if (onError) {
            onError(new Error('SSE connection failed'));
          }
        });

        // Step 2: 循环调用单文件上传 API
        setTimeout(async () => {
          console.log(`📤 Starting upload of ${files.length} files...`);

          try {
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              if (!file) continue;

              console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name}`);

              const formData = new FormData();
              formData.append('file', file);

              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${knowledgeBaseId}/documents/upload`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: formData,
                }
              );

              if (!response.ok) {
                const error = await response.json();
                console.error(`❌ Failed to upload ${file.name}:`, error);
                // 继续上传其他文件
                continue;
              }

              const result = await response.json();
              uploadedCountRef.current++;

              const uploadPercentage = Math.round(
                (uploadedCountRef.current / totalCountRef.current) * 50
              ); // Upload is 50% of total

              updateProgress({
                uploadedCount: uploadedCountRef.current,
                currentFile: file.name,
                percentage: uploadPercentage,
                status: 'uploading',
              });

              if (onFileUploaded && result.document) {
                onFileUploaded(result.document);
              }

              console.log(`✅ Uploaded ${file.name} (${uploadedCountRef.current}/${files.length})`);
            }

            // 所有文件上传完成
            console.log(`📊 All files uploaded: ${uploadedCountRef.current}/${files.length}`);

            updateProgress({
              status: 'processing',
              percentage: 50,
            });
          } catch (error) {
            console.error('Upload failed:', error);
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
            setUploading(false);
            updateProgress({ status: 'error' });

            if (onError) {
              onError(error instanceof Error ? error : new Error(String(error)));
            }
          }
        }, 500); // Wait 500ms for SSE connection to establish
      } catch (error) {
        console.error('Upload initialization failed:', error);
        setUploading(false);
        updateProgress({ status: 'error' });

        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    },
    [knowledgeBaseId, onProgress, onComplete, onError, onFileUploaded, onStatusUpdate, updateProgress]
  );

  return {
    upload,
    cancel,
    uploading,
    progress,
  };
}
