'use client';

import React, { useState, useEffect } from 'react';

interface ChatSidebarProps {
  quickQuestionsVisible?: boolean;
  onQuickQuestionsToggle?: (visible: boolean) => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
}

export default function ChatSidebar({
  quickQuestionsVisible = true,
  onQuickQuestionsToggle,
  fontSize: externalFontSize,
  onFontSizeChange
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState('assistant');
  const [selectedAgent, setSelectedAgent] = useState('agent2');
  const [selectedTopic, setSelectedTopic] = useState('topic2');
  const [contextMenu, setContextMenu] = useState<string | null>(null);

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

  const agents = [
    {
      id: 'agent1',
      name: 'Sophia Carter',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsGQkMevrV1xfrnxYhXpkT-wmLepqVNHg-cdU77AXXnTrry7xVATWIPqpisGBfTfWnEMcNdNPaxlvVkL2pz3MoYD0IXdV54MAjTsQt116QDbFOXUbMPovazMRdg9hEQfq-eY_v-_D03HTkGZKY7EoVv6IS4bqmx0x_o9iWPvvzN1PlJoNuLsqe9IQ36Q47WbcapcudX5FMpxYzEFWgLiPuN1iLjTAZdVE3B3JfTpTbAqeK29O9_Uy9fTBQhX-_27_naxKg1UrkCyU',
      count: 3,
    },
    {
      id: 'agent2',
      name: 'Olivia Bennett',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxRDCyUuNv3Wm-x08cB6y5i3ST3LSMQ3NKclHao7qDuZ9cOccfLtWRi9WP7h7nCZqCKmiiVhRd8hIn-bxpSXgeEM1GnyHm_2jgXC6Q0St_ER_27qcZfp2ahmXJ7U9qVAt9nYjhvhE0-xfchZHctIyIHVZpllL0ooGAmhe9d4xVxMSA27_EAPXfi0Xd4E5lcfBmA3HCZCuJto-FaCU_gg-KvLEfxcSDh-Qc2SqKMSg6m0508Z4Zudy0o90QnnCnEVMKVEg60lYFA4U',
      count: 1,
    },
    {
      id: 'agent3',
      name: 'Ethan Hayes',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxRDCyUuNv3Wm-x08cB6y5i3ST3LSMQ3NKclHao7qDuZ9cOccfLtWRi9WP7h7nCZqCKmiiVhRd8hIn-bxpSXgeEM1GnyHm_2jgXC6Q0St_ER_27qcZfp2ahmXJ7U9qVAt9nYjhvhE0-xfchZHctIyIHVZpllL0ooGAmhe9d4xVxMSA27_EAPXfi0Xd4E5lcfBmA3HCZCuJto-FaCU_gg-KvLEfxcSDh-Qc2SqKMSg6m0508Z4Zudy0o90QnnCnEVMKVEg60lYFA4U',
      count: 5,
    },
  ];

  const topicsList = [
    {
      id: 'topic1',
      title: 'Brainstorming session for the new marketing campaign',
    },
    {
      id: 'topic2',
      title: 'Q3 Financial Report Analysis',
    },
    {
      id: 'topic3',
      title: 'Customer feedback synthesis for product improvement',
    },
  ];

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) setContextMenu(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

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
        <div className="space-y-2 p-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-primary-10 dark:hover:bg-primary-20 ${
                selectedAgent === agent.id
                  ? 'bg-primary-10 dark:bg-primary-20'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url("${agent.avatar}")` }}
                />
                <p className="font-semibold text-background-dark dark:text-background-light">
                  {agent.name}
                </p>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background-dark-10 text-xs font-semibold text-background-dark dark:bg-background-light-10 dark:text-background-light">
                {agent.count}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Topics Tab - Historical Sessions */}
      {activeTab === 'topics' && (
        <div className="space-y-4 p-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-90">
            <span className="material-symbols-outlined text-base">add</span>
            <span>New Topic</span>
          </button>
          <div className="space-y-1">
            {topicsList.map((topic, index) => (
              <div
                key={topic.id}
                onClick={(e) => {
                  // Don't change selection if clicking on menu
                  if (!contextMenu) {
                    setSelectedTopic(topic.id);
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
                <p className="truncate pr-8 text-sm font-medium text-background-dark dark:text-background-light">
                  {topic.title}
                </p>
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
                          // Handle rename
                          console.log('Rename:', topic.id);
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
                          // Handle delete
                          console.log('Delete:', topic.id);
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
    </>
  );
}
