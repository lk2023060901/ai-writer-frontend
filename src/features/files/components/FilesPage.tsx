'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button, Dropdown, Empty, Input, Modal, Space, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { FolderOpen, Image as ImageIcon, Music2, Video, Archive, FileText } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';

import { useLaunchpad } from '@/features/launchpad/hooks/useLaunchpad';
import { FileCategory, FileEntry } from '@/types/launchpad';

const Layout = styled.div`
  display: flex;
  flex: 1;
  height: calc(100vh - var(--navbar-height));
`;

const Sidebar = styled.div`
  width: 240px;
  border-right: 0.5px solid var(--color-border);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--color-background);
`;

const SidebarTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CategoryItem = styled.button<{ $active: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  border: 0.5px solid ${(props) => (props.$active ? 'var(--color-border)' : 'transparent')};
  background: ${(props) => (props.$active ? 'var(--color-background-soft)' : 'transparent')};
  cursor: pointer;
  color: var(--color-text);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-background-soft);
  }
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
`;

const CategoryCount = styled.span`
  font-size: 12px;
  color: var(--color-text-3);
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px 24px;
  border-bottom: 0.5px solid var(--color-border);
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
`;

const HeaderHint = styled.span`
  font-size: 12px;
  color: var(--color-text-3);
`;

const HeaderActions = styled(Space)`
  align-items: center;
`;

const SortButton = styled(Button)<{ $active?: boolean }>`
  border-radius: 999px;
  border-color: ${(props) => (props.$active ? 'var(--color-border)' : 'transparent')};
  background: ${(props) => (props.$active ? 'var(--color-background-soft)' : 'transparent')};
`;

const TableWrapper = styled(Table<FileEntry>)`
  flex: 1;
  padding: 0 24px 24px 24px;

  .ant-table {
    background: transparent;
  }
`;

const EmptyHolder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
`;

const CategoryIcon = (category: FileCategory) => {
  switch (category) {
    case 'document':
      return <FileText size={16} />;
    case 'image':
      return <ImageIcon size={16} />;
    case 'audio':
      return <Music2 size={16} />;
    case 'video':
      return <Video size={16} />;
    case 'archive':
      return <Archive size={16} />;
    default:
      return <FolderOpen size={16} />;
  }
};

const categoryLabelMap: Record<FileCategory, string> = {
  all: '全部文件',
  document: '文档',
  image: '图片',
  audio: '音频',
  video: '视频',
  archive: '归档'
};

const FilesPage: React.FC = () => {
  const { files, renameFile, deleteFile, deleteFiles } = useLaunchpad();
  const [category, setCategory] = useState<FileCategory>('all');
  const [sortField, setSortField] = useState<'name' | 'updatedAt' | 'size'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredFiles = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const baseList = category === 'all' ? files : files.filter((file) => file.category === category);
    const filtered = keyword
      ? baseList.filter(
          (file) =>
            file.name.toLowerCase().includes(keyword) ||
            file.owner.toLowerCase().includes(keyword) ||
            file.extension.toLowerCase().includes(keyword)
        )
      : baseList;

    const sorted = [...filtered].sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name, 'zh-CN');
        case 'size':
          return multiplier * (a.size - b.size);
        default:
          return multiplier * a.updatedAt.localeCompare(b.updatedAt);
      }
    });
    return sorted;
  }, [category, files, searchKeyword, sortField, sortOrder]);

  const counts = useMemo(() => {
    const initial: Record<FileCategory, number> = {
      all: files.length,
      document: 0,
      image: 0,
      audio: 0,
      video: 0,
      archive: 0
    };

    files.forEach((file) => {
      initial[file.category] += 1;
    });
    return initial;
  }, [files]);

  const handleRename = (file: FileEntry) => {
    let value = file.name;
    Modal.confirm({
      title: '重命名文件',
      content: (
        <Input
          defaultValue={file.name}
          onChange={(event) => {
            value = event.target.value;
          }}
        />
      ),
      onOk: () => renameFile(file.id, value)
    });
  };

  const handleDelete = (file: FileEntry) => {
    Modal.confirm({
      title: `删除“${file.name}”`,
      content: '删除后将无法恢复，确认继续吗？',
      okButtonProps: { danger: true },
      onOk: () => deleteFile(file.id)
    });
  };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: '批量删除文件',
      content: `确定删除选中的 ${selectedRowKeys.length} 个文件吗？`,
      okButtonProps: { danger: true },
      onOk: () => {
        deleteFiles(selectedRowKeys.map(String));
        setSelectedRowKeys([]);
      }
    });
  };

  const toggleSortField = (field: 'name' | 'updatedAt' | 'size') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

