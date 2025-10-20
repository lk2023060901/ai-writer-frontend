'use client';

import { useEffect, useRef, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Radio, Space, Typography, message } from 'antd';
import type { RadioChangeEvent } from 'antd/es/radio';

import { useLaunchpad } from '@/features/launchpad/hooks/useLaunchpad';
import type { AssistantPreset } from '@/types/launchpad';

type ImportType = 'url' | 'file';

interface ImportAgentsModalProps {
  open: boolean;
  onClose: () => void;
}

interface RawPreset {
  name?: unknown;
  prompt?: unknown;
  description?: unknown;
  group?: unknown;
  tags?: unknown;
  topics?: unknown;
  model?: unknown;
  defaultModel?: unknown;
  emoji?: unknown;
  source?: unknown;
}

const DEFAULT_CATEGORY = '自定义';
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_EMOJI = '🤖';
const VALID_SOURCES = new Set<AssistantPreset['source']>(['system', 'custom', 'community']);

const isString = (value: unknown): value is string => typeof value === 'string';

const toTrimmedString = (value: unknown): string => (isString(value) ? value.trim() : '');

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizePreset = (raw: RawPreset): AssistantPreset => {
  if (!raw || typeof raw !== 'object') {
    throw new Error('智能体配置格式无效，请检查 JSON 内容。');
  }

  const name = toTrimmedString(raw.name);
  const prompt = toTrimmedString(raw.prompt);

  if (!name || !prompt) {
    throw new Error('智能体配置缺少必要字段：name 或 prompt。');
  }

  const emoji = toTrimmedString(raw.emoji) || DEFAULT_EMOJI;
  const displayName = name.startsWith(emoji) ? name : `${emoji} ${name}`;

  const description = toTrimmedString(raw.description) || prompt;
  const groups = toStringArray(raw.group);
  const tags = Array.from(new Set([...toStringArray(raw.tags), ...toStringArray(raw.topics)]));

  const model =
    toTrimmedString(raw.defaultModel) ||
    toTrimmedString(raw.model) ||
    DEFAULT_MODEL;

  const source = VALID_SOURCES.has(raw.source as AssistantPreset['source'])
    ? (raw.source as AssistantPreset['source'])
    : 'custom';

  return {
    id: crypto.randomUUID(),
    name: displayName,
    description,
    category: groups[0] ?? DEFAULT_CATEGORY,
    tags,
    model,
    prompt,
    source,
    avatar: emoji
  };
};

const normalizePresetList = (raw: unknown): AssistantPreset[] => {
  if (raw === undefined || raw === null) {
    throw new Error('未检测到有效的智能体配置。');
  }

  const list = Array.isArray(raw) ? raw : [raw];

  if (!list.length) {
    throw new Error('导入的 JSON 内容为空。');
  }

  return list.map((item) => normalizePreset(item as RawPreset));
};

const ImportAgentsModal: React.FC<ImportAgentsModalProps> = ({ open, onClose }) => {
  const { importAssistantPreset } = useLaunchpad();
  const [form] = Form.useForm<{ url?: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importType, setImportType] = useState<ImportType>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setImportType('url');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open, form]);

  const handleImportTypeChange = (event: RadioChangeEvent) => {
    setImportType(event.target.value as ImportType);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    if (loading) {
      return;
    }
    onClose();
  };

  const readFileConfig = async (file: File) => {
    const content = await file.text();
    try {
      return JSON.parse(content) as unknown;
    } catch {
      throw new Error('解析文件失败，请确认 JSON 格式有效。');
    }
  };

  const fetchRemoteConfig = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('下载智能体配置失败，请检查链接是否正确。');
    }
    try {
      return (await response.json()) as unknown;
    } catch {
      throw new Error('解析远程配置失败，请确认 JSON 内容有效。');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let rawConfig: unknown;

      if (importType === 'url') {
        const { url } = await form.validateFields();
        const trimmed = url?.trim();
        if (!trimmed) {
          throw new Error('请输入有效的 JSON 地址。');
        }
        rawConfig = await fetchRemoteConfig(trimmed);
      } else {
        if (!selectedFile) {
          throw new Error('请选择要导入的 JSON 文件。');
        }
        rawConfig = await readFileConfig(selectedFile);
      }

      const presets = normalizePresetList(rawConfig);

      presets.forEach((preset) => {
        importAssistantPreset(preset);
      });

      message.success(`成功导入 ${presets.length} 个智能体。`);
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || '导入失败，请稍后重试。');
      } else {
        message.error('导入失败，请检查配置格式。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Modal
        title="导入智能体模版"
        open={open}
        onCancel={handleClose}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText="导入"
        cancelText="取消"
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item label="导入方式">
            <Radio.Group value={importType} onChange={handleImportTypeChange}>
              <Radio.Button value="url">从 URL 导入</Radio.Button>
              <Radio.Button value="file">上传 JSON 文件</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {importType === 'url' ? (
            <Form.Item
              name="url"
              label="JSON 地址"
              rules={[
                { required: true, message: '请输入 JSON 地址' },
                { type: 'url', message: '请输入有效的 URL' }
              ]}
            >
              <Input placeholder="例如：https://example.com/agent.json" allowClear />
            </Form.Item>
          ) : (
            <Form.Item label="选择文件" required>
              <Space size="middle">
                <Button icon={<UploadOutlined />} onClick={handleSelectFileClick}>
                  选择 JSON 文件
                </Button>
                <Typography.Text type={selectedFile ? undefined : 'secondary'}>
                  {selectedFile ? selectedFile.name : '未选择文件'}
                </Typography.Text>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default ImportAgentsModal;
