'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button, Empty, Tabs, Tag, Tooltip, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Book, Folder, Globe, Link as LinkIcon, Notebook, Search, Settings } from 'lucide-react';

import { useKnowledge } from '@/features/knowledge/hooks/useKnowledge';
import type {
  KnowledgeBase,
  KnowledgeDirectoryItem,
  KnowledgeFileItem,
  KnowledgeNoteItem,
  KnowledgeSitemapItem,
  KnowledgeUrlItem,
} from '@/types/launchpad';

interface KnowledgeContentProps {
  selectedBase: KnowledgeBase;
  onEdit: (base: KnowledgeBase) => void;
  onSearch: (base: KnowledgeBase) => void;
}

const KnowledgeContent: React.FC<KnowledgeContentProps> = ({ selectedBase, onEdit, onSearch }) => {
  const { base, fileItems, noteItems, directoryItems, urlItems, sitemapItems } = useKnowledge(selectedBase.id);
  const [activeKey, setActiveKey] = useState('files');

  const fileColumns: ColumnsType<KnowledgeFileItem> = useMemo(
    () => [
      { title: '文件名', dataIndex: 'title', key: 'title' },
      { title: '大小', dataIndex: 'size', key: 'size' },
      { title: 'Tokens', dataIndex: 'tokens', key: 'tokens' },
      { title: '更新时间', dataIndex: 'createdAt', key: 'createdAt' },
    ],
    []
  );

  const noteColumns: ColumnsType<KnowledgeNoteItem> = useMemo(
    () => [
      { title: '标题', dataIndex: 'title', key: 'title' },
      { title: '作者', dataIndex: 'author', key: 'author' },
      { title: '更新时间', dataIndex: 'createdAt', key: 'createdAt' },
    ],
    []
  );

  const directoryColumns: ColumnsType<KnowledgeDirectoryItem> = useMemo(
    () => [
      { title: '目录', dataIndex: 'title', key: 'title' },
      { title: '路径', dataIndex: 'path', key: 'path' },
      { title: '文档数', dataIndex: 'documentCount', key: 'documentCount' },
      { title: '更新时间', dataIndex: 'createdAt', key: 'createdAt' },
    ],
    []
  );

  const urlColumns: ColumnsType<KnowledgeUrlItem> = useMemo(
    () => [
      { title: '标题', dataIndex: 'title', key: 'title' },
      {
        title: '链接',
        dataIndex: 'url',
        key: 'url',
        render: (value: string) => (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ),
      },
      { title: '最近同步', dataIndex: 'lastCrawlAt', key: 'lastCrawlAt' },
    ],
    []
  );

  const sitemapColumns: ColumnsType<KnowledgeSitemapItem> = useMemo(
    () => [
      { title: '站点', dataIndex: 'title', key: 'title' },
      {
        title: 'Sitemap 链接',
        dataIndex: 'rootUrl',
        key: 'rootUrl',
        render: (value: string) => (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ),
      },
      { title: '收录页数', dataIndex: 'pageCount', key: 'pageCount' },
    ],
    []
  );

  const tabs = useMemo(
    () => [
      {
        key: 'files',
        title: '文件',
        icon: Book,
        items: fileItems,
        content: fileItems.length ? (
          <TableWrapper>
            <Table rowKey="id" dataSource={fileItems} columns={fileColumns} pagination={false} />
          </TableWrapper>
        ) : (
          <EmptyPlaceholder>
            <Empty description="暂无文件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </EmptyPlaceholder>
        ),
      },
      {
        key: 'notes',
        title: '笔记',
        icon: Notebook,
        items: noteItems,
        content: noteItems.length ? (
          <TableWrapper>
            <Table rowKey="id" dataSource={noteItems} columns={noteColumns} pagination={false} />
          </TableWrapper>
        ) : (
          <EmptyPlaceholder>
            <Empty description="暂无笔记" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </EmptyPlaceholder>
        ),
      },
      {
        key: 'directories',
        title: '目录',
        icon: Folder,
        items: directoryItems,
        content: directoryItems.length ? (
          <TableWrapper>
            <Table rowKey="id" dataSource={directoryItems} columns={directoryColumns} pagination={false} />
          </TableWrapper>
        ) : (
          <EmptyPlaceholder>
            <Empty description="暂无目录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </EmptyPlaceholder>
        ),
      },
      {
        key: 'urls',
        title: 'URL',
        icon: LinkIcon,
        items: urlItems,
        content: urlItems.length ? (
          <TableWrapper>
            <Table rowKey="id" dataSource={urlItems} columns={urlColumns} pagination={false} />
          </TableWrapper>
        ) : (
          <EmptyPlaceholder>
            <Empty description="暂无 URL" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </EmptyPlaceholder>
        ),
      },
      {
        key: 'sitemaps',
        title: '站点地图',
        icon: Globe,
        items: sitemapItems,
        content: sitemapItems.length ? (
          <TableWrapper>
            <Table rowKey="id" dataSource={sitemapItems} columns={sitemapColumns} pagination={false} />
          </TableWrapper>
        ) : (
          <EmptyPlaceholder>
            <Empty description="暂无站点地图" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </EmptyPlaceholder>
        ),
      },
    ],
    [
      directoryColumns,
      directoryItems,
      fileColumns,
      fileItems,
      noteColumns,
      noteItems,
      sitemapColumns,
      sitemapItems,
      urlColumns,
      urlItems,
    ]
  );

  if (!base) {
    return null;
  }

  const tabItems = tabs.map((tab) => {
    const Icon = tab.icon;
    const isActive = activeKey === tab.key;
    return {
      key: tab.key,
      label: (
        <TabLabel $active={isActive}>
          <Icon size={16} color={isActive ? 'var(--color-primary)' : 'var(--color-icon)'} />
          <span>{tab.title}</span>
          <CountTag $active={isActive}>{tab.items.length}</CountTag>
        </TabLabel>
      ),
      children: <TabContent>{tab.content}</TabContent>,
    };
  });

  const modelName = base.modelInfo?.model ?? '未配置';
  const providerName = base.modelInfo?.provider;

  return (
    <MainContainer>
      <HeaderContainer>
        <ModelInfo>
          <Button
            type="text"
            size="small"
            icon={<Settings size={18} color="var(--color-icon)" />}
            onClick={() => onEdit(base)}
          />
          <div className="model-row">
            <span className="label">嵌入模型</span>
            <Tag className="model-tag" bordered={false}>
              {modelName}
            </Tag>
            {providerName && (
              <Tag className="model-tag" bordered={false}>
                {providerName}
              </Tag>
            )}
          </div>
        </ModelInfo>
        <HeaderActions>
          <Tooltip title="搜索知识库">
            <Button type="text" icon={<Search size={18} />} onClick={() => onSearch(base)} />
          </Tooltip>
        </HeaderActions>
      </HeaderContainer>
      <StyledTabs activeKey={activeKey} onChange={setActiveKey} items={tabItems} />
    </MainContainer>
  );
};

const MainContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  height: 100%;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 0.5px solid var(--color-border);
  min-height: 48px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-3);

  .model-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .label {
    font-size: 13px;
    color: var(--color-text-2);
  }

  .model-tag {
    border-radius: 16px;
    height: 24px;
    display: flex;
    align-items: center;
  }
`;

const StyledTabs = styled(Tabs)`
  flex: 1;

  .ant-tabs-nav {
    padding: 0 16px;
    margin: 0;
    min-height: 48px;
  }

  .ant-tabs-tab {
    padding: 12px 12px;
    margin-right: 0;
    font-size: 13px;

    &:hover {
      color: var(--color-primary);
    }
  }

  .ant-tabs-content-holder {
    overflow: hidden;
  }

  .ant-tabs-tabpane {
    height: 100%;
    overflow: hidden;
    padding: 0 16px 16px;
  }
`;

const TabLabel = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-text)')};
`;

const CountTag = styled.span<{ $active: boolean }>`
  min-width: 24px;
  height: 16px;
  border-radius: 999px;
  padding: 0 6px;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  background: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-border)')};
  color: ${({ $active }) => ($active ? '#fff' : 'var(--color-text-2)')};
`;

const TabContent = styled.div`
  height: 100%;
  overflow: auto;
`;

const TableWrapper = styled.div`
  .ant-table {
    background: transparent;
  }
`;

const EmptyPlaceholder = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default KnowledgeContent;
