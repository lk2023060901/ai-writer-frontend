/**
 * API 模块导出
 */

import { ApiClient } from './ApiClient';
import { MockApiClient } from './MockApiClient';
import { appConfig } from '@/config/appConfig';

const buildApiClient = () => {
  if (appConfig.useMockApi) {
    return new MockApiClient(appConfig.mockLatency);
  }

  return new ApiClient(appConfig.apiBaseUrl);
};

export const apiClient = buildApiClient();

export { ApiClient } from './ApiClient';
export * from './interceptors';
export { MockApiClient } from './MockApiClient';
