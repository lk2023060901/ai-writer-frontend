'use client';

import React, { useState, useEffect } from 'react';
import { Button, Upload, Tabs, Progress, App } from 'antd';
import {
  PlusOutlined,
  SettingOutlined,
  SearchOutlined,
  InboxOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  LinkOutlined,
  DeleteOutlined,
  SyncOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';

const { Dragger } = Upload;

interface KnowledgeBase {
  id: string;
  name: string;
  icon: string;
}

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'url';
  size: string;
  date: string;
  status: 'completed' | 'processing' | 'failed';
  progress?: number;
}

const knowledgeBases: KnowledgeBase[] = [
  { id: '1', name: 'Product Documentation', icon: '📚' },
  { id: '2', name: 'Customer Support', icon: '🎧' },
  { id: '3', name: 'Internal Wiki', icon: '🎓' },
  { id: '4', name: 'Marketing Materials', icon: '📣' },
];

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'getting-started.pdf',
    type: 'pdf',
    size: '1.2 MB',
    date: 'Oct 26, 2023',
    status: 'completed',
  },
  {
    id: '2',
    name: 'api-reference.md',
    type: 'text',
    size: '584 KB',
    date: 'Oct 25, 2023',
    status: 'completed',
  },
  {
    id: '3',
    name: 'FAQ.pdf',
    type: 'pdf',
    size: '890 KB',
    date: 'Oct 24, 2023',
    status: 'processing',
    progress: 65,
  },
];

export default function KnowledgeBasesPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [selectedKb, setSelectedKb] = useState('1');
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      message.warning('Please login first');
      router.push('/login');
    }
  }, [router]);

  const handleUpload = (file: any) => {
    message.success(`${file.name} uploaded successfully`);
    const newDoc: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : 'text',
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      date: new Date().toLocaleDateString(),
      status: 'processing',
      progress: 0,
    };
    setDocuments([newDoc, ...documents]);
    return false;
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    message.success('Document deleted successfully');
  };

  const handleReprocess = (id: string) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === id ? { ...doc, status: 'processing', progress: 0 } : doc
      )
    );
    message.info('Reprocessing document...');
  };

  const getDocumentIcon = (type: string, status: string) => {
    if (type === 'pdf') {
      return <FilePdfOutlined className="text-2xl text-red-600 dark:text-red-400" />;
    } else if (type === 'url') {
      return <LinkOutlined className="text-2xl text-blue-600 dark:text-blue-400" />;
    } else {
      return <FileTextOutlined className="text-2xl text-blue-600 dark:text-blue-400" />;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pdf') return doc.type === 'pdf';
    if (activeTab === 'text') return doc.type === 'text';
    if (activeTab === 'url') return doc.type === 'url';
    return true;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar activeTabKey="knowledge" />
      <div className="grid h-full grid-cols-12">
        {/* Knowledge Bases Sidebar */}
        <div className="col-span-3 overflow-y-auto border-r border-background-dark/10 bg-background-light p-4 dark:border-background-light/10 dark:bg-background-dark">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="w-full"
            size="large"
          >
            Create Knowledge Base
          </Button>

          <nav className="mt-6 space-y-2">
            {knowledgeBases.map((kb) => (
              <div
                key={kb.id}
                onClick={() => setSelectedKb(kb.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  selectedKb === kb.id
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-background-dark/70 hover:bg-background-dark/5 dark:text-background-light/70 dark:hover:bg-background-light/5'
                }`}
              >
                <span className="text-xl">{kb.icon}</span>
                <span>{kb.name}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Documents Area */}
        <div className="col-span-9 flex flex-col overflow-y-auto bg-white p-6 dark:bg-background-dark/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-background-dark/60 dark:text-background-light/60">
              Embedding Model: text-embedding-ada-002
            </p>
            <Button
              type="text"
              icon={<SearchOutlined />}
              className="flex h-9 w-9 items-center justify-center"
            />
          </div>

          <hr className="my-4 border-background-dark/10 dark:border-background-light/10" />

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'all', label: 'All' },
              { key: 'text', label: 'Text' },
              { key: 'pdf', label: 'PDF' },
              { key: 'url', label: 'URL' },
            ]}
            className="mb-0"
          />

          <div className="mt-4">
            <Dragger
              beforeUpload={handleUpload}
              showUploadList={false}
              className="rounded-lg"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-4xl text-primary/60" />
              </p>
              <p className="ant-upload-text text-base font-medium">
                Click or drag file to this area
              </p>
              <p className="ant-upload-hint text-sm text-background-dark/60 dark:text-background-light/60">
                Support for single file upload
              </p>
            </Dragger>
          </div>

          <div className="mt-4 space-y-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 rounded-lg border border-background-dark/10 bg-background-light p-4 dark:border-background-light/10 dark:bg-background-dark/30"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    doc.type === 'pdf'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}
                >
                  {getDocumentIcon(doc.type, doc.status)}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-background-dark dark:text-background-light">
                    {doc.name}
                  </p>
                  <p className="text-sm text-background-dark/60 dark:text-background-light/60">
                    {doc.size} • {doc.date}
                  </p>
                  {doc.status === 'processing' && (
                    <Progress percent={doc.progress} size="small" className="mt-2" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {doc.status === 'completed' && (
                    <>
                      <Button
                        type="text"
                        icon={<SyncOutlined />}
                        onClick={() => handleReprocess(doc.id)}
                      />
                      <Button
                        type="text"
                        icon={<CheckCircleOutlined />}
                        className="text-green-600 dark:text-green-400"
                      />
                    </>
                  )}
                  {doc.status === 'processing' && (
                    <Button
                      type="text"
                      icon={<SyncOutlined spin />}
                      disabled
                    />
                  )}
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDelete(doc.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-background-dark/60 dark:text-background-light/60">
                  No documents found
                </p>
                <p className="mt-2 text-sm text-background-dark/50 dark:text-background-light/50">
                  Upload your first document to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
