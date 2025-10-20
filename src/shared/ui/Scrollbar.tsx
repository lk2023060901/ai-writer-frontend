'use client';

import styled from 'styled-components';

export const Scrollbar = styled.div`
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(148, 163, 184, 0.4);
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export default Scrollbar;
