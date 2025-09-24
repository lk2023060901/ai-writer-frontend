import React from 'react';
import { AssistantCard } from './AssistantCard';
import { Assistant } from '../types';
import {
  MainContent,
  MainContentInner,
  AssistantGridContainer
} from '../styles';

interface AssistantGridProps {
  assistants: Assistant[];
}

export const AssistantGrid: React.FC<AssistantGridProps> = ({
  assistants
}) => {
  return (
    <MainContent>
      <MainContentInner>
        <AssistantGridContainer>
          {assistants.map(assistant => (
            <AssistantCard
              key={assistant.id}
              assistant={assistant}
            />
          ))}
        </AssistantGridContainer>
      </MainContentInner>
    </MainContent>
  );
};