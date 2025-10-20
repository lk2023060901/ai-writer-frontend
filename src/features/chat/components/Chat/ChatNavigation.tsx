'use client';

import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button, Tooltip } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CloseOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  HistoryOutlined
} from '@ant-design/icons';

const EXCLUDED_SELECTORS = [
  '.MessageFooter',
  '.code-toolbar',
  '.ant-collapse-header',
  '.message-editor'
];

const RIGHT_GAP = 16;

interface Props {
  containerId: string;
}

const ChatNavigation: FC<Props> = ({ containerId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isNearButtons, setIsNearButtons] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout>();
  const [manuallyClosedUntil, setManuallyClosedUntil] = useState<number | null>(null);
  const lastMoveTime = useRef(0);

  const resetHideTimer = useCallback(() => {
    setIsVisible(true);

    if (!isNearButtons) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    }
  }, [isNearButtons]);

  const handleMouseEnter = useCallback(() => {
    if (manuallyClosedUntil && Date.now() < manuallyClosedUntil) {
      return;
    }

    setIsNearButtons(true);
    setIsVisible(true);
    clearTimeout(hideTimerRef.current);
  }, [manuallyClosedUntil]);

  const handleMouseLeave = useCallback(() => {
    setIsNearButtons(false);

    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 500);

    return () => {
      clearTimeout(hideTimerRef.current);
    };
  }, []);

  const findUserMessages = () => {
    const container = document.getElementById(containerId);
    if (!container) return [];

    const userMessages = Array.from(container.getElementsByClassName('message-user'));
    return userMessages as HTMLElement[];
  };

  const scrollToMessage = (element: HTMLElement) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollTo({ top: -container.scrollHeight, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  const getCurrentVisibleIndex = (direction: 'up' | 'down') => {
    const userMessages = findUserMessages();
    const container = document.getElementById(containerId);

    if (!container) return -1;

    const containerRect = container.getBoundingClientRect();
    const visibleThreshold = containerRect.height * 0.1;

    const visibleIndices: number[] = [];

    for (let i = 0; i < userMessages.length; i++) {
      const messageRect = userMessages[i].getBoundingClientRect();
      const visibleHeight =
        Math.min(messageRect.bottom, containerRect.bottom) - Math.max(messageRect.top, containerRect.top);
      if (visibleHeight > 0 && visibleHeight >= Math.min(messageRect.height, visibleThreshold)) {
        visibleIndices.push(i);
      }
    }

    if (visibleIndices.length > 0) {
      return direction === 'up' ? Math.max(...visibleIndices) : Math.min(...visibleIndices);
    }

    return -1;
  };

  const handleCloseChatNavigation = () => {
    setIsVisible(false);
    setManuallyClosedUntil(Date.now() + 60000);
  };

  const handleScrollToTop = () => {
    resetHideTimer();
    scrollToTop();
  };

  const handleScrollToBottom = () => {
    resetHideTimer();
    scrollToBottom();
  };

  const handleNextMessage = () => {
    resetHideTimer();
    const userMessages = findUserMessages();

    if (userMessages.length === 0) {
      return scrollToBottom();
    }

    const visibleIndex = getCurrentVisibleIndex('down');

    if (visibleIndex === -1) {
      return scrollToBottom();
    }

    const targetIndex = visibleIndex - 1;

    if (targetIndex < 0) {
      return scrollToBottom();
    }

    scrollToMessage(userMessages[targetIndex]);
  };

  const handlePrevMessage = () => {
    resetHideTimer();
    const userMessages = findUserMessages();
    if (userMessages.length === 0) {
      return scrollToTop();
    }

    const visibleIndex = getCurrentVisibleIndex('up');

    if (visibleIndex === -1) {
      return scrollToTop();
    }

    const targetIndex = visibleIndex + 1;

    if (targetIndex >= userMessages.length) {
      return scrollToTop();
    }

    scrollToMessage(userMessages[targetIndex]);
  };

  useEffect(() => {
    const container = document.getElementById(containerId);
    const messagesContainer = container?.closest('.messages-container') as HTMLElement;

    if (!container) return;

    const handleScroll = () => {
      if (isNearButtons) {
        resetHideTimer();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (manuallyClosedUntil && Date.now() < manuallyClosedUntil) {
        return;
      }

      const now = Date.now();
      if (now - lastMoveTime.current < 50) return;
      lastMoveTime.current = now;

      const triggerWidth = 60;
      const rightOffset = RIGHT_GAP;
      const rightPosition = window.innerWidth - rightOffset - triggerWidth;
      const topPosition = window.innerHeight * 0.35;
      const height = window.innerHeight * 0.3;

      const target = e.target as HTMLElement;
      const isInExcludedArea = EXCLUDED_SELECTORS.some((selector) => target.closest(selector));

      const isInTriggerArea =
        !isInExcludedArea &&
        e.clientX > rightPosition &&
        e.clientX < rightPosition + triggerWidth + RIGHT_GAP &&
        e.clientY > topPosition &&
        e.clientY < topPosition + height;

      if (isInTriggerArea && !isNearButtons) {
        handleMouseEnter();
      } else if (!isInTriggerArea && isNearButtons) {
        handleMouseLeave();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    if (messagesContainer) {
      messagesContainer.addEventListener('mousemove', handleMouseMove);
    } else {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (messagesContainer) {
        messagesContainer.removeEventListener('mousemove', handleMouseMove);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      clearTimeout(hideTimerRef.current);
    };
  }, [
    containerId,
    resetHideTimer,
    isNearButtons,
    handleMouseEnter,
    handleMouseLeave,
    manuallyClosedUntil
  ]);

  return (
    <NavigationContainer $isVisible={isVisible} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <ButtonGroup>
        <Tooltip title="关闭" placement="left" mouseEnterDelay={0.5}>
          <NavigationButton
            type="text"
            icon={<CloseOutlined />}
            onClick={handleCloseChatNavigation}
            aria-label="关闭"
          />
        </Tooltip>
        <Divider />
        <Tooltip title="滚动到顶部" placement="left" mouseEnterDelay={0.5}>
          <NavigationButton
            type="text"
            icon={<VerticalAlignTopOutlined />}
            onClick={handleScrollToTop}
            aria-label="滚动到顶部"
          />
        </Tooltip>
        <Divider />
        <Tooltip title="上一条消息" placement="left" mouseEnterDelay={0.5}>
          <NavigationButton
            type="text"
            icon={<ArrowUpOutlined />}
            onClick={handlePrevMessage}
            aria-label="上一条消息"
          />
        </Tooltip>
        <Divider />
        <Tooltip title="下一条消息" placement="left" mouseEnterDelay={0.5}>
          <NavigationButton
            type="text"
            icon={<ArrowDownOutlined />}
            onClick={handleNextMessage}
            aria-label="下一条消息"
          />
        </Tooltip>
        <Divider />
        <Tooltip title="滚动到底部" placement="left" mouseEnterDelay={0.5}>
          <NavigationButton
            type="text"
            icon={<VerticalAlignBottomOutlined />}
            onClick={handleScrollToBottom}
            aria-label="滚动到底部"
          />
        </Tooltip>
        <Divider />
        <Tooltip title="历史记录" placement="left" mouseEnterDelay={0.5}>
          <NavigationButton
            type="text"
            icon={<HistoryOutlined />}
            onClick={() => console.log('打开历史记录')}
            aria-label="历史记录"
          />
        </Tooltip>
      </ButtonGroup>
    </NavigationContainer>
  );
};

const NavigationContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  right: ${RIGHT_GAP}px;
  top: 50%;
  transform: translateY(-50%) translateX(${(props) => (props.$isVisible ? 0 : '100%')});
  z-index: 999;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transition:
    transform 0.3s ease-in-out,
    opacity 0.3s ease-in-out;
  pointer-events: ${(props) => (props.$isVisible ? 'auto' : 'none')};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-border);
`;

const NavigationButton = styled(Button)`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  border: none;
  color: var(--color-text);
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: var(--color-background-mute);
    color: var(--color-primary);
  }

  .anticon {
    font-size: 14px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--color-border);
  margin: 0;
`;

export default ChatNavigation;
