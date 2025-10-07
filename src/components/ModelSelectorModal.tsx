'use client';

import { useState, useEffect } from 'react';
import { Modal, Input } from 'antd';
import { providerService } from '@/services/provider';
import type { AIProviderWithModels } from '@/services/provider';

interface ModelSelectorModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (provider: string, model: string, displayName: string, providerName: string) => void;
  currentProvider?: string;
  currentModel?: string;
}

interface ModelWithProvider {
  provider: string;
  providerName: string;
  providerType: string;
  model: string;
  displayName: string;
  tags: string[];
  icon?: string;
}

const FILTER_TAGS = [
  { key: 'vision', label: '视觉' },
  { key: 'reasoning', label: '推理' },
  { key: 'tools', label: '工具' },
  { key: 'online', label: '联网' },
  { key: 'free', label: '免费' },
];

export default function ModelSelectorModal({
  open,
  onCancel,
  onSelect,
  currentProvider,
  currentModel,
}: ModelSelectorModalProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [providers, setProviders] = useState<AIProviderWithModels[]>([]);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<ModelWithProvider[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load providers and models
  useEffect(() => {
    if (open) {
      loadModels();
    }
  }, [open]);

  const loadModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await providerService.getProvidersWithModels();
      if ((response.code === 200 || response.code === 0) && response.data) {
        setProviders(response.data);

        // Flatten models with provider info
        const allModels: ModelWithProvider[] = [];
        response.data.forEach((provider) => {
          if (provider.is_enabled) {
            provider.models.forEach((model) => {
              if (model.is_enabled && model.capabilities.includes('chat')) {
                allModels.push({
                  provider: provider.id,
                  providerName: provider.provider_name,
                  providerType: provider.provider_type,
                  model: model.model_name,
                  displayName: model.display_name || model.model_name,
                  tags: model.capabilities || [],
                });
              }
            });
          }
        });
        setModels(allModels);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setError('无法加载模型列表，请检查后端服务是否正常运行');
    } finally {
      setLoading(false);
    }
  };

  // Filter models by search and tags
  const filteredModels = models.filter((model) => {
    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      const matchesSearch =
        model.displayName.toLowerCase().includes(search) ||
        model.providerName.toLowerCase().includes(search) ||
        model.model.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Tag filter
    if (selectedTags.length > 0) {
      const hasAllTags = selectedTags.every((tag) => model.tags.includes(tag));
      if (!hasAllTags) return false;
    }

    return true;
  });

  // Group by provider
  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = {
        providerName: model.providerName,
        models: [],
      };
    }
    acc[model.provider]!.models.push(model);
    return acc;
  }, {} as Record<string, { providerName: string; models: ModelWithProvider[] }>);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectModel = (model: ModelWithProvider) => {
    onSelect(model.provider, model.model, model.displayName, model.providerName);
    onCancel();
  };

  return (
    <Modal
      title="选择 AI 模型"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      styles={{
        body: { maxHeight: '70vh', padding: 0 },
      }}
    >
      <div className="flex flex-col">
        {/* Search */}
        <div className="border-b border-background-dark/10 p-4 dark:border-background-light/10">
          <Input
            placeholder="搜索模型..."
            prefix={<span className="material-symbols-outlined text-lg">search</span>}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Tags Filter */}
        <div className="border-b border-background-dark/10 px-4 py-3 dark:border-background-light/10">
          <div className="flex flex-wrap gap-2">
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag.key}
                onClick={() => toggleTag(tag.key)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selectedTags.includes(tag.key)
                    ? 'bg-primary text-white'
                    : 'bg-background-dark/5 text-background-dark hover:bg-background-dark/10 dark:bg-background-light/5 dark:text-background-light dark:hover:bg-background-light/10'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Model List */}
        <div className="max-h-[50vh] overflow-y-auto p-4">
          {loading ? (
            <div className="py-8 text-center text-background-dark-60 dark:text-background-light-60">
              加载中...
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-red-500">error</span>
              <p className="text-sm text-background-dark-60 dark:text-background-light-60">{error}</p>
            </div>
          ) : Object.keys(groupedModels).length === 0 ? (
            <div className="py-8 text-center text-background-dark-60 dark:text-background-light-60">
              没有找到匹配的模型
            </div>
          ) : (
            Object.entries(groupedModels).map(([providerId, group]) => (
              <div key={providerId} className="mb-6 last:mb-0">
                {/* Provider Name */}
                <h3 className="mb-3 text-sm font-semibold text-background-dark dark:text-background-light">
                  {group.providerName}
                </h3>

                {/* Models */}
                <div className="space-y-2">
                  {group.models.map((model) => {
                    const isSelected =
                      currentProvider === model.provider && currentModel === model.model;
                    return (
                      <div
                        key={`${model.provider}-${model.model}`}
                        onClick={() => handleSelectModel(model)}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-background-dark/10 hover:border-primary/50 hover:bg-background-dark/5 dark:border-background-light/10 dark:hover:bg-background-light/5'
                        }`}
                      >
                        {/* Model Icon */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-dark/5 dark:bg-background-light/5">
                          <span className="material-symbols-outlined text-background-dark-60 dark:text-background-light-60">
                            smart_toy
                          </span>
                        </div>

                        {/* Model Info */}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-background-dark dark:text-background-light">
                            {model.displayName}
                          </p>
                          <p className="text-xs text-background-dark-60 dark:text-background-light-60">
                            {model.model}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {model.tags.slice(0, 3).map((tag) => {
                            const tagConfig = FILTER_TAGS.find((t) => t.key === tag);
                            return tagConfig ? (
                              <span
                                key={tag}
                                className="rounded-full bg-background-dark/10 px-2 py-0.5 text-xs text-background-dark-60 dark:bg-background-light/10 dark:text-background-light-60"
                              >
                                {tagConfig.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
