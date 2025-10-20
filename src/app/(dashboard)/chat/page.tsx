'use client';

import React, { useState, useCallback, startTransition } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/features/chat/components/Navbar';
import Sidebar from '@/features/chat/components/Sidebar';
import Chat from '@/features/chat/components/Chat';
import { useChatAssistants, useChatTopics } from '@/features/chat/context/ChatContext';
import type { Topic } from '@/features/chat/hooks/useMockData';
import { createDefaultTopic } from '@/features/chat/hooks/useMockData';
import '@/features/chat/styles/globals.css';
import '@/features/chat/styles/iconfont.css';

const ChatPageContent = () => {
  const { assistants, activeAssistant, setActiveAssistant } = useChatAssistants();
  const { activeTopic, setActiveTopic, addTopic, updateTopic, removeTopic } = useChatTopics();
  const [showAssistantsState, setShowAssistantsState] = useState(true);

  const handleSetActiveAssistant = useCallback(
    (assistantId: string) => {
      if (assistantId === activeAssistant.id) return;
      startTransition(() => {
        setActiveAssistant(assistantId);
      });
    },
    [activeAssistant.id, setActiveAssistant]
  );

  const handleSetActiveTopic = useCallback(
    (topic: Topic) => {
      startTransition(() => {
        setActiveTopic(topic);
      });
    },
    [setActiveTopic]
  );

  const handleCreateTopic = useCallback(
    (name?: string) => {
      const topicName = name ?? `新的对话 ${activeAssistant.topics.length + 1}`;
      const newTopic = createDefaultTopic(activeAssistant.id, topicName);
      addTopic(activeAssistant.id, newTopic);
      setActiveTopic(newTopic);
      return newTopic;
    },
    [activeAssistant, addTopic, setActiveTopic]
  );

  const handleRemoveTopic = useCallback(
    (topicId: string) => {
      removeTopic(activeAssistant.id, topicId);
    },
    [activeAssistant, removeTopic]
  );

  const toggleShowAssistants = () => {
    setShowAssistantsState((prev) => !prev);
  };

  return (
    <PageContainer>
      <Navbar />
      <ContentWrapper>
        <AnimatePresence initial={false}>
          {showAssistantsState && assistants.length > 0 && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'var(--assistants-width)', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}>
              <Sidebar
                assistants={assistants}
                activeAssistant={activeAssistant}
                activeTopic={activeTopic}
                setActiveAssistant={(assistant) => handleSetActiveAssistant(assistant.id)}
                setActiveTopic={handleSetActiveTopic}
                onAddTopic={() => handleCreateTopic()}
                onRemoveTopic={handleRemoveTopic}
                position="left"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <Chat
          assistant={activeAssistant}
          activeTopic={activeTopic}
          setActiveTopic={handleSetActiveTopic}
          createTopic={handleCreateTopic}
          updateTopic={updateTopic}
          showAssistants={showAssistantsState}
          toggleShowAssistants={toggleShowAssistants}
        />
      </ContentWrapper>
    </PageContainer>
  );
};

const HomePage = () => {
  return (
    <ChatPageContent />
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-background);
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  overflow: hidden;
`;

export default HomePage;
