'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { App } from 'antd';
import { chatService, Message as APIMessage } from '@/services/chat';

interface ChatMessagesProps {
  topicId: string;
  quickQuestionsVisible?: boolean;
  fontSize?: number;
  streamingMessages?: Map<string, {
    provider: string;
    model: string;
    content: string;
    isStreaming: boolean;
  }>;
  refreshKey?: number;
}

const GeminiIcon = () => (
  <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.0007 10.9439L15.932 5.61328L17.2941 6.55995L12.0007 13.0561L6.70605 6.56067L8.06817 5.614L12.0007 10.9439Z" />
    <path
      d="M12.0007 13.0561L17.2941 19.5522L15.932 20.4989L12.0007 15.1682L8.06817 20.4989L6.70605 19.5522L12.0007 13.0561Z"
      opacity="0.4"
    />
    <path d="M10.9439 12.0007L5.61328 8.06817L6.55995 6.70605L13.0561 12.0007L6.56067 17.2941L5.614 15.932L10.9439 12.0007Z" />
    <path
      d="M13.0561 12.0007L19.5522 6.70605L20.4989 8.06817L15.1682 12.0007L20.4989 15.932L19.5522 17.2941L13.0561 12.0007Z"
      opacity="0.4"
    />
  </svg>
);

export default function ChatMessages({ topicId, quickQuestionsVisible = true, fontSize = 14, streamingMessages, refreshKey }: ChatMessagesProps) {
  const { message } = App.useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [messages, setMessages] = useState<APIMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const suggestions = [
    'What is the weather like today?',
    'Explain quantum computing',
    'Translate "hello" to Spanish',
    'Summarize the latest news',
    'Give me a recipe for chocolate cake',
    'Who won the last world cup?',
  ];

  // Debounced scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }, 100);
  }, []);

  useEffect(() => {
    if (topicId) {
      loadMessages();
    }
  }, [topicId, refreshKey]);

  // Auto scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Auto scroll when streaming messages update
  useEffect(() => {
    if (streamingMessages && streamingMessages.size > 0) {
      scrollToBottom();
    }
  }, [streamingMessages, scrollToBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await chatService.getMessages(topicId, {
        limit: 100,
        offset: 0,
      });

      if ((response.code === 200 || response.code === 0) && response.data) {
        console.log('📋 [ChatMessages] Loaded messages:', response.data.messages);
        response.data.messages?.forEach((msg, idx) => {
          console.log(`  Message ${idx}: role=${msg.role}, model=${msg.model || 'N/A'}, content_blocks=`, msg.content_blocks);
        });
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      message.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col chat-messages-container">
      {/* Suggestions - Fixed height section */}
      {quickQuestionsVisible && (
        <div className="flex-shrink-0 px-6 pt-1 pb-3 lg:px-6 md:px-4 sm:px-3">
          <div className="rounded-lg border border-background-dark/10 bg-background-light px-4 py-3 dark:border-background-light/10 dark:bg-background-dark">
            <div className="flex max-h-20 flex-wrap gap-2 overflow-y-hidden [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="rounded-full border border-background-dark/10 px-3 py-1 text-sm text-background-dark/80 transition-colors hover:bg-primary/10 hover:text-primary dark:border-background-light/10 dark:text-background-light/80 dark:hover:bg-primary/20"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages - Scrollable section */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 chat-messages-scroll lg:px-6 md:px-4 sm:px-3">
        <div className="pt-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-background-dark-60 dark:text-background-light-60">
                Loading messages...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-background-dark-30 dark:text-background-light-30">
                chat
              </span>
              <p className="text-sm text-background-dark-60 dark:text-background-light-60">
                No messages yet
              </p>
              <p className="mt-1 text-xs text-background-dark-40 dark:text-background-light-40">
                Start a conversation below
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              // Extract text content from content_blocks
              const textContent = msg.content_blocks
                .filter(block => block.type === 'text')
                .map(block => block.text)
                .join('\n');

              const timestamp = new Date(msg.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });

              // Debug: log role to console
              console.log(`Message ${index}: role="${msg.role}", text preview:`, textContent.substring(0, 50));

              if (msg.role === 'assistant') {
                return (
                  <div key={msg.id} className={`flex items-start gap-4 ${index > 0 ? 'pt-6' : ''}`}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                      <GeminiIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-background-dark dark:text-background-light">
                          {msg.model || 'Assistant'}
                        </p>
                        {msg.provider && (
                          <span className="text-xs text-background-dark/40 dark:text-background-light/40">
                            • Provider: {msg.provider}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 rounded-lg bg-background-dark/5 p-3 dark:bg-background-light/5">
                        <p className="whitespace-pre-wrap break-words text-background-dark dark:text-background-light" style={{ fontSize: `${fontSize}px` }}>
                          {textContent}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-background-dark/60 dark:text-background-light/60">
                        <span>{timestamp}</span>
                        {msg.token_count && (
                          <>
                            <span>•</span>
                            <span>{msg.token_count} tokens</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex items-start justify-end gap-4 ${index > 0 ? 'pt-6' : ''}`}>
                  <div className="flex-1 text-right min-w-0">
                    <p className="font-semibold text-background-dark dark:text-background-light">
                      You
                    </p>
                    <div className="mt-2 rounded-lg bg-primary/10 p-3 dark:bg-primary/20">
                      <p className="whitespace-pre-wrap break-words text-background-dark dark:text-background-light" style={{ fontSize: `${fontSize}px` }}>
                        {textContent}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-background-dark/60 dark:text-background-light/60">
                      {timestamp}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white font-semibold">
                    U
                  </div>
                </div>
              );
            })
          )}

          {/* Streaming Messages */}
          {streamingMessages && Array.from(streamingMessages.entries()).map(([provider, streamMsg], idx) => (
            <div key={provider} className={`flex items-start gap-4 ${(messages.length > 0 || idx > 0) ? 'pt-6' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                <GeminiIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-background-dark dark:text-background-light">
                    {streamMsg.model || 'Assistant'}
                  </p>
                  <span className="text-xs text-background-dark/40 dark:text-background-light/40">
                    • Provider: {streamMsg.provider}
                  </span>
                </div>
                <div className="mt-2 rounded-lg bg-background-dark/5 p-3 dark:bg-background-light/5">
                  <p className="whitespace-pre-wrap break-words text-background-dark dark:text-background-light" style={{ fontSize: `${fontSize}px` }}>
                    {streamMsg.content}
                    {streamMsg.isStreaming && (
                      <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