const columns: ColumnsType<FileEntry> = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    render: (value: string, record) => (
      <Space direction="vertical" size={0}>
        <span style={{ fontWeight: 500 }}>{value}</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{record.extension}</span>
      </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'category',
      key: 'category',
    render: (value: FileCategory) => (
      <Tag color="blue" bordered={false}>
        {categoryLabelMap[value] ?? value}
      </Tag>
    )
    },
    {
      title: '大小',
      dataIndex: 'formattedSize',
      key: 'size'
    },
    {
      title: '引用次数',
      dataIndex: 'usageCount',
      key: 'usage'
    },
    {
      title: '所有者',
      dataIndex: 'owner',
      key: 'owner'
    },
    {
      title: '最近修改',
      dataIndex: 'updatedAt',
      key: 'updatedAt'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: FileEntry) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleRename(record)} icon={<EditOutlined />}>重命名</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)} icon={<DeleteOutlined />}>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <Layout>
      <Sidebar>
        <SidebarTitle>文件分类</SidebarTitle>
        <CategoryList>
          {(Object.keys(categoryLabelMap) as FileCategory[]).map((key) => (
            <CategoryItem key={key} $active={category === key} onClick={() => setCategory(key)}>
              <CategoryInfo>
                {CategoryIcon(key)}
                <span>{categoryLabelMap[key]}</span>
              </CategoryInfo>
              <CategoryCount>{counts[key] ?? 0}</CategoryCount>
            </CategoryItem>
          ))}
        </CategoryList>
      </Sidebar>
      <Content>
        <ContentHeader>
          <HeaderLeft>
            <HeaderTitle>文件中心</HeaderTitle>
            <HeaderHint>支持按类型筛选、批量删除与重命名，与桌面端保持一致的交互体验。</HeaderHint>
          </HeaderLeft>
          <HeaderActions size="small">
            <Input.Search
              allowClear
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="搜索文件名称或所有者"
              style={{ width: 260 }}
            />
            <SortButton
              $active={sortField === 'name'}
              icon={sortField === 'name' && sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => toggleSortField('name')}>
              名称
            </SortButton>
            <SortButton
              $active={sortField === 'size'}
              icon={sortField === 'size' && sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => toggleSortField('size')}>
              大小
            </SortButton>
            <SortButton
              $active={sortField === 'updatedAt'}
              icon={sortField === 'updatedAt' && sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => toggleSortField('updatedAt')}>
              最近修改
            </SortButton>
            <Dropdown
              disabled={selectedRowKeys.length === 0}
              menu={{
                items: [
                  {
                    key: 'delete',
                    label: '批量删除',
                    danger: true,
                    onClick: handleBatchDelete
                  }
                ]
              }}>
              <Button disabled={selectedRowKeys.length === 0}>
                批量操作 ({selectedRowKeys.length})
              </Button>
            </Dropdown>
          </HeaderActions>
        </ContentHeader>
        {filteredFiles.length > 0 ? (
          <TableWrapper
            rowKey="id"
            dataSource={filteredFiles}
            columns={columns}
            pagination={{ pageSize: 10 }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys
            }}
          />
        ) : (
          <EmptyHolder>
            <Empty description="暂无文件" />
          </EmptyHolder>
        )}
      </Content>
    </Layout>
  );
};

export default FilesPage;
