import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderOutlined,
  GlobalOutlined,
  InboxOutlined,
  LinkOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Input, Select, Upload, message } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';

const { Dragger } = Upload;

interface FileItem {
  id: string;
  name: string;
  size: string;
  uploadTime: string;
  status: 'processing' | 'success' | 'error';
  type: 'file' | 'note' | 'directory' | 'url' | 'website';
}

const KnowledgeContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const TopToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModelSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;

  .ant-select {
    min-width: 120px;

    .ant-select-selector {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }
  }
`;

const SearchInput = styled(Input)`
  width: 300px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);

  &:focus, &:hover {
    border-color: var(--accent-color);
  }

  input {
    background: transparent;
    color: var(--text-primary);

    &::placeholder {
      color: var(--text-tertiary);
    }
  }
`;

const TypeTabs = styled.div`
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 0 24px;
`;

const TypeTab = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  color: ${props => props.$active ? 'var(--accent-color)' : 'var(--text-secondary)'};
  border-bottom: 2px solid ${props => props.$active ? 'var(--accent-color)' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    color: var(--text-primary);
  }

  .count {
    background: ${props => props.$active ? 'var(--accent-color)' : 'var(--bg-tertiary)'};
    color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 12px;
    min-width: 16px;
    text-align: center;
  }
`;

const LeftSidebar = styled.div`
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.h3`
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
`;

const KnowledgeList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const KnowledgeItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};

  &:hover {
    background: ${props => props.$active ? 'var(--accent-color)' : 'var(--bg-tertiary)'};
  }
`;

const KnowledgeIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
`;

const KnowledgeInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const KnowledgeName = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const KnowledgeCount = styled.div`
  font-size: 12px;
  opacity: 0.7;
`;


const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  padding-bottom: 40px;
  overflow: auto;
  min-height: 0;
`;

const UploadArea = styled.div`
  margin-bottom: 24px;

  .ant-upload-drag {
    background: var(--bg-secondary);
    border: 2px dashed var(--border-color);
    border-radius: 8px;

    &:hover {
      border-color: var(--accent-color);
    }

    .ant-upload-drag-container {
      padding: 40px 20px;
    }
  }

  .ant-upload-text {
    color: var(--text-primary);
    font-size: 16px;
    margin-bottom: 8px;
  }

  .ant-upload-hint {
    color: var(--text-secondary);
    font-size: 14px;
  }
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 20px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-color);
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  font-size: 16px;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileName = styled.div`
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
`;

const FileMetadata = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
`;

const FileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled(Button)`
  border: none;
  background: transparent;
  color: var(--text-secondary);

  &:hover {
    color: var(--text-primary);
    background: var(--bg-tertiary);
  }
`;

const AddFileButton = styled(Button)`
  background: var(--accent-color);
  border: none;
  color: white;

  &:hover {
    background: color-mix(in srgb, var(--accent-color) 80%, black);
  }
`;

interface KnowledgeBaseItem {
  id: string;
  name: string;
  color: string;
  fileCount: number;
  initial: string;
}

