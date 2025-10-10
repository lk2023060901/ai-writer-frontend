/**
 * Document Upload Orchestrator - 编排文档上传流程
 */

import { sseHub } from '../sse/SSEHub';

export interface UploadCallbacks {
  onProgress?: (uploaded: number, total: number) => void;
  onFileSuccess?: (filename: string, document: any) => void;
  onFileFailed?: (filename: string, error: string) => void;
  onComplete?: (stats: { total: number; success: number; failed: number }) => void;
  onStatusUpdate?: (document: any) => void;
}

export class DocumentUploadOrchestrator {
  private kbConnectionId: string;
  private uploadConnectionId: string;

  constructor(
    private knowledgeBaseId: string,
    private token: string,
    private callbacks: UploadCallbacks = {}
  ) {
    this.kbConnectionId = `kb-${knowledgeBaseId}`;
    this.uploadConnectionId = `upload-${Date.now()}`;
  }

  /**
   * 启动上传流程
   */
  async upload(files: File[]): Promise<void> {
    // 1. 连接知识库状态监听
    this.connectKBMonitor();

    try {
      // 2. 发起上传请求
      const response = await this.sendUploadRequest(files);

      // 3. 处理上传响应流
      await this.handleUploadStream(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 取消上传
   */
  cancel(): void {
    sseHub.disconnect(this.kbConnectionId);
    sseHub.disconnect(this.uploadConnectionId);
  }

  /**
   * 连接知识库状态监听
   */
  private connectKBMonitor(): void {
    const resource = `kb:${this.knowledgeBaseId}`;
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${this.knowledgeBaseId}/document-stream/kb-monitor?token=${encodeURIComponent(this.token)}&resource=${encodeURIComponent(resource)}`;

    // 注册事件处理
    sseHub.on(this.kbConnectionId, 'status', (data) => {
      const { document } = data;
      this.callbacks.onStatusUpdate?.(document);
    });

    // 连接
    sseHub.connect(this.kbConnectionId, url);
  }

  /**
   * 发送上传请求
   */
  private async sendUploadRequest(files: File[]): Promise<Response> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${this.knowledgeBaseId}/documents/batch-upload`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    return response;
  }

  /**
   * 处理上传响应流
   */
  private async handleUploadStream(response: Response): Promise<void> {
    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    let uploadedCount = 0;
    let totalCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const dataStr = line.substring(5).trim();
          if (!dataStr) continue;

          const data = JSON.parse(dataStr);
          console.log('📨 SSE Event:', data.type, data);

          switch (data.type) {
            case 'batch-start':
              totalCount = data.data?.total_count || 0;
              break;

            case 'file-success':
              uploadedCount++;
              this.callbacks.onProgress?.(uploadedCount, totalCount);

              // 兼容多种后端数据结构
              const document = data.data?.data || data.data || data;
              const filename = data.data?.item_name || data.item_name || document?.filename;

              console.log('✅ File success - raw data:', JSON.stringify(data, null, 2));
              console.log('✅ File success - parsed:', { filename, document });

              this.callbacks.onFileSuccess?.(filename, document);
              break;

            case 'file-failed':
              uploadedCount++;
              this.callbacks.onProgress?.(uploadedCount, totalCount);
              this.callbacks.onFileFailed?.(
                data.data?.item_name,
                data.data?.error
              );
              break;

            case 'batch-complete':
              this.callbacks.onComplete?.({
                total: data.data?.total_count || 0,
                success: data.data?.success_count || 0,
                failed: data.data?.failed_count || 0,
              });
              break;
          }
        }
      }
    }
  }
}
