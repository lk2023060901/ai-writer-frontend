'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import type {
  Assistant,
  AssistantSettings,
  AssistantCustomParameter,
  MCPServer,
  Topic,
} from '@/features/chat/hooks/useMockData';
import { mockAssistants, createDefaultTopic } from '@/features/chat/hooks/useMockData';

interface ChatState {
  assistants: Assistant[];
  activeAssistantId: string;
  activeTopicByAssistant: Record<string, string>;
}

interface ChatContextValue {
  assistants: Assistant[];
  activeAssistant: Assistant;
  activeTopic: Topic;
  setActiveAssistant: (assistantId: string) => void;
  setActiveTopic: (topic: Topic) => void;
  addTopic: (assistantId: string, topic: Topic) => void;
  updateTopic: (assistantId: string, topic: Topic) => void;
  removeTopic: (assistantId: string, topicId: string) => void;
  updateAssistant: (assistantId: string, updates: Partial<Assistant>) => void;
  updateAssistantSettings: (assistantId: string, updates: Partial<AssistantSettings>) => void;
  updateCustomParameters: (
    assistantId: string,
    updater: (params: AssistantCustomParameter[]) => AssistantCustomParameter[],
  ) => void;
  updateMcpServers: (assistantId: string, servers: MCPServer[]) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

function buildInitialState(): ChatState {
  const assistants = mockAssistants;
  const firstAssistantId = assistants[0]?.id ?? '';
  const activeTopicByAssistant = assistants.reduce<Record<string, string>>((acc, assistant) => {
    const firstTopicId = assistant.topics[0]?.id;
    if (firstTopicId) {
      acc[assistant.id] = firstTopicId;
    }
    return acc;
  }, {});

  return {
    assistants,
    activeAssistantId: firstAssistantId,
    activeTopicByAssistant,
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatState>(() => buildInitialState());

  const { assistants, activeAssistantId, activeTopicByAssistant } = state;
  const activeAssistant = assistants.find((item) => item.id === activeAssistantId) ?? assistants[0];

  const activeTopicId = activeAssistant
    ? activeTopicByAssistant[activeAssistant.id] ?? activeAssistant.topics[0]?.id
    : undefined;
  const activeTopic = activeAssistant?.topics.find((topic) => topic.id === activeTopicId);

  const setActiveAssistant = useCallback((assistantId: string) => {
    setState((prev) => ({
      ...prev,
      activeAssistantId: assistantId,
      activeTopicByAssistant: {
        ...prev.activeTopicByAssistant,
        [assistantId]:
          prev.activeTopicByAssistant[assistantId] ||
          prev.assistants.find((assistant) => assistant.id === assistantId)?.topics[0]?.id ||
          '',
      },
    }));
  }, []);

  const setActiveTopic = useCallback((topic: Topic) => {
    setState((prev) => {
      if (!prev.activeAssistantId) return prev;
      return {
        ...prev,
        activeTopicByAssistant: {
          ...prev.activeTopicByAssistant,
          [prev.activeAssistantId]: topic.id,
        },
      };
    });
  }, []);

  const updateAssistant = useCallback((assistantId: string, updates: Partial<Assistant>) => {
    setState((prev) => ({
      ...prev,
      assistants: prev.assistants.map((assistant) =>
        assistant.id === assistantId ? { ...assistant, ...updates } : assistant,
      ),
    }));
  }, []);

  const updateAssistantSettings = useCallback(
    (assistantId: string, updates: Partial<AssistantSettings>) => {
      setState((prev) => ({
        ...prev,
        assistants: prev.assistants.map((assistant) =>
          assistant.id === assistantId
            ? {
                ...assistant,
                settings: {
                  ...assistant.settings,
                  ...updates,
                },
              }
            : assistant,
        ),
      }));
    },
    [],
  );

  const updateCustomParameters = useCallback(
    (
      assistantId: string,
      updater: (params: AssistantCustomParameter[]) => AssistantCustomParameter[],
    ) => {
      setState((prev) => ({
        ...prev,
        assistants: prev.assistants.map((assistant) =>
          assistant.id === assistantId
            ? {
                ...assistant,
                settings: {
                  ...assistant.settings,
                  customParameters: updater(assistant.settings.customParameters ?? []),
                },
              }
            : assistant,
        ),
      }));
    },
    [],
  );

  const addTopic = useCallback((assistantId: string, topic: Topic) => {
    const normalizedTopic: Topic = {
      ...topic,
      assistantId,
      createdAt: topic.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      assistants: prev.assistants.map((assistant) =>
        assistant.id === assistantId
          ? {
              ...assistant,
              topics: [...assistant.topics, normalizedTopic],
            }
          : assistant,
      ),
      activeTopicByAssistant: {
        ...prev.activeTopicByAssistant,
        [assistantId]: normalizedTopic.id,
      },
    }));
  }, []);

