'use client';

import React, { useState, useEffect } from 'react';
import { chatService, Agent } from '@/services/chat';
import { topicService, Topic } from '@/services/topic';
import { favoritesService, AssistantFavoriteWithDetails } from '@/services/favorites';
import { App } from 'antd';

interface ChatSidebarProps {
  quickQuestionsVisible?: boolean;
  onQuickQuestionsToggle?: (visible: boolean) => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  onAgentChange?: (agentId: string | null) => void;
  onTopicChange?: (topicId: string | null) => void;
  onNewConversation?: (agentId: string) => void;
  onTopicModelChange?: (model: {
    providerId: string;
    modelId: string;
    modelName: string;
    providerName: string;
  } | null) => void;
}

export default function ChatSidebar({
  quickQuestionsVisible = true,
  onQuickQuestionsToggle,
  fontSize: externalFontSize,
  onFontSizeChange,
  onAgentChange,
  onTopicChange,
  onNewConversation,
  onTopicModelChange
}: ChatSidebarProps) {
  const { message, modal } = App.useApp();
  const [activeTab, setActiveTab] = useState('assistant');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<string | null>(null);
  const [favoriteAgents, setFavoriteAgents] = useState<AssistantFavoriteWithDetails[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicName, setEditingTopicName] = useState('');

  // Agent selection modal state
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAllAgents, setLoadingAllAgents] = useState(false);

  // Settings state
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [tempEnabled, setTempEnabled] = useState(true);
  const [temperature, setTemperature] = useState(0.5);
  const [contextEnabled, setContextEnabled] = useState(true);
  const [contextCount, setContextCount] = useState(10);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [maxTokenEnabled, setMaxTokenEnabled] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [autoCollapseEnabled, setAutoCollapseEnabled] = useState(false);
  const [internalFontSize, setInternalFontSize] = useState(14);

  const fontSize = externalFontSize ?? internalFontSize;

  // Load data when switching tabs
  useEffect(() => {
    if (activeTab === 'assistant') {
      loadFavorites();
    } else if (activeTab === 'topics') {
      loadTopics();
    }
  }, [activeTab]);

  const loadFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const response = await favoritesService.getFavorites();

      if ((response.code === 200 || response.code === 0) && response.data) {
        // Reverse the array to show newest first
        const reversedData = [...response.data].reverse();
        setFavoriteAgents(reversedData);
      } else if (response.code === 401) {
        // Unauthorized - user not logged in
        console.warn('User not authenticated, favorites unavailable');
        setFavoriteAgents([]);
      } else if (response.code === 404) {
        // API not implemented yet
        console.warn('Favorites API not implemented yet');
        setFavoriteAgents([]);
      } else {
        // Other errors - use empty list
        console.warn('Favorites API error:', response);
        setFavoriteAgents([]);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavoriteAgents([]);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await topicService.getAllTopics();

      if ((response.code === 200 || response.code === 0) && response.data) {
        const topicsData = Array.isArray(response.data) ? response.data : [];
        // Sort by created_at descending (newest first)
        const sortedTopics = topicsData.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTopics(sortedTopics);
      } else {
        setTopics([]);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  const loadAllAgents = async () => {
    setLoadingAllAgents(true);
    try {
      const response = await chatService.getAgents({
        page: 1,
        page_size: 100,
      });

      if (response.data && response.data.items) {
        setAllAgents(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load all agents:', error);
      message.error('Failed to load agents');
    } finally {
      setLoadingAllAgents(false);
    }
  };

  const handleOpenAgentModal = () => {
    setShowAgentModal(true);
    setSearchQuery('');
    loadAllAgents();
  };

  const handleCloseAgentModal = () => {
    setShowAgentModal(false);
    setSearchQuery('');
  };

  const handleSelectAgent = async (agent: Agent) => {
    try {
      // Add agent to favorites via API
      await favoritesService.addFavorite({ assistant_id: agent.id });

      // Reload favorites list
      await loadFavorites();

      // Select the agent
      setSelectedAgent(agent.id);
      onAgentChange?.(agent.id);
      setSelectedTopic(null);
      onTopicChange?.(null);

      // Don't close modal - let user continue adding more assistants
      message.success('Assistant added to favorites');
    } catch (error: any) {
      if (error.message?.includes('already in favorites')) {
        message.warning('Assistant is already in favorites');
        // Still select it but don't close modal
        setSelectedAgent(agent.id);
        onAgentChange?.(agent.id);
      } else {
        message.error('Failed to add assistant to favorites');
      }
    }
  };

  const handleRemoveFavorite = async (assistantId: string) => {
    try {
      await favoritesService.removeFavorite(assistantId);

      // Reload favorites list
      await loadFavorites();

      // Unselect if currently selected
      if (selectedAgent === assistantId) {
        setSelectedAgent(null);
        onAgentChange?.(null);
        setSelectedTopic(null);
        onTopicChange?.(null);
      }

      message.success('Assistant removed from favorites');
    } catch (error: any) {
      message.error('Failed to remove assistant from favorites');
    }
  };

  // Filter agents based on search query
  const filteredAgents = allAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRenameTopic = async (topicId: string, newName: string) => {
    if (!selectedAgent) return;

    try {
      const response = await topicService.updateTopic(selectedAgent, topicId, {
        name: newName,
      });

      if ((response.code === 200 || response.code === 0) && response.data) {
        message.success('Topic renamed successfully');
        loadTopics();
        setEditingTopicId(null);
        setContextMenu(null);
      } else {
        message.error(response.message || 'Failed to rename topic');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to rename topic');
    }
  };

  const handleDeleteTopic = async (topicId: string, assistantId: string) => {
    modal.confirm({
      title: 'Delete Topic',
      content: 'Are you sure you want to delete this topic? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await topicService.deleteTopic(assistantId, topicId);

          if ((response.code === 200 || response.code === 0)) {
            message.success('Topic deleted successfully');
            if (selectedTopic === topicId) {
              setSelectedTopic(null);
            }

            // Also delete the saved model info from localStorage
            const topicModelKey = `topic_model_${topicId}`;
            localStorage.removeItem(topicModelKey);

            loadTopics();
          } else {
            message.error(response.message || 'Failed to delete topic');
          }
        } catch (error: any) {
          message.error(error.message || 'Failed to delete topic');
        }
      },
    });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) setContextMenu(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showAgentModal && !target.closest('.agent-modal-content')) {
        handleCloseAgentModal();
      }
    };
    if (showAgentModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAgentModal]);

  return (
    <>
      <div className="sticky top-0">
      <div className="bg-background-light dark:bg-background-dark">
        <div className="flex border-b border-background-dark-10 dark:border-background-light-10">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`relative flex-1 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'assistant'
                ? 'text-primary border-primary'
                : 'text-background-dark-60 dark:text-background-light-60 border-transparent'
            }`}
          >
            Assistant
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`relative flex-1 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'topics'
                ? 'text-primary border-primary'
                : 'text-background-dark-60 dark:text-background-light-60 border-transparent'
            }`}
          >
            Topics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`relative flex-1 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-primary border-primary'
                : 'text-background-dark-60 dark:text-background-light-60 border-transparent'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Assistant Tab */}
      {activeTab === 'assistant' && (
        <div className="space-y-4 p-4">
          <button
            onClick={handleOpenAgentModal}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-90"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>添加助手</span>
          </button>
          {loadingFavorites ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-background-dark-60 dark:text-background-light-60">
                Loading favorites...
              </div>
            </div>
          ) : favoriteAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-background-dark-30 dark:text-background-light-30">
                star_border
              </span>
              <p className="text-sm text-background-dark-60 dark:text-background-light-60">
                No favorite assistants
              </p>
              <p className="mt-1 text-xs text-background-dark-40 dark:text-background-light-40">
                Click "添加助手" to add your favorites
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {favoriteAgents.map((favorite) => (
                <div
                  key={favorite.id}
                  onClick={() => {
                    // Switch to Topics tab and start new conversation
                    setSelectedAgent(favorite.assistant_id);
                    onAgentChange?.(favorite.assistant_id);
                    setActiveTab('topics');
                    setSelectedTopic(null);
                    onTopicChange?.(null);
                    onNewConversation?.(favorite.assistant_id);
                  }}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-primary-10 dark:hover:bg-primary-20 ${
                    selectedAgent === favorite.assistant_id
                      ? 'bg-primary-10 dark:bg-primary-20'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-10 text-2xl dark:bg-primary-20">
                      {favorite.assistant_emoji || '🤖'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-semibold text-background-dark dark:text-background-light">
                        {favorite.assistant_name}
                      </p>
                      {favorite.assistant_tags && Array.isArray(favorite.assistant_tags) && favorite.assistant_tags.length > 0 && (
                        <p className="truncate text-xs text-background-dark-60 dark:text-background-light-60">
                          {favorite.assistant_tags.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.assistant_id);
                    }}
                    className="hidden h-7 w-7 items-center justify-center rounded-md text-background-dark-60 transition-colors hover:bg-red-500/10 hover:text-red-500 group-hover:flex"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Topics Tab - Historical Sessions */}
      {activeTab === 'topics' && (
        <div className="space-y-4 p-4">
          {loadingTopics ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-background-dark-60 dark:text-background-light-60">
                Loading topics...
              </div>
            </div>
          ) : topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-background-dark-30 dark:text-background-light-30">
                chat_bubble
              </span>
              <p className="text-sm text-background-dark-60 dark:text-background-light-60">
                No topics yet
              </p>
              <p className="mt-1 text-xs text-background-dark-40 dark:text-background-light-40">
                Create a new topic to start chatting
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {topics.map((topic, index) => (
              <div
                key={topic.id}
                onClick={() => {
                  // Don't change selection if clicking on menu
                  if (!contextMenu) {
                    setSelectedTopic(topic.id);
                    onTopicChange?.(topic.id);

                    // Try to load model info from localStorage
                    const topicModelKey = `topic_model_${topic.id}`;
                    const savedModelStr = localStorage.getItem(topicModelKey);
                    if (savedModelStr) {
                      try {
                        const savedModel = JSON.parse(savedModelStr);
                        onTopicModelChange?.(savedModel);
                        console.log('✅ [ChatSidebar] Loaded model for topic:', topic.id, savedModel);
                      } catch (error) {
                        console.error('Failed to parse saved model:', error);
                      }
                    }
                  }
                }}
                className={`group relative cursor-pointer rounded-lg p-2 ${
                  // Disable hover when any menu is open
                  !contextMenu && 'hover:bg-primary-10 dark:hover:bg-primary-20'
                } ${
                  selectedTopic === topic.id
                    ? 'bg-primary-10 dark:bg-primary-20'
                    : ''
                }`}
                style={{
                  // Disable pointer events on items when menu is open, except for the item with open menu
                  pointerEvents: contextMenu && contextMenu !== topic.id ? 'none' : 'auto',
                  // Set higher z-index for item with open menu
                  zIndex: contextMenu === topic.id ? 100 : index,
                  position: 'relative',
                }}
              >
                {editingTopicId === topic.id ? (
                  <input
                    type="text"
                    value={editingTopicName}
                    onChange={(e) => setEditingTopicName(e.target.value)}
                    onBlur={() => {
                      if (editingTopicName.trim()) {
                        handleRenameTopic(topic.id, editingTopicName.trim());
                      } else {
                        setEditingTopicId(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingTopicName.trim()) {
                          handleRenameTopic(topic.id, editingTopicName.trim());
                        }
                      } else if (e.key === 'Escape') {
                        setEditingTopicId(null);
                      }
                    }}
                    autoFocus
                    className="w-full rounded border border-primary bg-background-light px-2 py-1 text-sm font-medium text-background-dark outline-none dark:bg-background-dark dark:text-background-light"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="truncate pr-8 text-sm font-medium text-background-dark dark:text-background-light">
                    {topic.name}
                  </p>
                )}
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu(contextMenu === topic.id ? null : topic.id);
                    }}
                    className={`h-7 w-7 items-center justify-center rounded-md text-background-dark-60 dark:text-background-light-60 ${
                      contextMenu === topic.id ? 'flex' : 'hidden group-hover:flex'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">more_horiz</span>
                  </button>
                  {contextMenu === topic.id && (
                    <div
                      className="absolute right-0 top-full z-[101] mt-1 w-36 rounded-lg border border-background-dark-10 bg-background-light p-1 shadow-lg dark:border-background-light-10 dark:bg-background-dark"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingTopicId(topic.id);
                          setEditingTopicName(topic.name);
                          setContextMenu(null);
                        }}
                        className="block rounded-md px-3 py-1.5 text-left text-sm text-background-dark hover:bg-background-dark-5 dark:text-background-light dark:hover:bg-background-light-5"
                      >
                        Rename
                      </a>
                      <hr className="my-1 border-background-dark-10 dark:border-background-light-10" />
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteTopic(topic.id, topic.assistant_id);
                        }}
                        className="block rounded-md px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-500/10"
                      >
                        Delete
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="p-4">
          <div className="space-y-2">
            {/* Assistant Settings Accordion */}
            <div className="rounded-lg border border-background-dark-10 dark:border-background-light-10">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'assistant' ? null : 'assistant')}
                className="flex w-full items-center justify-between p-3 font-medium text-background-dark dark:text-background-light"
              >
                <span>Assistant Settings</span>
                <span className="material-symbols-outlined">
                  {openAccordion === 'assistant' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {openAccordion === 'assistant' && (
                <div className="space-y-4 p-3 pt-0">
                  {/* Model Temperature */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-background-dark dark:text-background-light">
                          Model Temperature
                        </span>
                        <div className="group relative">
                          <span className="material-symbols-outlined cursor-pointer text-base text-background-dark-60 dark:text-background-light-60">
                            help
                          </span>
                          <span className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                            Controls randomness. Lower is more deterministic.
                          </span>
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={tempEnabled}
                          onChange={(e) => setTempEnabled(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-background-dark-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-background-light-20"></div>
                      </label>
                    </div>
                    <div className="mt-3">
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        disabled={!tempEnabled}
                        className={`w-full ${!tempEnabled && 'opacity-50 cursor-not-allowed'}`}
                      />
                      <div className="text-right text-xs text-background-dark-60 dark:text-background-light-60">
                        {temperature}
                      </div>
                    </div>
                  </div>

                  <hr className="border-background-dark-10 dark:border-background-light-10" />

                  {/* Context Count */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-background-dark dark:text-background-light">
                          Context Count
                        </span>
                        <div className="group relative">
                          <span className="material-symbols-outlined cursor-pointer text-base text-background-dark-60 dark:text-background-light-60">
                            help
                          </span>
                          <span className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                            Number of past messages to include.
                          </span>
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={contextEnabled}
                          onChange={(e) => setContextEnabled(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-background-dark-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-background-light-20"></div>
                      </label>
                    </div>
                    <div className="mt-3">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={contextCount}
                        onChange={(e) => setContextCount(parseInt(e.target.value))}
                        disabled={!contextEnabled}
                        className={`w-full ${!contextEnabled && 'opacity-50 cursor-not-allowed'}`}
                      />
                      <div className="text-right text-xs text-background-dark-60 dark:text-background-light-60">
                        {contextCount}
                      </div>
                    </div>
                  </div>

                  <hr className="border-background-dark-10 dark:border-background-light-10" />

                  {/* Streaming Output */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-background-dark dark:text-background-light">
                      Streaming Output
                    </span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={streamingEnabled}
                        onChange={(e) => setStreamingEnabled(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-background-dark-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-background-light-20"></div>
                    </label>
                  </div>

                  <hr className="border-background-dark-10 dark:border-background-light-10" />

                  {/* Max Token Count */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-background-dark dark:text-background-light">
                          Max Token Count
                        </span>
                        <div className="group relative">
                          <span className="material-symbols-outlined cursor-pointer text-base text-background-dark-60 dark:text-background-light-60">
                            help
                          </span>
                          <span className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                            Maximum tokens in a response.
                          </span>
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={maxTokenEnabled}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShowTokenDialog(true);
                            } else {
                              setMaxTokenEnabled(false);
                              setShowTokenInput(false);
                            }
                          }}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-background-dark-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-background-light-20"></div>
                      </label>
                    </div>
                    {showTokenInput && (
                      <div className="mt-3">
                        <input
                          type="number"
                          placeholder="Enter token count"
                          className="form-input mt-1 block w-full rounded-md border-background-dark-20 bg-background-light text-sm text-background-dark focus:border-primary focus:ring-primary dark:border-background-light-20 dark:bg-background-dark dark:text-background-light"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Message Settings Accordion */}
            <div className="rounded-lg border border-background-dark-10 dark:border-background-light-10">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'message' ? null : 'message')}
                className="flex w-full items-center justify-between p-3 font-medium text-background-dark dark:text-background-light"
              >
                <span>Message Settings</span>
                <span className="material-symbols-outlined">
                  {openAccordion === 'message' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {openAccordion === 'message' && (
                <div className="space-y-4 p-3 pt-0">
                  {/* Quick Questions */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-background-dark dark:text-background-light">
                      Quick Questions
                    </span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={quickQuestionsVisible}
                        onChange={(e) => {
                          onQuickQuestionsToggle?.(e.target.checked);
                        }}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-background-dark-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-background-light-20"></div>
                    </label>
                  </div>

                  <hr className="border-background-dark-10 dark:border-background-light-10" />

                  {/* Auto-collapse Thinking Content */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-background-dark dark:text-background-light">
                        Auto-collapse Thinking Content
                      </span>
                      <div className="group relative">
                        <span className="material-symbols-outlined cursor-pointer text-base text-background-dark-60 dark:text-background-light-60">
                          help
                        </span>
                        <span className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                          Automatically collapse the 'thinking' process display.
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={autoCollapseEnabled}
                        onChange={(e) => setAutoCollapseEnabled(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-background-dark-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-background-light-20"></div>
                    </label>
                  </div>

                  <hr className="border-background-dark-10 dark:border-background-light-10" />

                  {/* Message Font Size */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-background-dark dark:text-background-light">
                        Message Font Size
                      </label>
                      <div className="group relative">
                        <span className="material-symbols-outlined cursor-pointer text-base text-background-dark-60 dark:text-background-light-60">
                          help
                        </span>
                        <span className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                          Controls the font size of the chat conversation content.
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <input
                        type="range"
                        min="12"
                        max="22"
                        step="1"
                        value={fontSize}
                        onChange={(e) => {
                          const size = parseInt(e.target.value);
                          setInternalFontSize(size);
                          onFontSizeChange?.(size);
                        }}
                        className="w-full"
                      />
                      <div className="text-right text-xs text-background-dark-60 dark:text-background-light-60">
                        {fontSize}px
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
      </div>

      {/* Token Dialog - Rendered at portal level */}
      {showTokenDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-sm rounded-lg bg-background-light p-6 shadow-xl dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-background-dark dark:text-background-light">
              Enable Max Token Count?
            </h3>
            <p className="mt-2 text-sm text-background-dark-80 dark:text-background-light-80">
              Are you sure you want to enable and set a maximum token count?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTokenDialog(false);
                  setMaxTokenEnabled(false);
                }}
                className="rounded-md border border-background-dark-20 px-4 py-2 text-sm font-medium text-background-dark transition-colors hover:bg-background-dark-5 dark:border-background-light-20 dark:text-background-light dark:hover:bg-background-light-5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTokenDialog(false);
                  setMaxTokenEnabled(true);
                  setShowTokenInput(true);
                }}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Selection Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div
            className="agent-modal-content relative flex h-[600px] w-full max-w-lg flex-col rounded-lg bg-background-light shadow-xl dark:bg-background-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseAgentModal}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-background-dark-60 transition-colors hover:bg-background-dark-10 dark:text-background-light-60 dark:hover:bg-background-light-10"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Search input */}
            <div className="p-6 pb-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-background-dark-40 dark:text-background-light-40">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索助手"
                  className="w-full rounded-lg border-0 bg-background-dark-5 py-2.5 pl-10 pr-4 text-sm text-background-dark outline-none ring-1 ring-transparent transition-all focus:bg-background-light focus:ring-primary dark:bg-background-light-5 dark:text-background-light dark:focus:bg-background-dark"
                  autoFocus
                />
              </div>
            </div>

            {/* Agent list */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {loadingAllAgents ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-sm text-background-dark-60 dark:text-background-light-60">
                    Loading agents...
                  </div>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined mb-2 text-4xl text-background-dark-30 dark:text-background-light-30">
                    search_off
                  </span>
                  <p className="text-sm text-background-dark-60 dark:text-background-light-60">
                    No agents found
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => handleSelectAgent(agent)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-primary-10 dark:hover:bg-primary-20"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-10 text-2xl dark:bg-primary-20">
                        {agent.emoji || '🤖'}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-semibold text-background-dark dark:text-background-light">
                          {agent.name}
                        </p>
                        {agent.tags && agent.tags.length > 0 && (
                          <p className="truncate text-xs text-background-dark-60 dark:text-background-light-60">
                            {agent.tags.slice(0, 2).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
