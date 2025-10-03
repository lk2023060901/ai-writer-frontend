'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NavbarProps {
  onNewChat?: () => void;
}

export default function Navbar({ onNewChat }: NavbarProps) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-background-dark-10 bg-background-light bg-opacity-80 backdrop-blur-sm dark:border-background-light-10 dark:bg-background-dark-80">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left side: Logo + New button */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md bg-primary-10 px-3 py-2 text-sm font-semibold text-primary dark:bg-primary-20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
              </svg>
              <span>ConnectHub</span>
            </div>
          </Link>

          <button
            onClick={onNewChat}
            className="flex h-9 w-9 items-center justify-center rounded-md text-background-dark-60 transition-colors hover:bg-background-dark-5 hover:text-background-dark dark:text-background-light-60 dark:hover:bg-background-light-5 dark:hover:text-background-light"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Right side: Icons + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Notifications */}
          <button className="flex h-9 w-9 items-center justify-center rounded-md text-background-dark-60 transition-colors hover:bg-background-dark-5 hover:text-background-dark dark:text-background-light-60 dark:hover:bg-background-light-5 dark:hover:text-background-light">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-md text-background-dark-60 transition-colors hover:bg-background-dark-5 hover:text-background-dark dark:text-background-light-60 dark:hover:bg-background-light-5 dark:hover:text-background-light"
          >
            <span className="material-symbols-outlined text-xl">
              {darkMode ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          {/* Settings */}
          <button className="flex h-9 w-9 items-center justify-center rounded-md text-background-dark-60 transition-colors hover:bg-background-dark-5 hover:text-background-dark dark:text-background-light-60 dark:hover:bg-background-light-5 dark:hover:text-background-light">
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>

          {/* User Avatar */}
          <div
            className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD8GKP6ra-5KwJvQTEiKL-Yhdu0bPWeRbgMJ3wP3baXJveeUjW2JKF1zKclSU4FMPCKVczlG_9RxfLx50BkotDBJFgpz0owV0cVXKJgiVxU06al6SJ2XkGoGCgQQBKmdlgTS0oY54uzfupOkc7MNnnS54kPjSKANt4mh1BIMYqyGOJ_k6PIv8XK03Ls4QVg2T_aZqv7ssY9oVHTHvPrfbdYFD_j0s0E6-8S25184CdtA0JCGqLADPDEIGqT7DFZFNPNMOTqBSXD2yo")'
            }}
          />
        </div>
      </div>
    </header>
  );
}
