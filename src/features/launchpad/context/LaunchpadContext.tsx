'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import {
  AssistantGroup,
  AssistantPreset,
  FileEntry,
  KnowledgeBase
} from '@/types/launchpad';
import { createInitialKnowledgeBases } from '@/features/launchpad/data/knowledge';
import { createInitialAssistantGroups } from '@/features/launchpad/data/assistants';
import { createInitialFiles } from '@/features/launchpad/data/files';
import { nanoid } from 'nanoid';

interface LaunchpadContextValue {
  knowledgeBases: KnowledgeBase[];
  addKnowledgeBase: (payload: { name: string }) => KnowledgeBase;
  renameKnowledgeBase: (id: string, name: string) => void;
  deleteKnowledgeBase: (id: string) => void;
  reorderKnowledgeBases: (sourceIndex: number, targetIndex: number) => void;
  setKnowledgeBasesOrder: (nextOrder: KnowledgeBase[]) => void;
  setKnowledgeRecognition: (id: string, mode: 'on' | 'off') => void;
  updateKnowledgeStats: (
    id: string,
    updates: Partial<KnowledgeBase['stats']>
  ) => void;
  updateKnowledgeItems: (
    id: string,
    updates: Partial<Pick<KnowledgeBase, 'files' | 'notes' | 'directories' | 'urls' | 'sitemaps'>>
  ) => void;
  updateKnowledgeBase: (
    id: string,
    updates: Partial<Pick<KnowledgeBase, 'description' | 'tags' | 'modelInfo' | 'stats'>>
  ) => void;

  assistantGroups: AssistantGroup[];
  addAssistantPreset: (
    payload: Omit<AssistantPreset, 'id' | 'source'> & { source?: AssistantPreset['source'] }
  ) => AssistantPreset;
  importAssistantPreset: (payload: AssistantPreset) => AssistantPreset;
  updateAssistantGroup: (groupId: string, updater: (group: AssistantGroup) => AssistantGroup) => void;

  files: FileEntry[];
  renameFile: (id: string, nextName: string) => void;
  deleteFile: (id: string) => void;
  deleteFiles: (ids: string[]) => void;
  addFileEntry: (payload: Omit<FileEntry, 'id' | 'formattedSize'> & { formattedSize?: string }) => FileEntry;
}

const LaunchpadContext = createContext<LaunchpadContextValue | undefined>(undefined);

const buildKnowledgeBase = (name: string): KnowledgeBase => ({
  id: nanoid(),
  name,
  description: '新的知识库描述，请补充详细信息。',
  tags: [],
  knowledgeRecognition: 'off',
  modelInfo: {
    provider: 'OpenAI',
    model: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small'
  },
  stats: {
    documents: 0,
    tokens: 0,
    size: '0 KB',
    lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
  },
  files: [],
  notes: [],
  directories: [],
  urls: [],
  sitemaps: []
});