  const updateTopic = useCallback((assistantId: string, topic: Topic) => {
    const normalizedTopic: Topic = {
      ...topic,
      assistantId,
      updatedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      assistants: prev.assistants.map((assistant) =>
        assistant.id === assistantId
          ? {
              ...assistant,
              topics: assistant.topics.some((item) => item.id === topic.id)
                ? assistant.topics.map((item) => (item.id === topic.id ? normalizedTopic : item))
                : [...assistant.topics, normalizedTopic],
            }
          : assistant,
      ),
      activeTopicByAssistant: {
        ...prev.activeTopicByAssistant,
        [assistantId]: normalizedTopic.id,
      },
    }));
  }, []);

  const removeTopic = useCallback((assistantId: string, topicId: string) => {
    setState((prev) => {
      const assistant = prev.assistants.find((item) => item.id === assistantId);
      if (!assistant) {
        return prev;
      }

      const remainingTopics = assistant.topics.filter((topic) => topic.id !== topicId);
      const shouldCreateFallback = remainingTopics.length === 0;
      const fallbackTopic = shouldCreateFallback ? createDefaultTopic(assistantId) : null;
      const updatedTopics = shouldCreateFallback
        ? [fallbackTopic!]
        : remainingTopics;

      const previousActive = prev.activeTopicByAssistant[assistantId];
      const nextActive =
        previousActive && previousActive !== topicId
          ? previousActive
          : updatedTopics[0]?.id ?? '';

      return {
        ...prev,
        assistants: prev.assistants.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                topics: updatedTopics,
              }
            : item,
        ),
        activeTopicByAssistant: {
          ...prev.activeTopicByAssistant,
          [assistantId]: nextActive,
        },
      };
    });
  }, []);

  const updateMcpServers = useCallback((assistantId: string, servers: MCPServer[]) => {
    setState((prev) => ({
      ...prev,
      assistants: prev.assistants.map((assistant) =>
        assistant.id === assistantId
          ? {
              ...assistant,
              mcpServers: servers,
            }
          : assistant,
      ),
    }));
  }, []);

  const value = useMemo<ChatContextValue>(() => {
    if (!activeAssistant) {
      const fallbackTopic: Topic = {
        id: nanoid(),
        assistantId: 'fallback',
        name: '默认话题',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      return {
        assistants,
        activeAssistant: {
          id: 'fallback',
          name: 'Fallback Assistant',
          prompt: '',
          type: 'chat',
          topics: [fallbackTopic],
          settings: mockAssistants[0]?.settings ?? {
            temperature: 1,
            enableTemperature: true,
            contextCount: 10,
            enableMaxTokens: false,
            maxTokens: 0,
            streamOutput: true,
            topP: 1,
            enableTopP: false,
            toolUseMode: 'prompt',
            customParameters: [],
          },
        },
        activeTopic: fallbackTopic,
        setActiveAssistant,
        setActiveTopic,
        addTopic,
        updateTopic,
        removeTopic,
        updateAssistant,
        updateAssistantSettings,
        updateCustomParameters,
        updateMcpServers,
      };
    }

    return {
      assistants,
      activeAssistant,
      activeTopic: activeTopic ?? activeAssistant.topics[0],
      setActiveAssistant,
      setActiveTopic,
      addTopic,
      updateTopic,
      removeTopic,
      updateAssistant,
      updateAssistantSettings,
      updateCustomParameters,
      updateMcpServers,
    };
  }, [
    assistants,
    activeAssistant,
    activeTopic,
    addTopic,
    setActiveAssistant,
    setActiveTopic,
    updateAssistant,
    updateTopic,
    removeTopic,
    updateAssistantSettings,
    updateCustomParameters,
    updateMcpServers,
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

export function useChatAssistants() {
  const { assistants, activeAssistant, setActiveAssistant } = useChatContext();
  return { assistants, activeAssistant, setActiveAssistant };
}

export function useChatTopics() {
  const { activeAssistant, activeTopic, setActiveTopic, addTopic, updateTopic, removeTopic } =
    useChatContext();
  return { activeAssistant, activeTopic, setActiveTopic, addTopic, updateTopic, removeTopic };
}

export function useChatSettings() {
  const {
    activeAssistant,
    updateAssistant,
    updateAssistantSettings,
    updateCustomParameters,
  } = useChatContext();

  return {
    activeAssistant,
    updateAssistant,
    updateAssistantSettings,
    updateCustomParameters,
  };
}
