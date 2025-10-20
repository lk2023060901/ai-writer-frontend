'use client';

import React, { FC } from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import {
  MessageSquareDiff,
  Paperclip,
  PaintbrushVertical,
  Maximize,
  Minimize,
  Zap,
  AtSign,
  Brain,
  Globe,
  Link,
  FileSearch,
  Hammer,
  ImagePlus,
  Plus
} from 'lucide-react';

interface Props {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  addNewTopic?: () => void;
  clearTopic?: () => void;
  onNewContext?: () => void;
}

const InputbarTools: FC<Props> = ({
  isExpanded,
  onToggleExpanded,
  addNewTopic,
  clearTopic,
  onNewContext
}) => {
  return (
    <ToolsContainer>
      <VisibleTools>
        {/* 1. 新建话题 */}
        <Tooltip title="新建话题" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton onClick={addNewTopic}>
            <MessageSquareDiff size={19} />
          </ToolButton>
        </Tooltip>

        {/* 2. 附加文件 */}
        <Tooltip title="附加文件" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton>
            <Paperclip size={18} />
          </ToolButton>
        </Tooltip>

        {/* 3. 思考模式 */}
        <Tooltip title="思考模式" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton>
            <Brain size={18} />
          </ToolButton>
        </Tooltip>

        {/* 4. 网络搜索 */}
        <Tooltip title="网络搜索" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton>
            <Globe size={18} />
          </ToolButton>
        </Tooltip>

        {/* 5. URL上下文 */}
        <Tooltip title="URL上下文" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton>
            <Link size={18} />
          </ToolButton>
        </Tooltip>

        {/* 6. 知识库 */}
        <Tooltip title="知识库" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton>
            <FileSearch size={18} />
          </ToolButton>
        </Tooltip>

        {/* 7. MCP工具 */}
        <Tooltip title="MCP工具" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton>
            <Hammer size={18} />
          </ToolButton>
        </Tooltip>

        {/* 8. 生成图片 */}
        <Tooltip title="生成图片" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton>
            <ImagePlus size={18} />
          </ToolButton>
        </Tooltip>

        {/* 9. @提及模型 */}
        <Tooltip title="@提及模型" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton>
            <AtSign size={18} />
          </ToolButton>
        </Tooltip>

        {/* 10. 快捷短语 */}
        <Tooltip title="快捷短语" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton>
            <Zap size={18} />
          </ToolButton>
        </Tooltip>

        {/* 11. 清空话题 */}
        <Tooltip title="清空话题" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton onClick={clearTopic}>
            <PaintbrushVertical size={18} />
          </ToolButton>
        </Tooltip>

        {/* 12. 展开/折叠 */}
        <Tooltip
          title={isExpanded ? '折叠' : '展开'}
          placement="top"
          mouseLeaveDelay={0}
          arrow>
          <ToolButton onClick={onToggleExpanded}>
            {isExpanded ? <Minimize size={18} /> : <Maximize size={18} />}
          </ToolButton>
        </Tooltip>

        {/* 13. 新上下文 */}
        <Tooltip title="新上下文" placement="top" mouseLeaveDelay={0} arrow>
          <ToolButton onClick={onNewContext}>
            <Plus size={18} />
          </ToolButton>
        </Tooltip>
      </VisibleTools>
    </ToolsContainer>
  );
};

const ToolsContainer = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  position: relative;
`;

const VisibleTools = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ToolButton = styled.div`
  width: 30px;
  height: 30px;
  margin-right: 6px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-icon);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: var(--color-background-mute);
    color: var(--color-icon-white);
  }
`;

export default InputbarTools;
