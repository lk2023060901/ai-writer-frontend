const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data: T;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    console.log(`🔵 API Request: ${options.method || 'GET'} ${endpoint}`);
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
          ...options.headers,
        },
      });

      let result;
      try {
        const text = await response.text();

        // 检查响应是否为空
        if (!text || text.trim().length === 0) {
          console.warn(`API ${endpoint} empty response`);
          return {
            code: response.status,
            message: 'Empty response from server',
            data: {} as T,
          };
        }

        // 尝试解析 JSON
        try {
          result = JSON.parse(text);
          console.log(`✅ API ${endpoint} success:`, result);
        } catch (parseError) {
          console.error(`❌ API ${endpoint} JSON parse error. Raw response (first 200 chars):`, text.substring(0, 200));
          console.error(`Parse error details:`, parseError);
          return {
            code: -1,
            message: 'Invalid JSON response from server',
            data: {} as T,
          };
        }
      } catch (readError) {
        console.error(`API ${endpoint} failed to read response:`, readError);
        return {
          code: -1,
          message: 'Failed to read server response',
          data: {} as T,
        };
      }

      // 检查HTTP状态码
      if (!response.ok) {
        console.warn(`API ${endpoint} failed with status ${response.status}:`, result);
        return {
          code: response.status,
          message: result.error || result.message || `HTTP ${response.status}`,
          data: {} as T,
        };
      }

      // 后端响应格式处理:
      // 1. 如果是标准格式 { code, message, data }，直接返回
      // 2. 如果是直接返回数据（如数组），包装成标准格式
      if (result && typeof result === 'object' && 'code' in result) {
        // 标准格式: { code, message, data }
        return result;
      } else {
        // 直接返回数据，包装成标准格式
        return {
          code: 200,
          data: result as T,
        };
      }
    } catch (error: any) {
      console.error(`API ${endpoint} network error:`, error);
      return {
        code: -1,
        message: error.message || 'Network error occurred',
        data: {} as T,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}

export const apiClient = new ApiClient(BASE_URL);
