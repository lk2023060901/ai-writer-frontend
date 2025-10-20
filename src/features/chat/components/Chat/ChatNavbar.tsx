'use client';

import React, { FC } from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { PanelLeftClose, PanelRightClose, Search, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SelectModelButton from './SelectModelButton';
import { Assistant } from '@/features/chat/hooks/useMockData';

interface Props {
  assistant: Assistant;
  showAssistants: boolean;
  toggleShowAssistants: () => void;
}

const ChatNavbar: FC<Props> = ({ assistant, showAssistants, toggleShowAssistants }) => {
  const handleSearchClick = () => {
    // TODO: 实现搜索功能
    console.log('Search messages');
  };

  const handleExpandClick = () => {
    // TODO: 实现展开功能
    console.log('Expand');
  };

  const handleAssistantsDrawerClick = () => {
    // TODO: 实现助手抽屉
    console.log('Show assistants drawer');
  };

  return (
    <NavbarContainer>
      <NavbarLeft>
        {showAssistants && (
          <Tooltip title="隐藏侧边栏" mouseEnterDelay={0.8}>
            <NavbarIcon onClick={toggleShowAssistants}>
              <PanelLeftClose size={18} />
            </NavbarIcon>
          </Tooltip>
        )}
        {!showAssistants && (
          <Tooltip title="显示侧边栏" mouseEnterDelay={0.8}>
            <NavbarIcon onClick={toggleShowAssistants} style={{ marginRight: 8 }}>
              <PanelRightClose size={18} />
            </NavbarIcon>
          </Tooltip>
        )}
        <AnimatePresence initial={false}>
          {!showAssistants && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}>
              <NavbarIcon onClick={handleAssistantsDrawerClick} style={{ marginRight: 8 }}>
                <Menu size={18} />
              </NavbarIcon>
            </motion.div>
          )}
        </AnimatePresence>
        <SelectModelButton modelName={assistant.name} providerName="OpenAI" />
      </NavbarLeft>
      <NavbarRight>
        <Tooltip title="展开" mouseEnterDelay={0.8}>
          <NarrowIcon onClick={handleExpandClick}>
            <i className="iconfont icon-icon-adaptive-width"></i>
          </NarrowIcon>
        </Tooltip>
        <Tooltip title="搜索" mouseEnterDelay={0.8}>
          <NavbarIcon onClick={handleSearchClick}>
            <Search size={18} />
          </NavbarIcon>
        </Tooltip>
      </NavbarRight>
    </NavbarContainer>
  );
};

const NavbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--navbar-height);
  padding: 0 12px;
  background-color: var(--navbar-background);
  border-bottom: 0.5px solid var(--color-border);
`;

const NavbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NavbarIcon = styled.div`
  -webkit-app-region: none;
  border-radius: 8px;
  height: 30px;
  padding: 0 7px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  color: var(--color-icon);

  .iconfont {
    font-size: 18px;
    color: var(--color-icon);
  }

  &:hover {
    background-color: var(--color-background-mute);
    color: var(--color-icon-white);

    .iconfont {
      color: var(--color-icon-white);
    }
  }
`;

const NarrowIcon = styled(NavbarIcon)`
  @media (max-width: 1000px) {
    display: none;
  }
`;

export default ChatNavbar;
