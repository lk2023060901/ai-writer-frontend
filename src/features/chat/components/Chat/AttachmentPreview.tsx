'use client';

import {
  FileExcelFilled,
  FileImageFilled,
  FileMarkdownFilled,
  FilePdfFilled,
  FilePptFilled,
  FileTextFilled,
  FileUnknownFilled,
  FileWordFilled,
  FileZipFilled,
  FolderOpenFilled,
  GlobalOutlined,
  LinkOutlined
} from '@ant-design/icons';
import CustomTag from '@/shared/ui/tags/CustomTag';
import { Tooltip, Image } from 'antd';
import { FC, useState } from 'react';
import styled from 'styled-components';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  ext: string;
  url?: string;
  path?: string;
}

interface Props {
  files: FileMetadata[];
  setFiles: (files: FileMetadata[]) => void;
}

const MAX_FILENAME_DISPLAY_LENGTH = 20;

function truncateFileName(name: string, maxLength: number = MAX_FILENAME_DISPLAY_LENGTH) {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + '...';
}

export const getFileIcon = (ext?: string) => {
  if (!ext) return <FileUnknownFilled />;

  const extension = ext.toLowerCase();

  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(extension)) {
    return <FileImageFilled />;
  }

  if (['.doc', '.docx'].includes(extension)) {
    return <FileWordFilled />;
  }
  if (['.xls', '.xlsx'].includes(extension)) {
    return <FileExcelFilled />;
  }
  if (['.ppt', '.pptx'].includes(extension)) {
    return <FilePptFilled />;
  }
  if (extension === '.pdf') {
    return <FilePdfFilled />;
  }
  if (['.md', '.markdown'].includes(extension)) {
    return <FileMarkdownFilled />;
  }
  if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(extension)) {
    return <FileZipFilled />;
  }
  if (['.txt', '.json', '.log', '.yml', '.yaml', '.xml', '.csv'].includes(extension)) {
    return <FileTextFilled />;
  }
  if (['.url'].includes(extension)) {
    return <LinkOutlined />;
  }
  if (['.sitemap'].includes(extension)) {
    return <GlobalOutlined />;
  }
  if (['.folder'].includes(extension)) {
    return <FolderOpenFilled />;
  }

  return <FileUnknownFilled />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const FileNameRender: FC<{ file: FileMetadata }> = ({ file }) => {
  const [visible, setVisible] = useState<boolean>(false);

  const isImage = (ext: string) => {
    return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext.toLowerCase());
  };

  const fullName = file.name;
  const displayName = truncateFileName(fullName);

  return (
    <Tooltip
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          {isImage(file.ext) && file.url && (
            <Image
              style={{ width: 80, maxHeight: 200 }}
              src={file.url}
              alt={fullName}
              preview={{
                visible: visible,
                src: file.url,
                onVisibleChange: setVisible
              }}
            />
          )}
          <span style={{ wordBreak: 'break-all' }}>{fullName}</span>
          <span>{formatFileSize(file.size)}</span>
        </div>
      }>
      <FileName
        onClick={() => {
          if (isImage(file.ext) && file.url) {
            setVisible(true);
          }
        }}
        title={fullName}>
        {displayName}
      </FileName>
    </Tooltip>
  );
};

const AttachmentPreview: FC<Props> = ({ files, setFiles }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <ContentContainer>
      {files.map((file) => (
        <CustomTag
          key={file.id}
          icon={getFileIcon(file.ext)}
          color="#37a5aa"
          closable
          onClose={() => setFiles(files.filter((f) => f.id !== file.id))}>
          <FileNameRender file={file} />
        </CustomTag>
      ))}
    </ContentContainer>
  );
};

const ContentContainer = styled.div`
  width: 100%;
  padding: 5px 15px 5px 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 4px;
`;

const FileName = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

export default AttachmentPreview;
