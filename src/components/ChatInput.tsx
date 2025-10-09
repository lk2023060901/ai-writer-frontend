'use client';

import React, { useState, useRef } from 'react';
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
  onMessageStart?: (provider: string, model: string) => void;
  onMessageComplete?: () => void;
  onToken?: (provider: string, content: string) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // File handling functions
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const isFileTypeAllowed = (fileName: string) => {
    const allowedExtensions = [
      // 主流编程语言
      '.js', '.jsx', '.ts', '.tsx',     // JavaScript/TypeScript
      '.py', '.pyw',                    // Python
      '.java', '.kt',                   // Java/Kotlin
      '.cpp', '.c', '.h', '.hpp',       // C/C++
      '.cs',                            // C#
      '.php',                           // PHP
      '.rb',                            // Ruby
      '.go',                            // Go
      '.rs',                            // Rust
      '.swift',                         // Swift
      '.dart',                          // Dart
      '.scala',                         // Scala
      '.clj', '.cljs',                  // Clojure
      '.hs',                            // Haskell
      '.ml', '.mli',                    // OCaml
      '.elm',                           // Elm
      '.ex', '.exs',                    // Elixir
      '.erl', '.hrl',                   // Erlang
      '.lua',                           // Lua
      '.pl', '.pm',                     // Perl
      '.r', '.R',                       // R
      '.m',                             // Objective-C/MATLAB
      '.vb',                            // Visual Basic
      '.pas',                           // Pascal
      '.asm', '.s',                     // Assembly
      '.sh', '.bash', '.zsh', '.fish',  // Shell scripts
      '.ps1',                           // PowerShell
      '.bat', '.cmd',                   // Batch files
      
      // 标记语言
      '.html', '.htm', '.xml', '.svg',
      '.md', '.markdown', '.rst', '.adoc',
      '.tex', '.latex',
      
      // 配置文件
      '.json', '.yaml', '.yml', '.toml', '.ini',
      '.conf', '.config', '.properties',
      '.env', '.dotenv',
      
      // 构建和包管理
      '.dockerfile', '.makefile',
      '.package.json', '.composer.json',
      '.requirements.txt', '.pipfile',
      '.gemfile', '.cargo.toml',
      
      // 数据格式
      '.csv', '.tsv', '.jsonl', '.ndjson',
      '.rss', '.atom',
      '.sql', '.db', '.sqlite',
      
      // 文档和图片
      '.txt', '.pdf', '.doc', '.docx',
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'
    ];

    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return allowedExtensions.includes(extension);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 25MB for code files)
      if (file.size > 25 * 1024 * 1024) {
        antdMessage.error('File size must be less than 25MB');
        return;
      }

      // Check file type by extension
      if (!isFileTypeAllowed(file.name)) {
        antdMessage.error('Unsupported file type. Please check the supported file formats.');
        return;
      }

      setAttachedFile(file);
      antdMessage.success(`File "${file.name}" attached successfully`);
    }
    
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    antdMessage.info('File attachment removed');
  };

  const getFileIcon = (file: File) => {
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    
    // 图片文件
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'].includes(extension)) {
      return 'image';
    }
    
    // 文档文件
    if (['.pdf'].includes(extension)) {
      return 'picture_as_pdf';
    }
    if (['.doc', '.docx'].includes(extension)) {
      return 'description';
    }
    
    // 代码文件
    if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(extension)) {
      return 'code';
    }
    if (['.py', '.pyw'].includes(extension)) {
      return 'code';
    }
    if (['.java', '.kt', '.scala'].includes(extension)) {
      return 'code';
    }
    if (['.cpp', '.c', '.h', '.hpp', '.cs'].includes(extension)) {
      return 'code';
    }
    if (['.php', '.rb', '.go', '.rs', '.swift', '.dart'].includes(extension)) {
      return 'code';
    }
    if (['.html', '.htm', '.xml', '.css'].includes(extension)) {
      return 'web';
    }
    
    // 配置文件
    if (['.yaml', '.yml', '.toml', '.ini', '.conf', '.config', '.env', '.dotenv'].includes(extension)) {
      return 'settings';
    }
    
    // 数据文件
    if (['.csv', '.tsv', '.sql', '.db', '.sqlite'].includes(extension)) {
      return 'table_chart';
    }
    
    // 脚本文件
    if (['.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd'].includes(extension)) {
      return 'terminal';
    }
    
    // 标记语言
    if (['.md', '.markdown', '.rst', '.adoc', '.tex', '.latex'].includes(extension)) {
      return 'article';
    }
    
    // 默认文件图标
    return 'attach_file';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (!file) return;
      
      // Check file size (limit to 25MB for code files)
      if (file.size > 25 * 1024 * 1024) {
        antdMessage.error('File size must be less than 25MB');
        return;
      }

      // Check file type by extension
      if (!isFileTypeAllowed(file.name)) {
        antdMessage.error('Unsupported file type. Please check the supported file formats.');
        return;
      }

      setAttachedFile(file);
      antdMessage.success(`File "${file.name}" attached successfully`);
    }
  };

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

      console.log('📡 [ChatInput] Calling onMessageStart with provider and model');

      await chatService.streamChat({
        topicId: activeTopicId,
        message: userMessage,
        providers: [{ provider: selectedModel.providerId, model: selectedModel.modelId }],
        onStart: (data) => {
          console.log('🎬 [ChatInput] Stream started:', data);
          onMessageStart?.(data.provider, data.model);
        },
        onToken: (data) => {
          console.log('🔤 [ChatInput] Token received:', data);
          onToken?.(data.provider, data.content);
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
    <div 
      className={`flex flex-col rounded-lg border bg-transparent focus-within:border-primary focus-within:ring-primary transition-colors ${
        isDragOver 
          ? 'border-primary bg-primary/5 dark:bg-primary/10' 
          : 'border-background-dark/10 dark:border-background-light/10'
      } dark:focus-within:border-primary`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-primary/10 backdrop-blur-sm dark:bg-primary/20">
          <div className="flex flex-col items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-4xl">cloud_upload</span>
            <span className="text-sm font-medium">Drop file here to attach</span>
          </div>
        </div>
      )}

      {/* File Upload Area - Fixed Height with Smooth Transition */}
      <div 
        className="flex-shrink-0 overflow-hidden transition-all duration-200 ease-in-out" 
        style={{ height: attachedFile ? '60px' : '0px' }}
      >
        {attachedFile && (
          <div className="h-full border-b border-background-dark/10 p-3 dark:border-background-light/10">
            <div className="flex items-center gap-3 rounded-lg bg-background-dark/5 px-3 py-2 dark:bg-background-light/5">
              <span className="material-symbols-outlined text-lg text-background-dark/60 dark:text-background-light/60">
                {getFileIcon(attachedFile)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-background-dark dark:text-background-light truncate">
                  {attachedFile.name}
                </div>
                <div className="text-xs text-background-dark/60 dark:text-background-light/60">
                  {formatFileSize(attachedFile.size)}
                </div>
              </div>
              {isUploading && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-sm text-primary">
                    progress_activity
                  </span>
                  <span className="text-xs text-primary">Uploading...</span>
                </div>
              )}
              <button
                onClick={handleRemoveFile}
                disabled={isUploading}
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-background-dark/60 transition-all duration-200 hover:bg-red-100 hover:text-red-600 dark:text-background-light/60 dark:hover:bg-red-900/20 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove attachment"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".js,.jsx,.ts,.tsx,.py,.pyw,.java,.kt,.cpp,.c,.h,.hpp,.cs,.php,.rb,.go,.rs,.swift,.dart,.scala,.clj,.cljs,.hs,.ml,.mli,.elm,.ex,.exs,.erl,.hrl,.lua,.pl,.pm,.r,.R,.m,.vb,.pas,.asm,.s,.sh,.bash,.zsh,.fish,.ps1,.bat,.cmd,.html,.htm,.xml,.svg,.md,.markdown,.rst,.adoc,.tex,.latex,.json,.yaml,.yml,.toml,.ini,.conf,.config,.properties,.env,.dotenv,.dockerfile,.makefile,.csv,.tsv,.jsonl,.ndjson,.rss,.atom,.sql,.db,.sqlite,.txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff"
        className="hidden"
      />

      {/* Multi AI Model Selection Area - Future Enhancement */}
      {/* This area can be expanded later for multi-model selection */}

      {/* Chat Input Area */}
      <div className="flex-1 min-h-0">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          rows={isExpanded ? 6 : 2}
          style={{ 
            minHeight: '80px',
            maxHeight: isExpanded ? '200px' : '80px',
            transition: 'max-height 0.2s ease-in-out'
          }}
          className="form-textarea block w-full resize-none border-none bg-transparent p-4 text-background-dark placeholder:text-background-dark/50 focus:ring-0 dark:text-background-light dark:placeholder:text-background-light/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
      </div>

      {/* Tool Icon Area */}
      <div className="flex-shrink-0 border-t border-background-dark/10 px-3 py-2 dark:border-background-light/10">
        <div className="flex items-center justify-between">
          {/* Left Side Tools - File Upload & AI Features */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleFileSelect}
              disabled={isUploading}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                attachedFile 
                  ? 'bg-primary/20 text-primary dark:bg-primary/30' 
                  : 'text-background-dark/60 hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20'
              }`}
              title={attachedFile ? 'File attached' : 'Attach file'}
            >
              <span className="material-symbols-outlined text-xl">
                {attachedFile ? 'attachment' : 'attach_file'}
              </span>
            </button>
            <button 
              className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20"
              title="AI routing"
            >
              <span className="material-symbols-outlined text-xl">route</span>
            </button>
            <button 
              className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20"
              title="Web search"
            >
              <span className="material-symbols-outlined text-xl">public</span>
            </button>

            <div className="mx-2 h-5 w-px bg-background-dark/10 dark:bg-background-light/10" />

            {/* Chat Management Tools */}
            <button 
              className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20"
              title="Clear message"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
            <button 
              className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20"
              title="Clear history"
            >
              <span className="material-symbols-outlined text-xl">delete_history</span>
            </button>
          </div>

          {/* Right Side Tools - Input Controls & Send */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20"
              title={isExpanded ? "Collapse input" : "Expand input"}
            >
              <span className="material-symbols-outlined text-xl">
                {isExpanded ? 'close_fullscreen' : 'open_in_full'}
              </span>
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
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
    </div>
  );
}
