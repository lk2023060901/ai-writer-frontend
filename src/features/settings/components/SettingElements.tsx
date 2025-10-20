'use client';

import { Divider } from 'antd';
import Link from 'antd/es/typography/Link';
import styled, { css } from 'styled-components';

export const SettingContainer = styled.div<{ $themeMode?: 'light' | 'dark'; $noPadding?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${({ $noPadding }) => ($noPadding ? '0' : '15px 18px')};
  overflow-y: auto;
  background: ${({ $themeMode }) => ($themeMode === 'dark' ? 'transparent' : 'var(--color-background-soft)')};

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const SettingTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  font-size: 14px;
  font-weight: 600;
`;

export const SettingSubtitle = styled.div`
  font-size: 14px;
  color: var(--color-text);
  margin: 15px 0 0 0;
  user-select: none;
  font-weight: 600;
`;

export const SettingDescription = styled.div`
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 10px;
  line-height: 1.6;
`;

export const SettingDivider = styled(Divider)`
  margin: 10px 0;
  border-block-start: 0.5px solid var(--color-border);
`;

export const SettingRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: 24px;
  padding: 10px 0;
  border-bottom: 0.5px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
`;

export const SettingRowTitle = styled.div`
  font-size: 14px;
  line-height: 18px;
  color: var(--color-text);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export const SettingHelpTextRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 0;
  gap: 8px;
`;

export const SettingHelpText = styled.div`
  font-size: 11px;
  color: var(--color-text);
  opacity: 0.5;
`;

export const SettingHelpLink = styled(Link)`
  font-size: 11px;
`;

export const SettingGroup = styled.div<{ $themeMode?: 'light' | 'dark'; $css?: ReturnType<typeof css> }>`
  margin-bottom: 20px;
  border-radius: var(--list-item-border-radius);
  border: 0.5px solid var(--color-border);
  padding: 16px;
  background: ${({ $themeMode }) => ($themeMode === 'dark' ? '#00000010' : 'var(--color-background)')};
  ${({ $css }) => $css || ''}
`;
