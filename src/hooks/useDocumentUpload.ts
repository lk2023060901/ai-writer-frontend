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
        const token = localStorage.getItem('access_token');

        if (!token) {
          throw new Error('No access token found');
        }

        // Step 1: 建立 SSE 连接监听知识库级别的文档状态
        const resource = `kb:${knowledgeBaseId}`;
        const sseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${knowledgeBaseId}/document-stream/kb-monitor?token=${encodeURIComponent(token)}&resource=${encodeURIComponent(resource)}`;

        console.log('🔗 Connecting to KB-level SSE:', sseUrl);

        const eventSource = new EventSource(sseUrl);
        eventSourceRef.current = eventSource;

        // Handle SSE connection open
        eventSource.addEventListener('open', () => {
          console.log('🔗 SSE connection opened');
        });

        // Handle connected event
        eventSource.addEventListener('connected', (e) => {
          const data = JSON.parse(e.data);
          console.log('✅ SSE connected:', data);
        });

        // Handle status event (document processing status updates)
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
        });

        // Step 2: 使用批量上传 API
        console.log(`📤 Starting batch upload of ${files.length} files...`);

        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });

        const uploadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${knowledgeBaseId}/documents/batch-upload`;
        console.log('📤 Upload URL:', uploadUrl);
        console.log('📤 Token:', token ? 'exists' : 'missing');

        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', response.status, errorText);
          throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
        }

        // 处理 SSE 响应流
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              continue;
            }

            if (line.startsWith('data:')) {
              const dataStr = line.substring(5).trim();
              if (!dataStr) continue;

              try {
                const data = JSON.parse(dataStr);

                // 适配后端新格式
                if (data.type === 'connected') {
                  console.log('✅ SSE connected:', data.data);
                } else if (data.type === 'batch-start') {
                  console.log('📦 Batch upload started:', data.data);
                } else if (data.type === 'file-success') {
                  // ✅ 后端改为 file-success，字段改为 item_name 和 data
                  uploadedCountRef.current++;
                  const document = data.data?.data; // 嵌套的 data.data
                  const filename = data.data?.item_name; // 改为 item_name

                  console.log(`✅ File uploaded: ${filename} (${uploadedCountRef.current}/${files.length})`, document);

                  const uploadPercentage = Math.round(
                    (uploadedCountRef.current / totalCountRef.current) * 50
                  );

                  updateProgress({
                    uploadedCount: uploadedCountRef.current,
                    currentFile: filename,
                    percentage: uploadPercentage,
                    status: 'uploading',
                  });

                  // 立即通知有新文档上传
                  if (onFileUploaded && document) {
                    console.log(`📤 Calling onFileUploaded with:`, document);
                    onFileUploaded(document);
                  }
                } else if (data.type === 'file-failed') {
                  // ✅ 后端改为 file-failed
                  const filename = data.data?.item_name;
                  const error = data.data?.error;
                  console.error(`❌ File upload failed: ${filename}`, error);
                } else if (data.type === 'batch-complete') {
                  console.log('📦 Batch upload completed:', data.data);

                  updateProgress({
                    status: 'processing',
                    percentage: 50,
                  });
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e, dataStr);
              }
            }
          }
        }

        console.log(`📊 All files uploaded: ${uploadedCountRef.current}/${files.length}`);
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
