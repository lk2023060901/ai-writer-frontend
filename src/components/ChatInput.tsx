'use client';

import React, { useState } from 'react';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const [fileName, setFileName] = useState('document.pdf');

  const handleSend = () => {
    if (!message.trim()) return;
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="rounded-lg border border-background-dark/10 bg-transparent focus-within:border-primary focus-within:ring-primary dark:border-background-light/10 dark:focus-within:border-primary">
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
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 transition-colors hover:bg-primary/10 hover:text-primary dark:text-background-light/60 dark:hover:bg-primary/20">
              <span className="material-symbols-outlined text-xl">model_training</span>
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </div>
        </div>
    </div>
  );
}
