'use client';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Space, Switch, Tooltip, Typography } from 'antd';
import { Settings2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Box } from '@/shared/ui/layout/primitives';
import { Assistant } from '@/features/chat/hooks/useMockData';

const { Text } = Typography;

interface Props {
  assistant: Assistant;
  updateAssistant: (updates: Partial<Assistant>) => void;
  onClose?: () => void;
}

const AssistantMemorySettings: React.FC<Props> = ({ assistant, updateAssistant, onClose }) => {
  const { t } = useTranslation();
  // Placeholder flags until a real memory configuration service is wired up
  const globalMemoryEnabled = false;
  const isMemoryConfigured = false;
  const [memoryStats, setMemoryStats] = useState<{ count: number; loading: boolean }>({
    count: 0,
    loading: true
  });

  // Load memory statistics for this assistant
  const loadMemoryStats = useCallback(async (agentId: string) => {
    setMemoryStats((prev) => ({ ...prev, loading: true }));
    try {
      // TODO: Implement actual memory service call
      // const result = await memoryService.list({ agentId, limit: 1000 });
      if (!agentId) {
        setMemoryStats({ count: 0, loading: false });
        return;
      }
      setMemoryStats({ count: 0, loading: false });
    } catch (error) {
      console.error('Failed to load memory stats:', error);
      setMemoryStats({ count: 0, loading: false });
    }
  }, []);

  useEffect(() => {
    loadMemoryStats(assistant.id);
  }, [assistant.id, loadMemoryStats]);

  const handleMemoryToggle = (enabled: boolean) => {
    updateAssistant({ enableMemory: enabled });
  };

  const handleNavigateToMemory = () => {
    // Close current modal/page first
    if (onClose) {
      onClose();
    }
    // Then navigate to memory settings page
    window.location.hash = '#/settings/memory';
  };

  const isMemoryEnabled = globalMemoryEnabled && isMemoryConfigured;

  return (
    <Container>
      <HeaderContainer>
        <Box style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {t('memory.title', 'Memories')}
          <Tooltip
            title={t(
              'memory.description',
              'Enable memory to let this assistant recall important details from past conversations.'
            )}>
            <InfoIcon />
          </Tooltip>
        </Box>
        <Space>
          <Button type="text" icon={<Settings2 size={15} />} onClick={handleNavigateToMemory} />
          <Tooltip
            title={
              !globalMemoryEnabled
                ? t('memory.enable_global_memory_first', 'Enable global memory first in workspace settings.')
                : !isMemoryConfigured
                  ? t('memory.configure_memory_first', 'Configure memory backends before turning this on.')
                  : ''
            }>
            <Switch checked={assistant.enableMemory || false} onChange={handleMemoryToggle} disabled={!isMemoryEnabled} />
          </Tooltip>
        </Space>
      </HeaderContainer>

      {!globalMemoryEnabled && (
        <Alert
          type="warning"
          message={t('memory.global_memory_disabled_title', 'Global memory disabled')}
          description={t(
            'memory.global_memory_disabled_desc',
            'Head over to Memory Settings to enable global memory for your workspace.'
          )}
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={handleNavigateToMemory}>
              {t('memory.go_to_memory_page', 'Open memory settings')}
            </Button>
          }
        />
      )}

      {globalMemoryEnabled && !isMemoryConfigured && (
        <Alert
          type="warning"
          message={t('memory.not_configured_title', 'Memory not configured')}
          description={t(
            'memory.not_configured_desc',
            'Configure embedding and LLM providers before enabling assistant memories.'
          )}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>{t('memory.stored_memories', 'Stored memories')}: </Text>
            <Text>{memoryStats.loading ? t('common.loading', 'Loading...') : memoryStats.count}</Text>
          </div>
          <div>
            <Text strong>{t('memory.embedding_model', 'Embedding model')}: </Text>
            <Text code>{isMemoryConfigured ? 'Configured' : t('common.not_configured', 'Not configured')}</Text>
          </div>
          <div>
            <Text strong>{t('memory.llm_model', 'LLM model')}: </Text>
            <Text code>{isMemoryConfigured ? 'Configured' : t('common.not_configured', 'Not configured')}</Text>
          </div>
        </Space>
      </Card>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const InfoIcon = styled(InfoCircleOutlined)`
  margin-left: 6px;
  font-size: 14px;
  color: var(--color-text-2);
  cursor: help;
`;

export default AssistantMemorySettings;
