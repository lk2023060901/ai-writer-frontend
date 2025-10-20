'use client';

import React from 'react';
import styled from 'styled-components';

interface EmojiPickerProps {
  onEmojiClick: (emoji: string) => void;
}

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
  '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
  '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
  '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
  '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '😵',
  '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐',
  '🤖', '👾', '👻', '💀', '☠️', '👽', '👹', '👺',
  '🤡', '💩', '👶', '👧', '🧒', '👦', '👨', '🧔',
  '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '👩‍🦱', '👩‍🦳',
  '💬', '💭', '💡', '💯', '💢', '💥', '💫', '💨',
  '💦', '💧', '💤', '💮', '💰', '💸', '💵', '💴',
  '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼',
  '🎹', '🎸', '🎺', '🎷', '🥁', '🎻', '🎲', '🎮',
  '🚀', '🛸', '🛰️', '💺', '🚁', '🛩️', '✈️', '🛫',
  '⭐', '🌟', '✨', '⚡', '🔥', '💥', '☄️', '🌈',
  '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️'
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiClick }) => {
  return (
    <EmojiPickerContainer>
      <EmojiGrid>
        {EMOJI_LIST.map((emoji, index) => (
          <EmojiButton key={index} onClick={() => onEmojiClick(emoji)}>
            {emoji}
          </EmojiButton>
        ))}
      </EmojiGrid>
    </EmojiPickerContainer>
  );
};

const EmojiPickerContainer = styled.div`
  padding: 8px;
  max-width: 320px;
  max-height: 300px;
  overflow-y: auto;
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
`;

const EmojiButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-background-soft);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export default EmojiPicker;
