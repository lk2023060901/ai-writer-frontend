import { useState, useEffect } from 'react';
import type { ModelProvider } from '@/types/model';
import { mockProviders } from '@/mock/models';

export const useModels = () => {
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 在实际应用中，这里应该调用真实的API
      // const response = await fetch('/api/models');
      // const data = await response.json();
      // setProviders(data);

      // 使用mock数据
      setProviders(mockProviders);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch models'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return {
    providers,
    loading,
    error,
    refetch: fetchModels,
  };
};