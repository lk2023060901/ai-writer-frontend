export const appConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  useMockApi:
    process.env.NEXT_PUBLIC_API_USE_MOCK === 'true' ||
    (process.env.NEXT_PUBLIC_API_USE_MOCK === undefined && process.env.NODE_ENV !== 'production'),
  mockLatency: Number.parseInt(process.env.NEXT_PUBLIC_API_MOCK_LATENCY || '150', 10)
};
