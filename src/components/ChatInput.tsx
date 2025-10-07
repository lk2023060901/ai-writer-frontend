'use client';

import React, { useState } from 'react';
import { topicService } from '@/services/topic';
import { chatService } from '@/services/chat';
import { App } from 'antd';

interface ChatInputProps {
  topicId?: string | null;
  assistantId?: string | null;
  selectedModel?: {
    providerId: string;
    modelId: string;
    modelName: string;
    providerName: string;
  } | null;
  onTopicCreated?: (topicId: string) => void;
  onMessageStart?: () => void;
  onMessageComplete?: () => void;
  onToken?: (content: string) => void;
}

export default function ChatInput({
  topicId,
  assistantId,
  selectedModel,
  onTopicCreated,
  onMessageStart,
  onMessageComplete,
  onToken,
}: ChatInputProps) {
  const { message: antdMessage } = App.useApp();
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const [fileName, setFileName] = useState('document.pdf');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    console.log('🚀 [ChatInput] handleSend called');
    console.log('🚀 [ChatInput] message:', message);
    console.log('🚀 [ChatInput] isSending:', isSending);

    if (!message.trim() || isSending) {
      console.log('⚠️ [ChatInput] Skipping - empty message or already sending');
      return;
    }

    setIsSending(true);
    const userMessage = message.trim();
    setMessage(''); // Clear input immediately

    console.log('📝 [ChatInput] Starting send process');
    console.log('📝 [ChatInput] topicId:', topicId);
    console.log('📝 [ChatInput] assistantId:', assistantId);
    console.log('📝 [ChatInput] selectedModel:', selectedModel);

    try {
      // Step 1: Create topic if needed
      let activeTopicId = topicId;

      if (!activeTopicId) {
        console.log('🔍 [ChatInput] No topicId, need to create new topic');

        if (!assistantId) {
          console.error('❌ [ChatInput] No assistantId provided');
          antdMessage.error('Please select an assistant first');
          setIsSending(false);
          return;
        }

        console.log('🔨 [ChatInput] Creating new topic for assistant:', assistantId);
        console.log('🔨 [ChatInput] Topic name:', userMessage.substring(0, 50));

        const response = await topicService.createTopic(assistantId, {
          name: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
        });

        console.log('📋 [ChatInput] Topic creation response:', response);

        if ((response.code === 200 || response.code === 0) && response.data) {
          activeTopicId = response.data.id;
          console.log('✅ [ChatInput] Topic created successfully:', activeTopicId);

          // Save model info to localStorage for this topic
          if (selectedModel) {
            const topicModelKey = `topic_model_${activeTopicId}`;
            localStorage.setItem(topicModelKey, JSON.stringify({
              providerId: selectedModel.providerId,
              modelId: selectedModel.modelId,
              modelName: selectedModel.modelName,
              providerName: selectedModel.providerName,
            }));
            console.log('💾 [ChatInput] Saved model info for topic:', activeTopicId);
          }

          console.log('✅ [ChatInput] Calling onTopicCreated callback');
          onTopicCreated?.(activeTopicId);
        } else {
          console.error('❌ [ChatInput] Failed to create topic:', response);
          antdMessage.error('Failed to create conversation');
          setIsSending(false);
          return;
        }
      } else {
        console.log('✅ [ChatInput] Using existing topicId:', activeTopicId);
      }

      // Validate selected model
      if (!selectedModel) {
        console.error('❌ [ChatInput] No model selected');
        antdMessage.error('Please select an AI model first');
        setIsSending(false);
        return;
      }

      console.log('✅ [ChatInput] Model validated:', selectedModel.modelName);

      // Step 2: Send streaming message
      console.log('💬 [ChatInput] Starting stream chat');
      console.log('💬 [ChatInput] Topic ID:', activeTopicId);
      console.log('💬 [ChatInput] Provider:', selectedModel.providerId);
      console.log('💬 [ChatInput] Model:', selectedModel.modelId);
      console.log('💬 [ChatInput] Message:', userMessage);

      onMessageStart?.();
      console.log('📡 [ChatInput] onMessageStart callback called');

      await chatService.streamChat({
        topicId: activeTopicId,
        message: userMessage,
        providers: [{ provider: selectedModel.providerId, model: selectedModel.modelId }],
        onStart: (data) => {
          console.log('🎬 [ChatInput] Stream started:', data);
        },
        onToken: (data) => {
          console.log('🔤 [ChatInput] Token received:', data);
          onToken?.(data.content);
        },
        onDone: (data) => {
          console.log('✔️ [ChatInput] Stream done:', data);
        },
        onAllDone: () => {
          console.log('🏁 [ChatInput] All providers completed');
          onMessageComplete?.();
          console.log('📡 [ChatInput] onMessageComplete callback called');
        },
        onError: (error) => {
          console.error('💥 [ChatInput] Stream error:', error);
          antdMessage.error('Failed to send message');
        },
      });

      console.log('✅ [ChatInput] streamChat completed');
    } catch (error) {
      console.error('💥 [ChatInput] Exception in handleSend:', error);
      antdMessage.error('Failed to send message');
    } finally {
      console.log('🔚 [ChatInput] Cleaning up - setIsSending(false)');
      setIsSending(false);
    }
  };

  return (
    <div className="relative rounded-lg border border-background-dark/10 bg-transparent focus-within:border-primary focus-within:ring-primary dark:border-background-light/10 dark:focus-within:border-primary">
        {/* Attached File */}
        {fileAttached && (
        <div className="border-b border-background-dark/10 p-3 dark:border-background-light/10">
          <div className="flex items-center gap-3 rounded-lg bg-background-dark/5 px-3 py-2 dark:bg-background-light/5">
            <span className="material-symbols-outlined text-lg text-background-dark/60 dark:text-background-light/60">
              description
            </span>
            <span className="text-sm font-medium text-background-dark dark:text-background-light">
              {fileName}
            </span>
            <button
              onClick={() => setFileAttached(false)}
              className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-background-dark/10 dark:text-background-light/60 dark:hover:bg-background-light/10"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        rows={isExpanded ? 6 : 2}
        className="form-textarea block w-full resize-none border-none bg-transparent p-4 text-background-dark placeholder:text-background-dark/50 focus:ring-0 dark:text-background-light dark:placeholder:text-background-light/50"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between border-t border-background-dark/10 px-3 py-2 dark:border-background-light/10">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFileAttached(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-xl">attach_file</span>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20">
              <span className="material-symbols-outlined text-xl">route</span>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20">
              <span className="material-symbols-outlined text-xl">public</span>
            </button>

            <div className="mx-2 h-5 w-px bg-background-dark/10 dark:bg-background-light/10" />

            <button className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20">
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20">
              <span className="material-symbols-outlined text-xl">delete_history</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-xl">
                {isExpanded ? 'close_fullscreen' : 'open_in_full'}
              </span>
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-xl">send</span>
              )}
            </button>
          </div>
        </div>
    </div>
  );
}