const computeFormattedSize = (size: number): string => {
  if (size >= 1_048_576) {
    return `${(size / 1_048_576).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${size} B`;
};

export const LaunchpadProvider = ({ children }: { children: ReactNode }) => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(createInitialKnowledgeBases);
  const [assistantGroups, setAssistantGroups] = useState<AssistantGroup[]>(createInitialAssistantGroups);
  const [files, setFiles] = useState<FileEntry[]>(createInitialFiles);

  const addKnowledgeBase = useCallback((payload: { name: string }) => {
    const newBase = buildKnowledgeBase(payload.name.trim() || '未命名知识库');
    setKnowledgeBases((prev) => [newBase, ...prev]);
    return newBase;
  }, []);

  const renameKnowledgeBase = useCallback((id: string, name: string) => {
    setKnowledgeBases((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              name: name.trim() || item.name
            }
          : item
      )
    );
  }, []);

  const deleteKnowledgeBase = useCallback((id: string) => {
    setKnowledgeBases((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const reorderKnowledgeBases = useCallback((sourceIndex: number, targetIndex: number) => {
    setKnowledgeBases((prev) => {
      const next = [...prev];
      const [removed] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, removed);
      return next;
    });
  }, []);

  const setKnowledgeBasesOrder = useCallback((nextOrder: KnowledgeBase[]) => {
    setKnowledgeBases((prev) => {
      const map = new Map(prev.map((item) => [item.id, item]));
      return nextOrder
        .map((item) => map.get(item.id) ?? item)
        .filter(Boolean) as KnowledgeBase[];
    });
  }, []);

  const setKnowledgeRecognition = useCallback((id: string, mode: 'on' | 'off') => {
    setKnowledgeBases((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              knowledgeRecognition: mode
            }
          : item
      )
    );
  }, []);

  const updateKnowledgeStats = useCallback(
    (id: string, updates: Partial<KnowledgeBase['stats']>) => {
      setKnowledgeBases((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                stats: {
                  ...item.stats,
                  ...updates,
                  lastUpdated:
                    updates.lastUpdated ?? new Date().toISOString().slice(0, 16).replace('T', ' ')
                }
              }
            : item
        )
      );
    },
    []
  );

  const updateKnowledgeItems = useCallback(
    (
      id: string,
      updates: Partial<Pick<KnowledgeBase, 'files' | 'notes' | 'directories' | 'urls' | 'sitemaps'>>
    ) => {
      setKnowledgeBases((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates
              }
            : item
        )
      );
    },
    []
  );

  const updateKnowledgeBase = useCallback(
    (
      id: string,
      updates: Partial<Pick<KnowledgeBase, 'description' | 'tags' | 'modelInfo' | 'stats'>>
    ) => {
      setKnowledgeBases((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                description: updates.description ?? item.description,
                tags: updates.tags ?? item.tags,
                modelInfo: updates.modelInfo
                  ? { ...item.modelInfo, ...updates.modelInfo }
                  : item.modelInfo,
                stats: updates.stats
                  ? {
                      ...item.stats,
                      ...updates.stats,
                      lastUpdated:
                        updates.stats.lastUpdated ??
                        item.stats.lastUpdated ??
                        new Date().toISOString().slice(0, 16).replace('T', ' '),
                    }
                  : item.stats,
              }
            : item
        )
      );
    },
    []
  );

  const addAssistantPreset = useCallback(
    (payload: Omit<AssistantPreset, 'id' | 'source'> & { source?: AssistantPreset['source'] }) => {
      const newPreset: AssistantPreset = {
        ...payload,
        id: nanoid(),
        source: payload.source ?? 'custom'
      };

      setAssistantGroups((prev) =>
        prev.map((group) =>
          group.id === 'my-presets'
            ? {
                ...group,
                presets: [newPreset, ...group.presets]
              }
            : group
        )
      );

      return newPreset;
    },
    []
  );

  const importAssistantPreset = useCallback((preset: AssistantPreset) => {
    const importedPreset: AssistantPreset = {
      ...preset,
      id: nanoid(),
      source: preset.source ?? 'community'
    };

    setAssistantGroups((prev) =>
      prev.map((group) =>
        group.id === 'my-presets'
          ? {
              ...group,
              presets: [importedPreset, ...group.presets]
            }
          : group
      )
    );

    return importedPreset;
  }, []);

  const updateAssistantGroup = useCallback((groupId: string, updater: (group: AssistantGroup) => AssistantGroup) => {
    setAssistantGroups((prev) => prev.map((group) => (group.id === groupId ? updater(group) : group)));
  }, []);

  const renameFile = useCallback((id: string, nextName: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id
          ? {
              ...file,
              name: nextName.trim() || file.name,
              updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
            }
          : file
      )
    );
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const deleteFiles = useCallback((ids: string[]) => {
    setFiles((prev) => prev.filter((file) => !ids.includes(file.id)));
  }, []);

  const addFileEntry = useCallback(
    (payload: Omit<FileEntry, 'id' | 'formattedSize'> & { formattedSize?: string }) => {
      const entry: FileEntry = {
        ...payload,
        id: nanoid(),
        formattedSize: payload.formattedSize ?? computeFormattedSize(payload.size)
      };
      setFiles((prev) => [entry, ...prev]);
      return entry;
    },
    []
  );

  const value: LaunchpadContextValue = useMemo(
    () => ({
      knowledgeBases,
      addKnowledgeBase,
      renameKnowledgeBase,
      deleteKnowledgeBase,
      reorderKnowledgeBases,
      setKnowledgeBasesOrder,
      setKnowledgeRecognition,
      updateKnowledgeStats,
      updateKnowledgeItems,
      updateKnowledgeBase,
      assistantGroups,
      addAssistantPreset,
      importAssistantPreset,
      updateAssistantGroup,
      files,
      renameFile,
      deleteFile,
      deleteFiles,
      addFileEntry
    }),
    [
      knowledgeBases,
      addKnowledgeBase,
      renameKnowledgeBase,
      deleteKnowledgeBase,
      reorderKnowledgeBases,
      setKnowledgeBasesOrder,
      setKnowledgeRecognition,
      updateKnowledgeStats,
      updateKnowledgeItems,
      updateKnowledgeBase,
      assistantGroups,
      addAssistantPreset,
      importAssistantPreset,
      updateAssistantGroup,
      files,
      renameFile,
      deleteFile,
      deleteFiles,
      addFileEntry
    ]
  );

  return <LaunchpadContext.Provider value={value}>{children}</LaunchpadContext.Provider>;
};

export const useLaunchpadContext = (): LaunchpadContextValue => {
  const context = useContext(LaunchpadContext);
  if (!context) {
    throw new Error('useLaunchpadContext must be used within LaunchpadProvider');
  }
  return context;
};
