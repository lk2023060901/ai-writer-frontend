'use client';

import React, { useEffect, useRef } from 'react';
import { Avatar } from 'antd';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  avatar?: string;
  name?: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
    timestamp: '10:00 AM',
    name: 'Gemini 1.5 Pro Assistant',
  },
  {
    id: '2',
    role: 'user',
    content: 'Can you tell me a joke?',
    timestamp: '10:01 AM',
    name: 'John Doe',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8GKP6ra-5KwJvQTEiKL-Yhdu0bPWeRbgMJ3wP3baXJveeUjW2JKF1zKclSU4FMPCKVczlG_9RxfLx50BkotDBJFgpz0owV0cVXKJgiVxU06al6SJ2XkGoGCgQQBKmdlgTS0oY54uzfupOkc7MNnnS54kPjSKANt4mh1BIMYqyGOJ_k6PIv8XK03Ls4QVg2T_aZqv7ssY9oVHTHvPrfbdYFD_j0s0E6-8S25184CdtA0JCGqLADPDEIGqT7DFZFNPNMOTqBSXD2yo',
  },
  {
    id: '3',
    role: 'assistant',
    content: "Why don't scientists trust atoms? Because they make up everything!",
    timestamp: '10:02 AM',
    name: 'Gemini 1.5 Pro Assistant',
  },
];

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

interface ChatMessagesProps {
  quickQuestionsVisible?: boolean;
  fontSize?: number;
}

export default function ChatMessages({ quickQuestionsVisible = true, fontSize = 14 }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'What is the weather like today?',
    'Explain quantum computing',
    'Translate "hello" to Spanish',
    'Summarize the latest news',
    'Give me a recipe for chocolate cake',
    'Who won the last world cup?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="flex flex-col gap-6 px-6 pt-1 pb-6">
      {/* Suggestions */}
      {quickQuestionsVisible && (
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
      )}

      {/* Messages */}
      <div className="flex-1 space-y-6">
        {mockMessages.map((message) => {
          if (message.role === 'assistant') {
            return (
              <div key={message.id} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                  <GeminiIcon />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-background-dark dark:text-background-light">
                    {message.name}
                  </p>
                  <div className="mt-2 rounded-lg bg-background-dark/5 p-3 dark:bg-background-light/5">
                    <p className="text-background-dark dark:text-background-light" style={{ fontSize: `${fontSize}px` }}>
                      {message.content}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-background-dark/60 dark:text-background-light/60">
                    {message.timestamp}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex items-start justify-end gap-4">
              <div className="flex-1 text-right">
                <p className="font-semibold text-background-dark dark:text-background-light">
                  {message.name}
                </p>
                <div className="mt-2 rounded-lg bg-primary/10 p-3 dark:bg-primary/20">
                  <p className="text-background-dark dark:text-background-light" style={{ fontSize: `${fontSize}px` }}>
                    {message.content}
                  </p>
                </div>
                <p className="mt-1 text-xs text-background-dark/60 dark:text-background-light/60">
                  {message.timestamp}
                </p>
              </div>
              <Avatar size={40} src={message.avatar} />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