const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'file' | 'note' | 'directory' | 'url' | 'website'>('file');
  const [searchQuery, setSearchQuery] = useState('');
  const [embeddingModel, setEmbeddingModel] = useState('BAA/bge-m3');
  const [selectedKnowledge, setSelectedKnowledge] = useState('kb1');
  const [knowledgeBases] = useState<KnowledgeBaseItem[]>([
    {
      id: 'kb1',
      name: '编号',
      color: '#667eea',
      fileCount: 8,
      initial: '编'
    },
    {
      id: 'kb2',
      name: '益不堂',
      color: '#f093fb',
      fileCount: 15,
      initial: '益'
    }
  ]);
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: '文档写作基本功.docx',
      size: '13 KB',
      uploadTime: '09-16 17:05',
      status: 'success',
      type: 'file'
    },
    {
      id: '2',
      name: '短视频呈现形式与流量提升策略.docx',
      size: '13 KB',
      uploadTime: '09-16 15:31',
      status: 'success',
      type: 'file'
    },
    {
      id: '3',
      name: '营销人潜准入设的通关密码.docx',
      size: '13 KB',
      uploadTime: '09-16 15:31',
      status: 'success',
      type: 'file'
    },
    {
      id: '4',
      name: '通过观点输出强化个人IP.docx',
      size: '13 KB',
      uploadTime: '09-16 15:31',
      status: 'success',
      type: 'file'
    },
    {
      id: '5',
      name: '暗示程序基本创作核心逻辑.docx',
      size: '13 KB',
      uploadTime: '09-16 15:31',
      status: 'success',
      type: 'file'
    },
    {
      id: '6',
      name: '教如识题基础作方法与流量逻辑.docx',
      size: '13 KB',
      uploadTime: '09-16 15:31',
      status: 'success',
      type: 'file'
    },
    {
      id: '7',
      name: '抖音版案内容策划8大爆款元素.docx',
      size: '13 KB',
      uploadTime: '09-16 15:31',
      status: 'success',
      type: 'file'
    },
    {
      id: '8',
      name: '账号策划.docx',
      size: '14 KB',
      uploadTime: '09-16 15:31',
      status: 'success',
      type: 'file'
    }
  ]);

  const fileTypeData = [
    { key: 'file', label: '文件', icon: <FileTextOutlined />, count: files.filter(f => f.type === 'file').length },
    { key: 'note', label: '笔记', icon: <EditOutlined />, count: files.filter(f => f.type === 'note').length },
    { key: 'directory', label: '目录', icon: <FolderOutlined />, count: files.filter(f => f.type === 'directory').length },
    { key: 'url', label: '网址', icon: <LinkOutlined />, count: files.filter(f => f.type === 'url').length },
    { key: 'website', label: '网站', icon: <GlobalOutlined />, count: files.filter(f => f.type === 'website').length },
  ];

  const filteredFiles = files.filter(file =>
    file.type === activeTab &&
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      const isValidType = [
        'text/plain',
        'text/markdown',
        'text/html',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/epub+zip'
      ].includes(file.type);

      if (!isValidType) {
        message.error('不支持该文件格式');
        return false;
      }

      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('文件大小不能超过 50MB');
        return false;
      }

      // 模拟上传
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        uploadTime: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace('/', '-'),
        status: 'processing',
        type: activeTab
      };

      setFiles(prev => [newFile, ...prev]);

      // 模拟处理完成
      setTimeout(() => {
        setFiles(prev => prev.map(f =>
          f.id === newFile.id ? { ...f, status: 'success' as const } : f
        ));
      }, 2000);

      return false;
    },
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    message.success('文件已删除');
  };

  const handleReprocessFile = (fileId: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status: 'processing' as const } : f
    ));

    setTimeout(() => {
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'success' as const } : f
      ));
    }, 2000);
  };

  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'processing':
        return <ReloadOutlined spin />;
      case 'success':
        return <CheckOutlined style={{ color: 'var(--success-color, #52c41a)' }} />;
      case 'error':
        return <ReloadOutlined style={{ color: 'var(--error-color, #ff4d4f)' }} />;
      default:
        return null;
    }
  };

  return (
    <KnowledgeContainer>
      {/* 顶部工具栏 */}
      <TopToolbar>
        <ToolbarLeft>
          <ModelSelector>
            <SettingOutlined />
            嵌入模型
            <Select
              value={embeddingModel}
              onChange={setEmbeddingModel}
              options={[
                { value: 'BAA/bge-m3', label: 'BAA/bge-m3' },
                { value: 'OpenAI/text-embedding-3-small', label: 'OpenAI/text-embedding-3-small' },
                { value: 'OpenAI/text-embedding-3-large', label: 'OpenAI/text-embedding-3-large' },
              ]}
            />
          </ModelSelector>
        </ToolbarLeft>

        <ToolbarRight>
          <SearchInput
            placeholder="搜索文件..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <AddFileButton type="primary" icon={<PlusOutlined />}>
            添加文件
          </AddFileButton>
        </ToolbarRight>
      </TopToolbar>

      {/* 主要内容区域 */}
      <ContentWrapper>
        {/* 左侧知识库列表 */}
        <LeftSidebar>
          <SidebarHeader>
            <SidebarTitle>知识库</SidebarTitle>
          </SidebarHeader>

          <KnowledgeList>
            {knowledgeBases.map(kb => (
              <KnowledgeItem
                key={kb.id}
                $active={selectedKnowledge === kb.id}
                onClick={() => setSelectedKnowledge(kb.id)}
              >
                <KnowledgeIcon $color={kb.color}>
                  {kb.initial}
                </KnowledgeIcon>
                <KnowledgeInfo>
                  <KnowledgeName>{kb.name}</KnowledgeName>
                  <KnowledgeCount>{kb.fileCount} 个文件</KnowledgeCount>
                </KnowledgeInfo>
              </KnowledgeItem>
            ))}
          </KnowledgeList>
        </LeftSidebar>

        {/* 右侧主内容 */}
        <MainContent>
          {/* 文件类型标签 */}
          <TypeTabs>
            {fileTypeData.map(tab => (
              <TypeTab
                key={tab.key}
                $active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key as 'file' | 'note' | 'directory' | 'url' | 'website')}
              >
                {tab.icon}
                {tab.label}
                <span className="count">{tab.count}</span>
              </TypeTab>
            ))}
          </TypeTabs>

          {/* 内容区域 */}
          <ContentArea>
            {/* 文件上传区域 */}
            <UploadArea>
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">拖拽文件到这里</p>
                <p className="ant-upload-hint">
                  支持 TXT, MD, HTML, PDF, DOCX, PPTX, XLSX, EPUB... 格式
                </p>
              </Dragger>
            </UploadArea>

            {/* 文件列表 */}
            <FileList>
              {filteredFiles.map(file => (
                <FileItem key={file.id}>
                  <FileInfo>
                    <FileIcon>
                      <FileTextOutlined />
                    </FileIcon>
                    <FileDetails>
                      <FileName>{file.name}</FileName>
                      <FileMetadata>{file.uploadTime} · {file.size}</FileMetadata>
                    </FileDetails>
                  </FileInfo>

                  <FileActions>
                    <ActionButton
                      icon={<ReloadOutlined />}
                      size="small"
                      onClick={() => handleReprocessFile(file.id)}
                      title="重新处理"
                    />
                    {getStatusIcon(file.status)}
                    <ActionButton
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => handleDeleteFile(file.id)}
                      title="删除"
                    />
                  </FileActions>
                </FileItem>
              ))}
            </FileList>

            {filteredFiles.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                marginTop: '40px',
                fontSize: '14px'
              }}>
                {searchQuery ? '未找到匹配的文件' : '暂无文件'}
              </div>
            )}
          </ContentArea>
        </MainContent>
      </ContentWrapper>
    </KnowledgeContainer>
  );
};

export default KnowledgeBase;