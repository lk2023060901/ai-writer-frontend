'use client';

import { useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Empty, Switch, Tooltip } from 'antd';

import { Assistant } from '@/features/chat/hooks/useMockData';
import { Box } from '@/shared/ui/layout/primitives';

interface MCPServer {
  id: string;
  name: string;
  description?: string;
  baseUrl?: string;
  isActive: boolean;
}

interface Props {
  assistant: Assistant;
  updateAssistant: (updates: Partial<Assistant>) => void;
}

const serverCatalog: MCPServer[] = [
  {
    id: 'file-search',
    name: 'File Search',
    description: 'Index and retrieve documents uploaded by the team.',
    baseUrl: 'http://localhost:4150',
    isActive: true,
  },
  {
    id: 'web-crawler',
    name: 'Web Crawler',
    description: 'Collect publicly-available web data for enrichment.',
    baseUrl: 'http://localhost:4151',
    isActive: false,
  },
];

const AssistantMCPSettings: React.FC<Props> = ({ assistant, updateAssistant }) => {
  const { t } = useTranslation();

  const allServers = useMemo(() => serverCatalog, []);

  const onUpdate = (ids: string[]) => {
    const mcpServers = ids
      .map((id) => allServers.find((server) => server.id === id))
      .filter((server): server is MCPServer => {
        if (!server) return false;
        return server.isActive;
      });

    updateAssistant({ mcpServers });
  };

  const handleServerToggle = (serverId: string) => {
    const currentServerIds = assistant.mcpServers?.map((server) => server.id) || [];
    if (currentServerIds.includes(serverId)) {
      onUpdate(currentServerIds.filter((id) => id !== serverId));
    } else {
      onUpdate([...currentServerIds, serverId]);
    }
  };

  const enabledCount = assistant.mcpServers?.length || 0;

  return (
    <Container>
      <HeaderContainer>
        <Box style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {t('assistants.settings.mcp.title', 'MCP Servers')}
          <Tooltip
            title={t(
              'assistants.settings.mcp.description',
              'Select Model Context Protocol servers that should respond with this assistant.'
            )}>
            <InfoIcon />
          </Tooltip>
        </Box>
        {allServers.length > 0 && (
          <EnabledCount>
            {enabledCount} / {allServers.length} {t('settings.mcp.active', 'Active')}
          </EnabledCount>
        )}
      </HeaderContainer>

      {allServers.length > 0 ? (
        <ServerList>
          {allServers.map((server) => {
            const isEnabled = assistant.mcpServers?.some((s) => s.id === server.id) || false;

            return (
              <ServerItem key={server.id} isEnabled={isEnabled}>
                <ServerInfo>
                  <ServerName>{server.name}</ServerName>
                  {server.description && <ServerDescription>{server.description}</ServerDescription>}
                  {server.baseUrl && <ServerUrl>{server.baseUrl}</ServerUrl>}
                </ServerInfo>
                <Tooltip
                  title={
                    !server.isActive
                      ? t(
                          'assistants.settings.mcp.enableFirst',
                          'Enable this server in MCP settings before attaching it to assistants.'
                        )
                      : undefined
                  }>
                  <Switch
                    checked={isEnabled}
                    disabled={!server.isActive}
                    onChange={() => handleServerToggle(server.id)}
                    size="small"
                  />
                </Tooltip>
              </ServerItem>
            );
          })}
        </ServerList>
      ) : (
        <EmptyContainer>
          <Empty
            description={t('assistants.settings.mcp.noServersAvailable', 'No MCP servers available')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </EmptyContainer>
      )}
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

const EnabledCount = styled.span`
  font-size: 12px;
  color: var(--color-text-2);
`;

const EmptyContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
`;

const ServerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
`;

const ServerItem = styled.div<{ isEnabled: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: var(--color-background-mute);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  opacity: ${(props) => (props.isEnabled ? 1 : 0.7)};
`;

const ServerInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const ServerName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const ServerDescription = styled.div`
  font-size: 0.85rem;
  color: var(--color-text-2);
  margin-bottom: 3px;
`;

const ServerUrl = styled.div`
  font-size: 0.8rem;
  color: var(--color-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default AssistantMCPSettings;
