import React, { useState, useEffect } from 'react';
import { Modal, Input, Tag, Spin, Empty } from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  StarOutlined,
  RocketOutlined,
  CodeOutlined,
  GlobalOutlined,
  ExperimentOutlined,
  EyeOutlined,
  BulbOutlined,
  ToolOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setCurrentModel } from '@/store/slices/uiSlice';
import type { AIModel, ModelProvider } from '@/types/model';

const ModalContent = styled.div`
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 480px;
  max-height: 580px;
  display: flex;
  flex-direction: column;
  margin-top: -8px;
  position: relative;
  overflow: hidden;
`;

const SearchArea = styled.div`
  padding: 12px 24px 10px;
  background: var(--bg-primary);

  .ant-input-affix-wrapper {
    background: var(--bg-secondary);
    border-color: var(--border-color);
    border-radius: 8px;
    height: 40px;

    &:hover, &:focus-within {
      border-color: var(--accent-color);
    }

    input {
      background: transparent;
      color: var(--text-primary);
      font-size: 14px;

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    .anticon-search {
      color: var(--text-tertiary);
    }
  }
`;

const FilterTabs = styled.div`
  padding: 0 24px 12px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
`;

const FilterTag = styled.div<{ $active: boolean }>`
  padding: 6px 14px;
  background: ${props => props.$active ? 'var(--accent-color)' : 'var(--bg-secondary)'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${props => props.$active ? 'var(--accent-color)' : 'var(--bg-tertiary)'};
    color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  }

  .anticon {
    font-size: 14px;
  }
`;

const ModelsListWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
`;

const ModelsList = styled.div`
  padding: 16px 24px 20px 24px;
`;

const ProviderSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProviderTitle = styled.h3`
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModelItem = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => props.$isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'};
  border: 1px solid ${props => props.$isSelected ? 'var(--accent-color)' : 'var(--border-color)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    transform: translateX(2px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ModelIcon = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 8px;
  color: var(--accent-color);
  font-size: 20px;
  flex-shrink: 0;
`;

const ModelInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ModelName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const ModelDescription = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
`;

const ModelCapabilities = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .ant-tag {
    margin: 0;
    font-size: 11px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
  }
`;

const SelectionIndicator = styled.div`
  color: var(--accent-color);
  font-size: 18px;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

interface ModelSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  providers: ModelProvider[];
  loading?: boolean;
}

// 图标映射
const providerIcons: Record<string, React.ReactNode> = {
  'anthropic': <RobotOutlined />,
  'qwen': <GlobalOutlined />,
  'deepseek': <CodeOutlined />,
  'google': <RocketOutlined />,
  'openai': <ThunderboltOutlined />,
  'moonshot': <StarOutlined />,
};

const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  visible,
  onClose,
  providers,
  loading = false,
}) => {
  const dispatch = useAppDispatch();
  const { currentModel } = useAppSelector(state => state.ui);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [filteredProviders, setFilteredProviders] = useState<ModelProvider[]>([]);

  const filterTags = [
    { key: 'all', label: '全部', icon: null },
    { key: 'vision', label: '视觉', icon: <EyeOutlined /> },
    { key: 'reasoning', label: '推理', icon: <BulbOutlined /> },
    { key: 'tools', label: '工具', icon: <ToolOutlined /> },
    { key: 'online', label: '联网', icon: <WifiOutlined /> },
  ];

  useEffect(() => {
    let filtered = providers;

    // 先按标签过滤
    if (activeFilter !== 'all') {
      filtered = providers.map(provider => ({
        ...provider,
        models: provider.models.filter(model => {
          // 根据标签过滤逻辑
          if (activeFilter === 'vision') {
            return model.capabilities?.some(cap =>
              cap.includes('视觉') || cap.includes('多模态') || cap.includes('图像')
            );
          }
          if (activeFilter === 'reasoning') {
            return model.capabilities?.some(cap =>
              cap.includes('推理') || cap.includes('思考') || cap.includes('分析')
            );
          }
          if (activeFilter === 'tools') {
            return model.capabilities?.some(cap =>
              cap.includes('工具') || cap.includes('代码') || cap.includes('函数')
            );
          }
          if (activeFilter === 'online') {
            return model.capabilities?.some(cap =>
              cap.includes('联网') || cap.includes('实时') || cap.includes('搜索')
            );
          }
          return true;
        })
      })).filter(provider => provider.models.length > 0);
    }

    // 再按搜索文本过滤
    if (searchText.trim()) {
      filtered = filtered.map(provider => ({
        ...provider,
        models: provider.models.filter(
          model =>
            model.name.toLowerCase().includes(searchText.toLowerCase()) ||
            model.description?.toLowerCase().includes(searchText.toLowerCase()) ||
            provider.name.toLowerCase().includes(searchText.toLowerCase())
        )
      })).filter(provider => provider.models.length > 0);
    }

    setFilteredProviders(filtered);
  }, [searchText, activeFilter, providers]);

  const handleSelectModel = (model: AIModel) => {
    dispatch(setCurrentModel({
      id: model.id,
      name: model.name,
    }));
    onClose();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      closable={false}
      maskClosable={true}
      destroyOnHidden
      styles={{
        body: {
          padding: 0,
          background: 'var(--bg-primary)',
          marginTop: '-20px'
        }
      }}
    >
      <ModalContent>
        <SearchArea>
          <Input
            placeholder="搜索模型..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </SearchArea>

        <FilterTabs>
          {filterTags.map(tag => (
            <FilterTag
              key={tag.key}
              $active={activeFilter === tag.key}
              onClick={() => setActiveFilter(tag.key)}
            >
              {tag.icon}
              {tag.label}
            </FilterTag>
          ))}
        </FilterTabs>

        {loading ? (
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
        ) : filteredProviders.length === 0 ? (
          <LoadingContainer>
            <Empty description="未找到匹配的模型" />
          </LoadingContainer>
        ) : (
          <ModelsListWrapper>
            <ModelsList>
            {filteredProviders.map((provider) => (
              <ProviderSection key={provider.id}>
                <ProviderTitle>
                  {providerIcons[provider.id] || <ExperimentOutlined />}
                  {provider.name}
                </ProviderTitle>
                {provider.models.map((model) => (
                  <ModelItem
                    key={model.id}
                    $isSelected={currentModel === model.id}
                    onClick={() => handleSelectModel(model)}
                  >
                    <ModelIcon>
                      {providerIcons[provider.id] || <RobotOutlined />}
                    </ModelIcon>
                    <ModelInfo>
                      <ModelName>
                        {model.name}
                        {model.isNew && (
                          <Tag color="green" style={{ marginLeft: 'auto' }}>NEW</Tag>
                        )}
                        {model.isPro && (
                          <Tag color="gold" style={{ marginLeft: model.isNew ? '0' : 'auto' }}>PRO</Tag>
                        )}
                      </ModelName>
                      {model.description && (
                        <ModelDescription>{model.description}</ModelDescription>
                      )}
                      {model.capabilities && model.capabilities.length > 0 && (
                        <ModelCapabilities>
                          {model.capabilities.map((cap, index) => (
                            <Tag key={index}>{cap}</Tag>
                          ))}
                        </ModelCapabilities>
                      )}
                    </ModelInfo>
                    {currentModel === model.id && (
                      <SelectionIndicator>
                        <CheckCircleOutlined />
                      </SelectionIndicator>
                    )}
                  </ModelItem>
                ))}
              </ProviderSection>
            ))}
            </ModelsList>
          </ModelsListWrapper>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModelSelectorModal;