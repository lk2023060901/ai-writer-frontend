import type {
  IApiClient,
  IApiContext,
  IApiRequestConfig,
  IApiResponse,
  IApiError,
  IRequestInterceptor,
  IResponseInterceptor,
} from '@/types';
import { createInitialKnowledgeBases } from '@/features/launchpad/data/knowledge';
import { createInitialAssistantGroups } from '@/features/launchpad/data/assistants';
import { createInitialFiles } from '@/features/launchpad/data/files';

interface RouteMatch {
  resource: string;
  id?: string;
}

const SUCCESS_STATUS = 200;

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export class MockApiClient implements IApiClient {
  private requestInterceptors: Map<string, IRequestInterceptor> = new Map();
  private responseInterceptors: Map<string, IResponseInterceptor> = new Map();

  private knowledgeBases = createInitialKnowledgeBases();
  private assistantGroups = createInitialAssistantGroups();
  private files = createInitialFiles();

  constructor(private readonly latency = 150) {}

  private async simulateLatency(): Promise<void> {
    if (this.latency <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, this.latency));
  }

  private normaliseUrl(url: string): string {
    try {
      const normalised = new URL(url, 'http://localhost');
      return normalised.pathname.replace(/\/$/, '');
    } catch {
      return url.replace(/\?.*$/, '').replace(/\/$/, '');
    }
  }

  private matchRoute(url: string): RouteMatch {
    const pathname = this.normaliseUrl(url);

    if (/^\/knowledge-bases\/?$/.test(pathname)) {
      return { resource: 'knowledge-bases' };
    }

    const knowledgeMatch = pathname.match(/^\/knowledge-bases\/(.+)$/);
    if (knowledgeMatch) {
      return { resource: 'knowledge-bases', id: knowledgeMatch[1] };
    }

    if (/^\/assistant-presets\/?$/.test(pathname)) {
      return { resource: 'assistant-presets' };
    }

    const presetMatch = pathname.match(/^\/assistant-presets\/(.+)$/);
    if (presetMatch) {
      return { resource: 'assistant-presets', id: presetMatch[1] };
    }

    if (/^\/files\/?$/.test(pathname)) {
      return { resource: 'files' };
    }

    const fileMatch = pathname.match(/^\/files\/(.+)$/);
    if (fileMatch) {
      return { resource: 'files', id: fileMatch[1] };
    }

    return { resource: 'unknown' };
  }

  private async handleKnowledgeBaseRequest(
    config: IApiRequestConfig
  ): Promise<IApiResponse> {
    const match = this.matchRoute(config.url);

    if (config.method === 'GET' && !match.id) {
      return {
        code: SUCCESS_STATUS,
        data: this.knowledgeBases,
        message: 'OK',
        timestamp: Date.now(),
      };
    }

    if (config.method === 'POST' && !match.id) {
      const body = (config.data || {}) as { name?: string };
      const name = body.name?.trim() || '未命名知识库';
      const templateBase = createInitialKnowledgeBases()[0];
      const newBase = {
        ...templateBase,
        id: createId(),
        name,
        stats: {
          ...templateBase.stats,
          documents: 0,
          tokens: 0,
          size: '0 KB',
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
        files: [],
        notes: [],
        directories: [],
        urls: [],
        sitemaps: [],
      };
      this.knowledgeBases = [newBase, ...this.knowledgeBases];
      return {
        code: SUCCESS_STATUS,
        data: newBase,
        message: 'Created',
        timestamp: Date.now(),
      };
    }

    if (!match.id) {
      throw this.createNotFoundError('Knowledge base');
    }

    const index = this.knowledgeBases.findIndex((base) => base.id === match.id);
    if (index === -1) {
      throw this.createNotFoundError('Knowledge base');
    }

    if (config.method === 'DELETE') {
      const [removed] = this.knowledgeBases.splice(index, 1);
      return {
        code: SUCCESS_STATUS,
        data: removed,
        message: 'Deleted',
        timestamp: Date.now(),
      };
    }

    if (config.method === 'PATCH' || config.method === 'PUT') {
      const body = (config.data || {}) as Record<string, unknown>;
      const updated = {
        ...this.knowledgeBases[index],
        ...body,
        stats: {
          ...this.knowledgeBases[index].stats,
          ...(typeof body.stats === 'object' && body.stats !== null ? body.stats : {}),
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
      };
      this.knowledgeBases[index] = updated;
      return {
        code: SUCCESS_STATUS,
        data: updated,
        message: 'Updated',
        timestamp: Date.now(),
      };
    }

    return {
      code: SUCCESS_STATUS,
      data: this.knowledgeBases[index],
      message: 'OK',
      timestamp: Date.now(),
    };
  }

  private async handleAssistantPresetRequest(
    config: IApiRequestConfig
  ): Promise<IApiResponse> {
    if (config.method === 'GET') {
      return {
        code: SUCCESS_STATUS,
        data: this.assistantGroups,
        message: 'OK',
        timestamp: Date.now(),
      };
    }

    if (config.method === 'POST') {
      const body = (config.data || {}) as Record<string, unknown>;
      const groupId = (body.groupId as string) || 'my-presets';
      const targetGroup = this.assistantGroups.find((group) => group.id === groupId);

      if (!targetGroup) {
        throw this.createNotFoundError('Assistant group');
      }

      const newPreset = {
        id: createId(),
        name: (body.name as string) || '新建智能体',
        description: (body.description as string) || '',
        category: (body.category as string) || '通用',
        tags: Array.isArray(body.tags) ? (body.tags as string[]) : [],
        model: (body.model as string) || 'gpt-4o-mini',
        prompt: (body.prompt as string) || '',
        source: 'custom' as const,
      };

      targetGroup.presets = [newPreset, ...targetGroup.presets];

      return {
        code: SUCCESS_STATUS,
        data: newPreset,
        message: 'Created',
        timestamp: Date.now(),
      };
    }

    throw this.createMethodNotAllowedError();
  }

  private async handleFilesRequest(config: IApiRequestConfig): Promise<IApiResponse> {
    const match = this.matchRoute(config.url);

    if (config.method === 'GET' && !match.id) {
      return {
        code: SUCCESS_STATUS,
        data: this.files,
        message: 'OK',
        timestamp: Date.now(),
      };
    }

    if (config.method === 'DELETE' && match.id) {
      const initialLength = this.files.length;
      this.files = this.files.filter((file) => file.id !== match.id);

      if (this.files.length === initialLength) {
        throw this.createNotFoundError('File');
      }

      return {
        code: SUCCESS_STATUS,
        data: { id: match.id },
        message: 'Deleted',
        timestamp: Date.now(),
      };
    }

    if ((config.method === 'PATCH' || config.method === 'PUT') && match.id) {
      const index = this.files.findIndex((file) => file.id === match.id);
      if (index === -1) {
        throw this.createNotFoundError('File');
      }

      const body = (config.data || {}) as Partial<(typeof this.files)[number]>;
      const updated = {
        ...this.files[index],
        ...body,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      this.files[index] = updated;

      return {
        code: SUCCESS_STATUS,
        data: updated,
        message: 'Updated',
        timestamp: Date.now(),
      };
    }

    throw this.createMethodNotAllowedError();
  }

  private createNotFoundError(resource: string): IApiError {
    return {
      code: 'NOT_FOUND',
      message: `${resource} not found`,
      details: null,
    };
  }

  private createMethodNotAllowedError(): IApiError {
    return {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed in mock API',
      details: null,
    };
  }

  private async dispatch(
    _context: IApiContext,
    config: IApiRequestConfig
  ): Promise<IApiResponse> {
    const match = this.matchRoute(config.url);

    switch (match.resource) {
      case 'knowledge-bases':
        return this.handleKnowledgeBaseRequest(config);
      case 'assistant-presets':
        return this.handleAssistantPresetRequest(config);
      case 'files':
        return this.handleFilesRequest(config);
      default:
        return {
          code: SUCCESS_STATUS,
          data: { message: 'mock response', url: config.url, method: config.method },
          message: 'OK',
          timestamp: Date.now(),
        };
    }
  }

  private async executeRequest(
    context: IApiContext,
    config: IApiRequestConfig
  ): Promise<IApiResponse> {
    let currentConfig = config;
    for (const interceptor of this.requestInterceptors.values()) {
      currentConfig = await Promise.resolve(
        interceptor.onRequest(context, currentConfig)
      );
    }

    try {
      await this.simulateLatency();
      let response = await this.dispatch(context, currentConfig);

      for (const interceptor of this.responseInterceptors.values()) {
        response = await Promise.resolve(
          interceptor.onSuccess(context, response)
        );
      }

      return response;
    } catch (error) {
      const apiError: IApiError =
        (error && typeof error === 'object' && 'message' in error
          ? (error as IApiError)
          : {
              code: 'MOCK_ERROR',
              message: 'Mock request failed',
              details: error,
            });

      for (const interceptor of this.responseInterceptors.values()) {
        await Promise.resolve(interceptor.onError(context, apiError));
      }

      throw apiError;
    }
  }

  async request<T = unknown>(
    context: IApiContext,
    config: IApiRequestConfig
  ): Promise<IApiResponse<T>> {
    return this.executeRequest(context, config) as Promise<IApiResponse<T>>;
  }

  async get<T = unknown>(
    context: IApiContext,
    url: string,
    params?: Record<string, unknown>
  ): Promise<IApiResponse<T>> {
    return this.request<T>(context, {
      method: 'GET',
      url,
      params,
    });
  }

  async post<T = unknown>(
    context: IApiContext,
    url: string,
    data?: unknown
  ): Promise<IApiResponse<T>> {
    return this.request<T>(context, {
      method: 'POST',
      url,
      data,
    });
  }

  async put<T = unknown>(
    context: IApiContext,
    url: string,
    data?: unknown
  ): Promise<IApiResponse<T>> {
    return this.request<T>(context, {
      method: 'PUT',
      url,
      data,
    });
  }

  async delete<T = unknown>(
    context: IApiContext,
    url: string,
    params?: Record<string, unknown>
  ): Promise<IApiResponse<T>> {
    return this.request<T>(context, {
      method: 'DELETE',
      url,
      params,
    });
  }

  async patch<T = unknown>(
    context: IApiContext,
    url: string,
    data?: unknown
  ): Promise<IApiResponse<T>> {
    return this.request<T>(context, {
      method: 'PATCH',
      url,
      data,
    });
  }

  addRequestInterceptor(interceptor: IRequestInterceptor): void {
    this.requestInterceptors.set(interceptor.name, interceptor);
  }

  addResponseInterceptor(interceptor: IResponseInterceptor): void {
    this.responseInterceptors.set(interceptor.name, interceptor);
  }

  removeRequestInterceptor(name: string): void {
    this.requestInterceptors.delete(name);
  }

  removeResponseInterceptor(name: string): void {
    this.responseInterceptors.delete(name);
  }
}
