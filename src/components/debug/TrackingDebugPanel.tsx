/**
 * 埋点调试面板
 * 仅在开发环境显示，用于实时查看埋点事件
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Input, Select, Card, Badge, Tabs, Space, Typography, Tooltip } from 'antd';
import {
  BugOutlined,
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
  EyeOutlined,
  CloseOutlined,
  DragOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import tracker, { type SimpleTrackingEvent } from '@/utils/tracking';

const { Option } = Select;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

// 仅在开发环境使用
const isDev = process.env.NODE_ENV === 'development';

interface DebugPanelState {
  visible: boolean;
  minimized: boolean;
  position: { x: number; y: number };
  filters: {
    eventName: string;
    page: string;
    timeRange: number; // 分钟
    searchText: string;
  };
}

const DebugContainer = styled.div<{
  $visible: boolean;
  $minimized: boolean;
  $x: number;
  $y: number;
}>`
  position: fixed;
  top: ${props => props.$y}px;
  left: ${props => props.$x}px;
  width: ${props => props.$minimized ? '300px' : '600px'};
  height: ${props => props.$minimized ? '40px' : '500px'};
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #333;
  border-radius: 8px;
  z-index: 999999;
  color: #0f0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  display: ${props => props.$visible ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 255, 0, 0.1);
  backdrop-filter: blur(10px);
  resize: both;
  min-width: 300px;
  min-height: 200px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 48px rgba(0, 255, 0, 0.2);
  }
`;

const DebugHeader = styled.div`
  background: #1a1a1a;
  padding: 8px 12px;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #0f0;
    font-weight: bold;
  }

  .header-actions {
    display: flex;
    gap: 4px;
  }

  .header-btn {
    background: transparent;
    border: none;
    color: #0f0;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      background: rgba(0, 255, 0, 0.1);
    }
  }
`;

const DebugContent = styled.div<{ $minimized: boolean }>`
  flex: 1;
  overflow: hidden;
  display: ${props => props.$minimized ? 'none' : 'flex'};
  flex-direction: column;

  .ant-tabs {
    height: 100%;

    .ant-tabs-content-holder {
      overflow: hidden;
    }

    .ant-tabs-tabpane {
      height: 100%;
      overflow-y: auto;
    }
  }
`;

const FilterBar = styled.div`
  padding: 8px 12px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;

  .filter-item {
    min-width: 120px;
  }

  .ant-input,
  .ant-select .ant-select-selector {
    background: #000 !important;
    border-color: #333 !important;
    color: #0f0 !important;
  }

  .ant-btn {
    background: #000;
    border-color: #333;
    color: #0f0;

    &:hover {
      background: rgba(0, 255, 0, 0.1) !important;
      border-color: #0f0 !important;
    }
  }
`;

const EventList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a1a;
  }

  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }
`;

const EventItem = styled.div<{ $type: string }>`
  background: #0a0a0a;
  border: 1px solid #333;
  border-left: 3px solid ${props => getEventTypeColor(props.$type)};
  border-radius: 4px;
  margin-bottom: 4px;
  padding: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #1a1a1a;
    border-color: #0f0;
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .event-name {
    color: ${props => getEventTypeColor(props.$type)};
    font-weight: bold;
  }

  .event-time {
    color: #666;
    font-size: 10px;
  }

  .event-props {
    color: #aaa;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 100px;
    overflow-y: auto;
    font-size: 11px;
  }
`;

const StatsPanel = styled.div`
  padding: 12px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-card {
    background: #0a0a0a;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 8px;
    text-align: center;

    .stat-value {
      color: #0f0;
      font-size: 18px;
      font-weight: bold;
    }

    .stat-label {
      color: #666;
      font-size: 10px;
      margin-top: 4px;
    }
  }
`;

function getEventTypeColor(eventName: string): string {
  if (eventName.startsWith('chat_')) return '#00ff00';
  if (eventName.startsWith('model_')) return '#00aaff';
  if (eventName.startsWith('app_')) return '#ff6600';
  if (eventName.startsWith('error_')) return '#ff0000';
  if (eventName.startsWith('performance_')) return '#ffaa00';
  return '#666666';
}

const TrackingDebugPanel: React.FC = () => {
  const [state, setState] = useState<DebugPanelState>({
    visible: false,
    minimized: false,
    position: { x: window.innerWidth - 620, y: 80 },
    filters: {
      eventName: '',
      page: '',
      timeRange: 30,
      searchText: ''
    }
  });

  const [events, setEvents] = useState<SimpleTrackingEvent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 监听埋点事件
  useEffect(() => {
    if (!isDev) return;

    const updateEvents = () => {
      const trackedEvents = tracker.getEvents();
      setEvents(trackedEvents);
    };

    // 初始加载
    updateEvents();

    // 定期更新
    const interval = setInterval(updateEvents, 1000);

    // 监听storage变化
    const handleStorageChange = () => {
      updateEvents();
    };

    window.addEventListener('storage', handleStorageChange);

    // 键盘快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        togglePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 过滤事件
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const { eventName, page, timeRange, searchText } = state.filters;
      const now = Date.now();

      // 时间过滤
      if (timeRange > 0 && now - event.time > timeRange * 60 * 1000) {
        return false;
      }

      // 事件名过滤
      if (eventName && !event.name.includes(eventName)) {
        return false;
      }

      // 页面过滤
      if (page && event.page !== page) {
        return false;
      }

      // 搜索文本过滤
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const eventStr = JSON.stringify(event).toLowerCase();
        if (!eventStr.includes(searchLower)) {
          return false;
        }
      }

      return true;
    }).reverse(); // 最新的在前面
  }, [events, state.filters]);

  // 统计信息
  const stats = useMemo(() => {
    const stats = tracker.getStats();
    const recentEvents = events.filter(e => Date.now() - e.time < 60 * 1000);

    return {
      ...stats,
      recentEventCount: recentEvents.length,
      filteredCount: filteredEvents.length
    };
  }, [events, filteredEvents]);

  // 面板操作
  const togglePanel = useCallback(() => {
    setState(prev => ({ ...prev, visible: !prev.visible }));
  }, []);

  const toggleMinimize = useCallback(() => {
    setState(prev => ({ ...prev, minimized: !prev.minimized }));
  }, []);

  const closePanel = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }));
  }, []);

  const clearEvents = useCallback(() => {
    tracker.clearData();
    setEvents([]);
  }, []);

  const exportData = useCallback(() => {
    const dataStr = tracker.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tracking-debug-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  // 拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as Element).closest('.header-title')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - state.position.x,
        y: e.clientY - state.position.y
      });
    }
  }, [state.position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setState(prev => ({
        ...prev,
        position: {
          x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 300)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100))
        }
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 非开发环境不显示
  if (!isDev) {
    return null;
  }

  // 浮动按钮
  if (!state.visible) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 999998
        }}
      >
        <Button
          type="primary"
          icon={<BugOutlined />}
          onClick={togglePanel}
          style={{
            background: '#000',
            borderColor: '#0f0',
            color: '#0f0'
          }}
        >
          Debug
        </Button>
      </div>
    );
  }

  return (
    <DebugContainer
      $visible={state.visible}
      $minimized={state.minimized}
      $x={state.position.x}
      $y={state.position.y}
    >
      <DebugHeader onMouseDown={handleMouseDown}>
        <div className="header-title">
          <DragOutlined />
          <span>埋点调试 </span>
          <Badge count={filteredEvents.length} style={{ backgroundColor: '#0f0', color: '#000' }} />
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={toggleMinimize}>
            {state.minimized ? <EyeOutlined /> : <FilterOutlined />}
          </button>
          <button className="header-btn" onClick={closePanel}>
            <CloseOutlined />
          </button>
        </div>
      </DebugHeader>

      <DebugContent $minimized={state.minimized}>
        {!state.minimized && (
          <Tabs defaultActiveKey="events" size="small">
            <TabPane tab="事件流" key="events">
              <FilterBar>
                <Input
                  placeholder="搜索事件..."
                  value={state.filters.searchText}
                  onChange={e => setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, searchText: e.target.value }
                  }))}
                  style={{ width: 150 }}
                />
                <Select
                  placeholder="事件类型"
                  value={state.filters.eventName || undefined}
                  onChange={value => setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, eventName: value || '' }
                  }))}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Option value="chat_">聊天相关</Option>
                  <Option value="model_">模型相关</Option>
                  <Option value="app_">应用相关</Option>
                  <Option value="error_">错误相关</Option>
                </Select>
                <Select
                  placeholder="时间范围"
                  value={state.filters.timeRange}
                  onChange={value => setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, timeRange: value }
                  }))}
                  style={{ width: 100 }}
                >
                  <Option value={5}>5分钟</Option>
                  <Option value={30}>30分钟</Option>
                  <Option value={60}>1小时</Option>
                  <Option value={0}>全部</Option>
                </Select>
                <Button icon={<ClearOutlined />} onClick={clearEvents} size="small">
                  清空
                </Button>
                <Button icon={<DownloadOutlined />} onClick={exportData} size="small">
                  导出
                </Button>
              </FilterBar>

              <EventList>
                {filteredEvents.map((event, index) => (
                  <EventItem key={`${event.time}-${index}`} $type={event.name}>
                    <div className="event-header">
                      <span className="event-name">{event.name}</span>
                      <span className="event-time">
                        {new Date(event.time).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="event-props">
                      {JSON.stringify(event.props, null, 2)}
                    </div>
                  </EventItem>
                ))}
                {filteredEvents.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    暂无事件数据
                  </div>
                )}
              </EventList>
            </TabPane>

            <TabPane tab="统计" key="stats">
              <StatsPanel>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{stats.eventCount}</div>
                    <div className="stat-label">总事件数</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.recentEventCount}</div>
                    <div className="stat-label">最近1分钟</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{Math.round(stats.sessionDuration / 1000)}s</div>
                    <div className="stat-label">会话时长</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.filteredCount}</div>
                    <div className="stat-label">筛选结果</div>
                  </div>
                </div>

                <Title level={5} style={{ color: '#0f0', margin: '16px 0 8px' }}>
                  热门事件
                </Title>
                {stats.topEvents.map((item, index) => (
                  <div key={item.name} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    background: index % 2 === 0 ? '#0a0a0a' : 'transparent'
                  }}>
                    <Text style={{ color: getEventTypeColor(item.name) }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: '#666' }}>
                      {item.count}
                    </Text>
                  </div>
                ))}
              </StatsPanel>
            </TabPane>
          </Tabs>
        )}
      </DebugContent>
    </DebugContainer>
  );
};

export default TrackingDebugPanel;