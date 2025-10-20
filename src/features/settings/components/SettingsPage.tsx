'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Input, Button, Switch, Select, Space, Modal, ColorPicker, Segmented, Typography, Dropdown, Tabs, Tag } from 'antd';
import { CloudServerOutlined, CloudSyncOutlined, FileSearchOutlined, YuqueOutlined } from '@ant-design/icons';
import {
  Brain,
  Cloud,
  Command,
  FileCode,
  FileText,
  Hammer,
  HardDrive,
  Info,
  MonitorCog,
  Monitor,
  Sun,
  Moon,
  NotebookPen,
  Package,
  PictureInPicture2,
  Save as SaveIcon,
  FolderOpen,
  FolderCog,
  FolderInput,
  Server,
  Settings2,
  TextCursorInput,
  Minus,
  Plus,
  Sparkle,
  Zap
} from 'lucide-react';

import Navbar from '@/features/chat/components/Navbar';
import Scrollbar from '@/shared/ui/Scrollbar';
import ProviderSettingsSection from '../provider/ProviderSettingsSection';

import {
  SettingContainer,
  SettingDescription,
  SettingGroup,
  SettingDivider,
  SettingHelpText,
  SettingHelpTextRow,
  SettingRow,
  SettingRowTitle,
  SettingTitle
} from './SettingElements';

const GlobalIcon = () => <span className="anticon"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm7.93 9h-2.4a15.57 15.57 0 0 0-1.2-5.19A8.033 8.033 0 0 1 19.93 11ZM12 20a12.467 12.467 0 0 1-2.78-6h5.56A12.467 12.467 0 0 1 12 20ZM9 12a14.43 14.43 0 0 1 1.5-6.36A12.512 12.512 0 0 1 12 4.06a12.512 12.512 0 0 1 1.5 1.58A14.43 14.43 0 0 1 15 12Zm-1.69-6.19A15.57 15.57 0 0 0 6.47 11H4.07a8.033 8.033 0 0 1 3.24-5.19Zm-3.24 7.19h2.4a15.57 15.57 0 0 0 1.2 5.19A8.033 8.033 0 0 1 4.07 13Zm12.17 5.19A15.57 15.57 0 0 0 17.53 13h2.4a8.033 8.033 0 0 1-3.24 5.19Z"/></svg></span>;

const MENU_GROUPS = [
  [
    { slug: 'provider', label: '模型服务', icon: <Cloud size={18} /> },
    { slug: 'model', label: '默认模型', icon: <Package size={18} /> }
  ],
  [
    { slug: 'general', label: '常规设置', icon: <Settings2 size={18} /> },
    { slug: 'display', label: '显示设置', icon: <MonitorCog size={18} /> },
    { slug: 'data', label: '数据设置', icon: <HardDrive size={18} /> }
  ],
  [
    { slug: 'mcp', label: 'MCP 服务器', icon: <Hammer size={18} /> },
    { slug: 'notes', label: '笔记', icon: <NotebookPen size={18} /> },
    { slug: 'websearch', label: '联网搜索', icon: <GlobalIcon /> },
    { slug: 'memory', label: '记忆', icon: <Brain size={18} /> },
    { slug: 'api-server', label: 'API 服务', icon: <Server size={18} /> },
    { slug: 'docprocess', label: '文档预处理', icon: <FileCode size={18} /> },
    { slug: 'quickphrase', label: '快捷短语', icon: <Zap size={18} /> },
    { slug: 'shortcut', label: '快捷键', icon: <Command size={18} /> }
  ],
  [
    { slug: 'quickAssistant', label: '悬浮助手', icon: <PictureInPicture2 size={18} /> },
    { slug: 'selectionAssistant', label: '划词助手', icon: <TextCursorInput size={18} /> }
  ],
  [
    { slug: 'about', label: '关于我们', icon: <Info size={18} /> }
  ]
] as const;

export type SettingsSlug = (typeof MENU_GROUPS)[number][number]['slug'];
const SETTINGS_SLUGS = new Set<SettingsSlug>(MENU_GROUPS.flat().map((i) => i.slug));

interface SettingsPageProps {
  initialSlug?: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ initialSlug }) => {
  const initial = useMemo<SettingsSlug>(
    () => (initialSlug && SETTINGS_SLUGS.has(initialSlug as SettingsSlug) ? (initialSlug as SettingsSlug) : 'provider'),
    [initialSlug]
  );
  const [activeSlug, setActiveSlug] = useState<SettingsSlug>(initial);

  useEffect(() => {
    if (initialSlug && SETTINGS_SLUGS.has(initialSlug as SettingsSlug)) {
      setActiveSlug(initialSlug as SettingsSlug);
    }
  }, [initialSlug]);

  return (
    <PageContainer>
      <Navbar />
      <Body>
        <Sidebar>
          <MenuList>
            {MENU_GROUPS.map((group, gi) => (
              <GroupBlock key={gi}>
                {group.map((item) => (
                  <MenuItem
                    key={item.slug}
                    className={item.slug === activeSlug ? 'active' : ''}
                    onClick={() => setActiveSlug(item.slug)}>
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                  </MenuItem>
                ))}
                {gi !== MENU_GROUPS.length - 1 && <MenuSeparator />}
              </GroupBlock>
            ))}
          </MenuList>
        </Sidebar>
        <Content>{renderSection(activeSlug)}</Content>
      </Body>
    </PageContainer>
  );
};

const renderSection = (slug: SettingsSlug) => {
  switch (slug) {
    case 'provider':
      return <ProviderSettingsSection />;
    case 'model':
      return <ModelSection />;
    case 'general':
      return <GeneralSection />;
    case 'display':
      return <DisplaySection />;
    case 'data':
      return <DataSection />;
    case 'mcp':
      return <MCPSection />;
    case 'notes':
      return <NotesSection />;
    case 'websearch':
      return <WebSearchSection />;
    case 'memory':
      return <MemorySection />;
    case 'api-server':
      return <ApiServerSection />;
    case 'docprocess':
      return <DocProcessSection />;
    case 'quickphrase':
      return <QuickPhraseSection />;
    case 'shortcut':
      return <ShortcutSection />;
    case 'quickAssistant':
      return <QuickAssistantSection />;
    case 'selectionAssistant':
      return <SelectionAssistantSection />;
    case 'about':
      return <AboutSection />;
    default:
      return null;
  }
};

const ModelSection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>默认助手模型</SettingTitle>
      <SettingDescription>为所有新建会话指定默认模型，可随时在对话中切换。</SettingDescription>
      <Select
        style={{ width: 260, marginTop: 12 }}
        defaultValue="gpt-4o"
        options={[
          { label: 'GPT-4o', value: 'gpt-4o' },
          { label: 'GPT-4o mini', value: 'gpt-4o-mini' },
          { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' }
        ]}
      />
    </SettingGroup>
    <SettingGroup>
      <SettingTitle>快速模式</SettingTitle>
      <SettingDescription>用于快速问答、悬浮助手等场景的轻量模型。</SettingDescription>
      <Select
        style={{ width: 260, marginTop: 12 }}
        defaultValue="gpt-4o-mini"
        options={[
          { label: 'GPT-4o mini', value: 'gpt-4o-mini' },
          { label: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku' }
        ]}
      />
    </SettingGroup>
    <SettingGroup>
      <SettingTitle>翻译模型</SettingTitle>
      <SettingDescription>支持多语言场景，可自定义翻译提示词。</SettingDescription>
      <Select
        style={{ width: 260, marginTop: 12 }}
        defaultValue="deepseek-v3"
        options={[
          { label: 'DeepSeek V3', value: 'deepseek-v3' },
          { label: 'GPT-4o mini', value: 'gpt-4o-mini-transcribe' }
        ]}
      />
    </SettingGroup>
  </SettingContainer>
);

const GeneralSection = () => {
  // 常规设置
  const [language, setLanguage] = useState('zh-CN');
  const [proxyMode, setProxyMode] = useState<'system' | 'custom' | 'none'>('system');
  const [proxyUrl, setProxyUrl] = useState<string>('');
  const [proxyBypass, setProxyBypass] = useState<string>('');
  const [enableSpellCheck, setEnableSpellCheck] = useState(false);
  const [spellCheckLanguages, setSpellCheckLanguages] = useState<string[]>(['en-US']);
  const [hardwareAccel, setHardwareAccel] = useState(false);

  const confirmHardwareChange = (next: boolean) => {
    Modal.confirm({
      title: '切换硬件加速',
      content: '修改后需要重启应用生效，是否继续？',
      okText: '继续',
      cancelText: '取消',
      onOk: () => setHardwareAccel(next)
    });
  };

  // 通知/启动/托盘/隐私/开发者（UI 占位）
  const [notifyAssistant, setNotifyAssistant] = useState(true);
  const [notifyBackup, setNotifyBackup] = useState(false);
  const [notifyKnowledge, setNotifyKnowledge] = useState(false);
  const [launchOnBoot, setLaunchOnBoot] = useState(false);
  const [launchToTray, setLaunchToTray] = useState(false);
  const [trayShow, setTrayShow] = useState(false);
  const [trayOnClose, setTrayOnClose] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);

  return (
    <SettingContainer>
      {/* 常规设置组：语言、代理、拼写检查、硬件加速（同一组，分割线分隔） */}
      <SettingGroup>
        <SettingTitle>常规设置</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>语言</SettingRowTitle>
          <Select
            value={language}
            onChange={(v) => setLanguage(v)}
            style={{ width: 180 }}
            options={[
              { label: '中文', value: 'zh-CN' },
              { label: 'English', value: 'en-US' },
              { label: '日本語', value: 'ja-JP' }
            ]}
          />
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>代理模式</SettingRowTitle>
          <Select
            value={proxyMode}
            onChange={(m) => setProxyMode(m)}
            style={{ width: 200 }}
            options={[
              { label: '跟随系统', value: 'system' },
              { label: '自定义', value: 'custom' },
              { label: '不使用代理', value: 'none' }
            ]}
          />
        </SettingRow>
        {proxyMode === 'custom' && (
          <>
            <SettingDivider />
            <SettingRow>
              <SettingRowTitle>代理地址</SettingRowTitle>
              <Input
                spellCheck={false}
                placeholder="socks5://127.0.0.1:6153"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                style={{ width: 180 }}
                type="url"
              />
            </SettingRow>
          </>
        )}
        {proxyMode === 'custom' && (
          <>
            <SettingDivider />
            <SettingRow>
              <SettingRowTitle>代理绕过规则</SettingRowTitle>
              <Input
                spellCheck={false}
                placeholder="localhost, 127.0.0.1, *.internal"
                value={proxyBypass}
                onChange={(e) => setProxyBypass(e.target.value)}
                style={{ width: 180 }}
              />
            </SettingRow>
          </>
        )}
        <SettingDivider />
        <SettingRow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, marginRight: 16, justifyContent: 'space-between' }}>
            <SettingRowTitle>拼写检查</SettingRowTitle>
            {enableSpellCheck && (
              <Select
                mode="multiple"
                allowClear
                value={spellCheckLanguages}
                onChange={(arr) => setSpellCheckLanguages(arr)}
                style={{ width: 360 }}
                placeholder="拼写检查语言"
                options={[
                  { label: 'English (US)', value: 'en-US' },
                  { label: 'Español', value: 'es' },
                  { label: 'Français', value: 'fr' },
                  { label: 'Deutsch', value: 'de' },
                  { label: 'Italiano', value: 'it' },
                  { label: 'Português', value: 'pt' },
                  { label: 'Русский', value: 'ru' },
                  { label: 'Nederlands', value: 'nl' },
                  { label: 'Polski', value: 'pl' }
                ]}
              />
            )}
          </div>
          <Switch checked={enableSpellCheck} onChange={(v) => setEnableSpellCheck(v)} />
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>禁用硬件加速</SettingRowTitle>
          <Switch checked={hardwareAccel} onChange={(val) => confirmHardwareChange(val)} />
        </SettingRow>
      </SettingGroup>

      {/* 通知 */}
      <SettingGroup>
        <SettingTitle>通知设置</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>助手消息</SettingRowTitle>
          <Switch checked={notifyAssistant} onChange={setNotifyAssistant} />
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>备份</SettingRowTitle>
          <Switch checked={notifyBackup} onChange={setNotifyBackup} />
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>知识库</SettingRowTitle>
          <Switch checked={notifyKnowledge} onChange={setNotifyKnowledge} />
        </SettingRow>
      </SettingGroup>

      {/* 启动 */}
      <SettingGroup>
        <SettingTitle>启动</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>开机自动启动</SettingRowTitle>
          <Switch checked={launchOnBoot} onChange={setLaunchOnBoot} />
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>启动时最小化到托盘</SettingRowTitle>
          <Switch checked={launchToTray} onChange={setLaunchToTray} />
        </SettingRow>
      </SettingGroup>

      {/* 托盘 */}
      <SettingGroup>
        <SettingTitle>托盘</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>显示托盘图标</SettingRowTitle>
          <Switch checked={trayShow} onChange={setTrayShow} />
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>关闭时最小化到托盘</SettingRowTitle>
          <Switch checked={trayOnClose} onChange={setTrayOnClose} />
        </SettingRow>
      </SettingGroup>

      {/* 隐私 */}
      <SettingGroup>
        <SettingTitle>隐私设置</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>匿名发送错误报告和数据统计</SettingRowTitle>
          <Switch checked={privacyMode} onChange={setPrivacyMode} />
        </SettingRow>
      </SettingGroup>

      {/* 开发者 */}
      <SettingGroup>
        <SettingTitle>开发者模式</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>启用开发者模式</SettingRowTitle>
          <Switch checked={developerMode} onChange={setDeveloperMode} />
        </SettingRow>
      </SettingGroup>
    </SettingContainer>
  );
};

const DisplaySection = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [colorPrimary, setColorPrimary] = useState<string>('#1677ff');
  const [transparentWindow, setTransparentWindow] = useState(false);
  const [navbarPosition, setNavbarPosition] = useState<'left' | 'top'>('left');
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);
  const [userFontFamily, setUserFontFamily] = useState<string>('');
  const [userCodeFontFamily, setUserCodeFontFamily] = useState<string>('');
  const [topicPosition, setTopicPosition] = useState<'left' | 'right'>('right');
  const [clickAssistantToShowTopic, setClickAssistantToShowTopic] = useState(false);
  const [showTopicTime, setShowTopicTime] = useState(false);
  const [pinTopicsToTop, setPinTopicsToTop] = useState(false);
  const [assistantIconType, setAssistantIconType] = useState<'model' | 'emoji' | 'none'>('model');

  const presetColors = ['#1677ff', '#10b981', '#ef4444', '#a855f7', '#f59e0b', '#06b6d4'];
  const fontOptions = ['Inter', 'Arial', 'Roboto Mono', 'Menlo', 'Fira Code'];

  const changeZoom = (delta: number, reset?: boolean) => {
    if (reset) return setCurrentZoom(1.0);
    setCurrentZoom((z) => Math.max(0.5, Math.min(2, +(z + delta).toFixed(2))));
  };

  return (
    <SettingContainer>
      <SettingGroup>
        <SettingTitle>显示设置</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>主题</SettingRowTitle>
          <Segmented
            value={themeMode}
            onChange={(val) => setThemeMode(val as 'light' | 'dark' | 'system')}
            options={[
              { value: 'light', label: (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Sun size={16} />浅色</span>) },
              { value: 'dark', label: (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Moon size={16} />深色</span>) },
              { value: 'system', label: (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Monitor size={16} />系统</span>) }
            ]}
          />
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>主题颜色</SettingRowTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {presetColors.map((c) => (
                <ColorDot key={c} $active={colorPrimary === c} style={{ backgroundColor: c }} onClick={() => setColorPrimary(c)} />
              ))}
            </div>
            <ColorPicker
              value={colorPrimary}
              onChange={(color) => setColorPrimary(color.toHexString())}
              showText
              size="small"
            />
          </div>
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>透明窗口</SettingRowTitle>
          <Switch checked={transparentWindow} onChange={setTransparentWindow} />
        </SettingRow>
      </SettingGroup>

      <SettingGroup>
        <SettingTitle>导航栏设置</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>导航栏位置</SettingRowTitle>
          <Segmented
            value={navbarPosition}
            onChange={(val) => setNavbarPosition(val as 'left' | 'top')}
            options={[
              { label: '左侧', value: 'left' },
              { label: '顶部', value: 'top' }
            ]}
          />
        </SettingRow>
      </SettingGroup>

      <SettingGroup>
        <SettingTitle>缩放设置</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>缩放</SettingRowTitle>
          <ZoomButtonGroup>
            <Button onClick={() => changeZoom(-0.1)} icon={<Minus size={14} />} type="text" />
            <ZoomValue>{Math.round(currentZoom * 100)}%</ZoomValue>
            <Button onClick={() => changeZoom(0.1)} icon={<Plus size={14} />} type="text" />
            <Button onClick={() => changeZoom(0, true)} style={{ marginLeft: 8 }}>重置</Button>
          </ZoomButtonGroup>
        </SettingRow>
      </SettingGroup>

      <SettingGroup>
        <SettingTitle>字体设置</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>全局字体</SettingRowTitle>
          <SelectRow>
            <Select
              style={{ width: 200 }}
              placeholder="选择字体"
              value={userFontFamily}
              onChange={(v) => setUserFontFamily(v)}
              options={[{ label: <span style={{ fontFamily: 'Ubuntu, -apple-system, system-ui, Arial, sans-serif' }}>默认</span>, value: '' }, ...fontOptions.map((f) => ({ label: <span style={{ fontFamily: f }}>{f}</span>, value: f }))]}
              showSearch
            />
            <Button onClick={() => setUserFontFamily('')} style={{ marginLeft: 8 }}>重置</Button>
          </SelectRow>
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>代码字体</SettingRowTitle>
          <SelectRow>
            <Select
              style={{ width: 200 }}
              placeholder="选择字体"
              value={userCodeFontFamily}
              onChange={(v) => setUserCodeFontFamily(v)}
              options={[{ label: <span style={{ fontFamily: 'Ubuntu, -apple-system, system-ui, Arial, sans-serif' }}>默认</span>, value: '' }, ...fontOptions.map((f) => ({ label: <span style={{ fontFamily: f }}>{f}</span>, value: f }))]}
              showSearch
            />
            <Button onClick={() => setUserCodeFontFamily('')} style={{ marginLeft: 8 }}>重置</Button>
          </SelectRow>
        </SettingRow>
      </SettingGroup>

      <SettingGroup>
        <SettingTitle>话题设置</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>话题位置</SettingRowTitle>
          <Segmented
            value={topicPosition}
            onChange={(val) => setTopicPosition(val as 'left' | 'right')}
            options={[
              { value: 'left', label: '左侧' },
              { value: 'right', label: '右侧' }
            ]}
          />
        </SettingRow>
        {topicPosition === 'left' && (
          <>
            <SettingDivider />
            <SettingRow>
              <SettingRowTitle>自动切换到话题</SettingRowTitle>
              <Switch checked={clickAssistantToShowTopic} onChange={setClickAssistantToShowTopic} />
            </SettingRow>
          </>
        )}
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>显示话题时间</SettingRowTitle>
          <Switch checked={showTopicTime} onChange={setShowTopicTime} />
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>固定话题置顶</SettingRowTitle>
          <Switch checked={pinTopicsToTop} onChange={setPinTopicsToTop} />
        </SettingRow>
      </SettingGroup>

      <SettingGroup>
        <SettingTitle>助手设置</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>模型图标类型</SettingRowTitle>
          <Segmented
            value={assistantIconType}
            onChange={(v) => setAssistantIconType(v as 'model' | 'emoji' | 'none')}
            options={[
              { value: 'model', label: '模型图标' },
              { value: 'emoji', label: 'Emoji 表情' },
              { value: 'none', label: '不显示' }
            ]}
          />
        </SettingRow>
      </SettingGroup>

      {navbarPosition === 'left' && (
        <SettingGroup>
          <SettingTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>侧边栏设置</span>
            <div>
              <Button>重置</Button>
            </div>
          </SettingTitle>
          <SettingDivider />
          <SidebarIconsPlaceholder />
        </SettingGroup>
      )}

      <SettingGroup>
        <SettingTitle>
          自定义 CSS
          <TitleExtra as="a" href="https://cherrycss.com/" target="_blank" rel="noreferrer">从 cherrycss.com 获取</TitleExtra>
        </SettingTitle>
        <SettingDivider />
        <Input.TextArea
          rows={18}
          placeholder="/* 这里写自定义 CSS */"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace' }}
        />
      </SettingGroup>
    </SettingContainer>
  );
};

const DataSection = () => {
  const [skipBackupFile, setSkipBackupFile] = useState(false);
  const [cacheSize, setCacheSize] = useState<string>('');
  const [appDataPath] = useState<string>('/Users/you/Library/Application Support/CherryStudio');
  const [logsPath] = useState<string>('/Users/you/Library/Logs/CherryStudio');
  const [subKey, setSubKey] = useState<
    | 'data'
    | 'local_backup'
    | 'webdav'
    | 'nutstore'
    | 's3'
    | 'export_menu'
    | 'markdown_export'
    | 'notion'
    | 'yuque'
    | 'joplin'
    | 'obsidian'
    | 'siyuan'
    | 'agentssubscribe_url'
  >('data');

  const JoplinIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--color-icon)" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.97 0h-8.9a.15.15 0 00-.16.15v2.83c0 .1.08.17.18.17h1.22c.49 0 .89.38.93.86V17.4l-.01.36-.05.29-.04.13a2.06 2.06 0 01-.38.7l-.02.03a2.08 2.08 0 01-.37.34c-.5.35-1.17.5-1.92.43a4.66 4.66 0 01-2.67-1.22 3.96 3.96 0 01-1.34-2.42c-.1-.78.14-1.47.65-1.93l.07-.05c.37-.31.84-.5 1.39-.55a.09.09 0 000 0l.3-.01.35.01h.02a4.39 4.39 0 011.5.44c.15.08.17 0 .18-.06V9.63a.26.26 0 00-.2-.26 7.5 7.5 0 00-6.76 1.61 6.37 6.37 0 00-2.03 5.5 8.18 8.18 0 002.71 5.08A9.35 9.35 0 0011.81 24c1.88 0 3.62-.64 4.9-1.81a6.32 6.32 0 002.06-4.3l.01-10.86V4.08a.95.95 0 01.95-.93h1.22a.17.17 0 00.17-.17V.15a.15.15 0 00-.15-.15z" />
    </svg>
  );

  const SiyuanIcon = () => (
    <svg viewBox="0 0 1024 1024" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <path d="M309.76 148.16a84.8 84.8 0 0 0-10.88 11.84S288 170.24 288 171.2s-6.72 4.8-6.72 6.72-3.52 1.92-2.88 2.88a12.48 12.48 0 0 0-6.4 6.4 121.28 121.28 0 0 0-20.8 19.2 456.64 456.64 0 0 1-37.76 37.12v2.88c0 2.88 0 0 0 0s-3.52 1.92-6.72 5.12c-8.64 9.28-19.84 20.48-28.16 28.16l-7.04 7.04-2.56 2.88a114.88 114.88 0 0 0-20.16 21.76 2.88 2.88 0 0 1-8 8.64l-1.6 1.6a99.52 99.52 0 0 0-19.52 18.88 21.44 21.44 0 0 0-6.4 5.44c-14.08 14.4-22.4 23.04-22.72 23.04l-9.28 8.96-8.96 8.96V887.04c0 1.28 3.2 2.56 6.72-1.92s3.52-3.84 4.16-3.84 0-1.6 0 0S163.84 800 219.84 744.64l38.4-38.08c16-16.32 29.12-29.76 28.8-30.4s6.72-4.16 5.76-5.76 5.44-3.2 5.44-5.12 23.68-23.04 23.04-26.56 0-115.52 0-252.16V138.56a128 128 0 0 0-11.84 10.88z m373.76 2.24a96 96 0 0 0-13.44 15.04s-33.92 32-76.48 74.56l-42.56 42.88L512 320v504.96s5.76-5.12 5.12-5.76a29.44 29.44 0 0 0 8.32-7.68c3.84-4.16 9.92-10.24 13.76-13.76l21.44-21.76 21.76-21.44c18.56-18.24 32-32 32-32l8.96-9.6a69.76 69.76 0 0 1 10.56-9.6s3.84-1.92 3.84-3.52 6.4-4.48 5.76-5.12 3.2-2.56 2.56-3.2 1.6 0 0 0 11.52-10.24 24-22.72l22.72-22.4v-256-251.84c0-0.96 0-2.24-15.36 11.84z" fill="#cdcdcd"></path>
      <path d="M322.24 136h0c-1.6 0 0-0.64 0 0z m2.88 0v504.64l45.12 44.16c37.44 36.8 93.76 92.8 116.48 114.88l14.4 15.04a64 64 0 0 0 10.24 9.6V320l-4.8-4.48c-2.88-2.24-7.68-7.36-11.52-10.88l-42.24-41.92-20.8-21.12-16-14.4a76.48 76.48 0 0 1-7.36-7.04l-23.36-23.68-42.56-44.16c-15.04-15.04-16-16-17.6-14.72z m376 1.92V640l123.84 123.84c98.24 97.92 124.48 123.52 126.4 123.52h2.56V386.56l-124.8-124.8C760 192 704 136.96 704 136.96a3.52 3.52 0 0 0-1.6 2.56z" fill="#707070"></path>
    </svg>
  );

  const leftMenu = [
    { type: 'divider', text: '基础数据设置' },
    { key: 'data', label: '数据目录', icon: <FolderCog size={16} /> },
    { type: 'divider', text: '云备份设置' },
    { key: 'local_backup', label: '本地备份', icon: <FolderCog size={16} /> },
    { key: 'webdav', label: 'WebDAV', icon: <CloudSyncOutlined style={{ fontSize: 16 }} /> },
    { key: 'nutstore', label: '坚果云配置', icon: <span className="iconfont"><svg width="16" height="16" viewBox="0 0 1024 1024"><circle cx="512" cy="512" r="400" fill="currentColor"/></svg></span> },
    { key: 's3', label: 'S3 兼容存储', icon: <CloudServerOutlined style={{ fontSize: 16 }} /> },
    { type: 'divider', text: '导出设置' },
    { key: 'export_menu', label: '导出菜单设置', icon: <FolderInput size={16} /> },
    { key: 'markdown_export', label: 'Markdown 导出', icon: <FileText size={16} /> },
    { type: 'divider', text: '第三方连接' },
    { key: 'notion', label: 'Notion 设置', icon: <span style={{ fontSize: 16 }}>N</span> },
    { key: 'yuque', label: '语雀配置', icon: <YuqueOutlined style={{ fontSize: 16 }} /> },
    { key: 'joplin', label: 'Joplin 配置', icon: <JoplinIcon /> },
    { key: 'obsidian', label: 'Obsidian 配置', icon: <span style={{ fontSize: 16 }}>O</span> },
    { key: 'siyuan', label: '思源笔记配置', icon: <SiyuanIcon /> },
    { key: 'agentssubscribe_url', label: '助手配置', icon: <Sparkle size={16} className="icon" /> }
  ] as const;

  // 本地备份状态
  const [localDir, setLocalDir] = useState<string>('');
  const [localSyncInterval, setLocalSyncInterval] = useState<number>(0);
  const [localMaxBackups, setLocalMaxBackups] = useState<number>(0);
  const [localSkipFiles, setLocalSkipFiles] = useState<boolean>(false);

  // WebDAV 状态
  const [webdavHost, setWebdavHost] = useState<string>('');
  const [webdavUser, setWebdavUser] = useState<string>('');
  const [webdavPass, setWebdavPass] = useState<string>('');
  const [webdavPath, setWebdavPath] = useState<string>('');
  const [webdavSyncInterval, setWebdavSyncInterval] = useState<number>(0);
  const [webdavMaxBackups, setWebdavMaxBackups] = useState<number>(0);
  const [webdavSkipFiles, setWebdavSkipFiles] = useState<boolean>(false);
  const [webdavDisableStream, setWebdavDisableStream] = useState<boolean>(false);

  // S3 状态
  const [s3Endpoint, setS3Endpoint] = useState<string>('');
  const [s3Region, setS3Region] = useState<string>('');
  const [s3Bucket, setS3Bucket] = useState<string>('');
  const [s3AccessKeyId, setS3AccessKeyId] = useState<string>('');
  const [s3SecretAccessKey, setS3SecretAccessKey] = useState<string>('');
  const [s3Root, setS3Root] = useState<string>('');
  const [s3SyncInterval, setS3SyncInterval] = useState<number>(0);
  const [s3MaxBackups, setS3MaxBackups] = useState<number>(0);
  const [s3SkipFiles, setS3SkipFiles] = useState<boolean>(false);

  // 导出菜单
  const [exportMenu, setExportMenu] = useState({
    image: false,
    markdown: true,
    markdown_reason: false,
    notion: false,
    yuque: false,
    joplin: false,
    obsidian: false,
    siyuan: false,
    docx: false,
    plain_text: true
  });

  // Markdown 导出
  const [mdExportPath, setMdExportPath] = useState<string>('');
  const [mdForceDollar, setMdForceDollar] = useState<boolean>(false);
  const [mdUseTopicNaming, setMdUseTopicNaming] = useState<boolean>(false);
  const [mdShowModelName, setMdShowModelName] = useState<boolean>(false);
  const [mdShowProvider, setMdShowProvider] = useState<boolean>(false);
  const [mdExcludeCitations, setMdExcludeCitations] = useState<boolean>(false);
  const [mdStandardizeCitations, setMdStandardizeCitations] = useState<boolean>(false);

  // Notion
  const [notionDb, setNotionDb] = useState<string>('');
  const [notionPageKey, setNotionPageKey] = useState<string>('');
  const [notionApiKey, setNotionApiKey] = useState<string>('');
  const [notionExportReasoning, setNotionExportReasoning] = useState<boolean>(false);

  // 语雀
  const [yuqueUrl, setYuqueUrl] = useState<string>('');
  const [yuqueToken, setYuqueToken] = useState<string>('');

  // Joplin
  const [joplinUrl, setJoplinUrl] = useState<string>('');
  const [joplinToken, setJoplinToken] = useState<string>('');
  const [joplinExportReasoning, setJoplinExportReasoning] = useState<boolean>(false);

  // Obsidian
  const [obsidianVault, setObsidianVault] = useState<string | undefined>(undefined);
  const obsidianVaults = ['Vault A', 'Vault B'];

  // 思源
  const [siyuanApiUrl, setSiyuanApiUrl] = useState<string>('');
  const [siyuanToken, setSiyuanToken] = useState<string>('');
  const [siyuanBoxId, setSiyuanBoxId] = useState<string>('');
  const [siyuanRootPath, setSiyuanRootPath] = useState<string>('');

  // 助手订阅
  const [agentsSubscribeUrl, setAgentsSubscribeUrl] = useState<string>('');

  const intervalOptions = [
    { label: '关闭', value: 0 },
    { label: '每 1 分钟', value: 1 },
    { label: '每 5 分钟', value: 5 },
    { label: '每 15 分钟', value: 15 },
    { label: '每 30 分钟', value: 30 },
    { label: '每 1 小时', value: 60 },
    { label: '每 2 小时', value: 120 },
    { label: '每 6 小时', value: 360 },
    { label: '每 12 小时', value: 720 },
    { label: '每 24 小时', value: 1440 }
  ];

  const maxBackupOptions = [
    { label: '无限制', value: 0 },
    { label: '1', value: 1 },
    { label: '3', value: 3 },
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 }
  ];

  const renderDataContent = () => (
    <>
      <SettingGroup>
        <SettingTitle>数据设置</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>数据备份与恢复</SettingRowTitle>
          <Space>
            <Button icon={<SaveIcon size={14} />}>备份</Button>
            <Button icon={<FolderOpen size={14} />}>恢复</Button>
          </Space>
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>精简备份</SettingRowTitle>
          <Switch checked={skipBackupFile} onChange={setSkipBackupFile} />
        </SettingRow>
        <SettingRow>
          <SettingHelpText>备份时跳过备份图片、知识库等数据文件，仅备份聊天记录和设置。减少空间占用，加快备份速度</SettingHelpText>
        </SettingRow>
      </SettingGroup>

      <SettingGroup>
        <SettingTitle>数据目录</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>应用数据</SettingRowTitle>
          <PathRow>
            <PathText onClick={() => {}}>{appDataPath}</PathText>
            <StyledIcon />
            <Button style={{ marginLeft: 8 }}>修改目录</Button>
          </PathRow>
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>应用日志</SettingRowTitle>
          <PathRow>
            <PathText onClick={() => {}}>{logsPath}</PathText>
            <StyledIcon />
            <Button style={{ marginLeft: 8 }}>打开日志</Button>
          </PathRow>
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>知识库文件</SettingRowTitle>
          <Button>删除文件</Button>
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>
            清除缓存{cacheSize && <CacheText>（{cacheSize}MB）</CacheText>}
          </SettingRowTitle>
          <Button>清除缓存</Button>
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>重置数据</SettingRowTitle>
          <Button danger>重置数据</Button>
        </SettingRow>
      </SettingGroup>
    </>
  );

  const renderEmpty = (title: string) => (
    <SettingGroup>
      <SettingTitle>{title}</SettingTitle>
    </SettingGroup>
  );

  const renderLocalBackup = () => (
    <SettingGroup>
      <SettingTitle>本地备份</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>备份目录</SettingRowTitle>
        <Space>
          <Input value={localDir} onChange={(e) => setLocalDir(e.target.value)} placeholder="请选择备份目录" style={{ width: 320 }} />
          <Button>浏览</Button>
          <Button danger disabled={!localDir} onClick={() => setLocalDir('')}>清除</Button>
        </Space>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>数据备份与恢复</SettingRowTitle>
        <Space>
          <Button icon={<SaveIcon size={14} />} disabled={!localDir}>本地备份</Button>
          <Button icon={<FolderOpen size={14} />} disabled={!localDir}>备份文件管理</Button>
        </Space>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>自动备份</SettingRowTitle>
        <Select value={localSyncInterval} onChange={setLocalSyncInterval} style={{ width: 200 }} options={intervalOptions} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>最大备份数</SettingRowTitle>
        <Select value={localMaxBackups} onChange={setLocalMaxBackups} style={{ width: 160 }} options={maxBackupOptions} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>精简备份</SettingRowTitle>
        <Switch checked={localSkipFiles} onChange={setLocalSkipFiles} />
      </SettingRow>
      <SettingRow>
        <SettingHelpText>备份时跳过备份图片、知识库等数据文件，仅备份聊天记录和设置。减少空间占用，加快备份速度</SettingHelpText>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>备份状态</SettingRowTitle>
        <span style={{ color: 'var(--color-text-3)' }}>{localDir ? '未同步' : '—'}</span>
      </SettingRow>
    </SettingGroup>
  );

  const renderWebdav = () => (
    <SettingGroup>
      <SettingTitle>WebDAV</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>WebDAV 地址</SettingRowTitle>
        <Input value={webdavHost} onChange={(e) => setWebdavHost(e.target.value)} placeholder="http://localhost:8080" style={{ width: 250 }} type="url" />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>WebDAV 用户名</SettingRowTitle>
        <Input value={webdavUser} onChange={(e) => setWebdavUser(e.target.value)} style={{ width: 250 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>WebDAV 密码</SettingRowTitle>
        <Input.Password value={webdavPass} onChange={(e) => setWebdavPass(e.target.value)} style={{ width: 250 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>WebDAV 路径</SettingRowTitle>
        <Input value={webdavPath} onChange={(e) => setWebdavPath(e.target.value)} placeholder="/backup" style={{ width: 250 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>数据备份与恢复</SettingRowTitle>
        <Space>
          <Button icon={<SaveIcon size={14} />}>备份到 WebDAV</Button>
          <Button icon={<FolderOpen size={14} />} disabled={!webdavHost}>从 WebDAV 恢复</Button>
        </Space>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>自动备份</SettingRowTitle>
        <Select value={webdavSyncInterval} onChange={setWebdavSyncInterval} style={{ width: 200 }} options={intervalOptions} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>最大备份数</SettingRowTitle>
        <Select value={webdavMaxBackups} onChange={setWebdavMaxBackups} style={{ width: 160 }} options={maxBackupOptions} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>精简备份</SettingRowTitle>
        <Switch checked={webdavSkipFiles} onChange={setWebdavSkipFiles} />
      </SettingRow>
      <SettingRow>
        <SettingHelpText>备份时跳过备份图片、知识库等数据文件，仅备份聊天记录和设置。减少空间占用，加快备份速度</SettingHelpText>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>禁用流式上传</SettingRowTitle>
        <Switch checked={webdavDisableStream} onChange={setWebdavDisableStream} />
      </SettingRow>
      <SettingRow>
        <SettingHelpText>开启后，将文件加载到内存中再上传，可解决部分WebDAV服务不兼容chunked上传的问题，但会增加内存占用。</SettingHelpText>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>备份状态</SettingRowTitle>
        <span style={{ color: 'var(--color-text-3)' }}>{webdavHost ? '未同步' : '—'}</span>
      </SettingRow>
    </SettingGroup>
  );

  const renderS3 = () => (
    <SettingGroup>
      <SettingTitle style={{ justifyContent: 'flex-start', gap: 10 }}>
        S3 兼容存储
        <span style={{ color: 'var(--color-text-2)', fontSize: 12, cursor: 'help' }}>S3 兼容存储配置文档</span>
      </SettingTitle>
      <SettingHelpText>与AWS S3 API兼容的对象存储服务, 例如AWS S3, Cloudflare R2, 阿里云OSS, 腾讯云COS等</SettingHelpText>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>API 地址</SettingRowTitle>
        <Input value={s3Endpoint} onChange={(e) => setS3Endpoint(e.target.value)} placeholder="https://s3.example.com" style={{ width: 250 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>区域</SettingRowTitle>
        <Input value={s3Region} onChange={(e) => setS3Region(e.target.value)} placeholder="Region, 例如: us-east-1" style={{ width: 250 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>存储桶</SettingRowTitle>
        <Input value={s3Bucket} onChange={(e) => setS3Bucket(e.target.value)} placeholder="Bucket, 例如: example" style={{ width: 250 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>Access Key ID</SettingRowTitle>
        <Input value={s3AccessKeyId} onChange={(e) => setS3AccessKeyId(e.target.value)} placeholder="Access Key ID" style={{ width: 250 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>Secret Access Key</SettingRowTitle>
        <Input.Password value={s3SecretAccessKey} onChange={(e) => setS3SecretAccessKey(e.target.value)} placeholder="Secret Access Key" style={{ width: 250 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>备份目录（可选）</SettingRowTitle>
        <Input value={s3Root} onChange={(e) => setS3Root(e.target.value)} placeholder="例如：/cherry-studio" style={{ width: 250 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>备份操作</SettingRowTitle>
        <Space>
          <Button icon={<SaveIcon size={14} />} disabled={!s3Endpoint || !s3Bucket || !s3AccessKeyId || !s3SecretAccessKey}>立即备份</Button>
          <Button icon={<FolderOpen size={14} />} disabled={!s3Endpoint || !s3Bucket || !s3AccessKeyId || !s3SecretAccessKey}>管理备份</Button>
        </Space>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>自动同步</SettingRowTitle>
        <Select value={s3SyncInterval} onChange={setS3SyncInterval} style={{ width: 200 }} options={intervalOptions} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>最大备份数</SettingRowTitle>
        <Select value={s3MaxBackups} onChange={setS3MaxBackups} style={{ width: 160 }} options={maxBackupOptions} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>精简备份</SettingRowTitle>
        <Switch checked={s3SkipFiles} onChange={setS3SkipFiles} />
      </SettingRow>
      <SettingRow>
        <SettingHelpText>开启后备份时将跳过文件数据，仅备份配置信息，显著减小备份文件体积</SettingHelpText>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>同步状态</SettingRowTitle>
        <span style={{ color: 'var(--color-text-3)' }}>{s3Endpoint ? '未同步' : '—'}</span>
      </SettingRow>
    </SettingGroup>
  );

  const renderExportMenu = () => (
    <SettingGroup>
      <SettingTitle>导出菜单设置</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>导出为图片</SettingRowTitle>
        <Switch checked={exportMenu.image} onChange={(v) => setExportMenu({ ...exportMenu, image: v })} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>导出为 Markdown</SettingRowTitle>
        <Switch checked={exportMenu.markdown} onChange={(v) => setExportMenu({ ...exportMenu, markdown: v })} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>导出推理过程（Markdown）</SettingRowTitle>
        <Switch checked={exportMenu.markdown_reason} onChange={(v) => setExportMenu({ ...exportMenu, markdown_reason: v })} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>Notion</SettingRowTitle>
        <Switch checked={exportMenu.notion} onChange={(v) => setExportMenu({ ...exportMenu, notion: v })} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>语雀</SettingRowTitle>
        <Switch checked={exportMenu.yuque} onChange={(v) => setExportMenu({ ...exportMenu, yuque: v })} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>Joplin</SettingRowTitle>
        <Switch checked={exportMenu.joplin} onChange={(v) => setExportMenu({ ...exportMenu, joplin: v })} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>Obsidian</SettingRowTitle>
        <Switch checked={exportMenu.obsidian} onChange={(v) => setExportMenu({ ...exportMenu, obsidian: v })} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>思源</SettingRowTitle>
        <Switch checked={exportMenu.siyuan} onChange={(v) => setExportMenu({ ...exportMenu, siyuan: v })} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>Docx</SettingRowTitle>
        <Switch checked={exportMenu.docx} onChange={(v) => setExportMenu({ ...exportMenu, docx: v })} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>纯文本</SettingRowTitle>
        <Switch checked={exportMenu.plain_text} onChange={(v) => setExportMenu({ ...exportMenu, plain_text: v })} />
      </SettingRow>
    </SettingGroup>
  );

  const renderMarkdownExport = () => (
    <SettingGroup>
      <SettingTitle>Markdown 导出</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>导出目录</SettingRowTitle>
        <Space style={{ width: 315 }}>
          <Input readOnly value={mdExportPath} style={{ width: 250 }} placeholder="请选择导出目录" />
          <Button icon={<FolderOpen size={14} />}>选择目录</Button>
        </Space>
      </SettingRow>
      <SettingRow>
        <SettingHelpText>导出对话为 Markdown 文件，支持选择自定义目录</SettingHelpText>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>强制 $ 数学公式语法</SettingRowTitle>
        <Switch checked={mdForceDollar} onChange={setMdForceDollar} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>使用话题作为消息标题</SettingRowTitle>
        <Switch checked={mdUseTopicNaming} onChange={setMdUseTopicNaming} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>显示模型名称</SettingRowTitle>
        <Switch checked={mdShowModelName} onChange={setMdShowModelName} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>显示服务商名称</SettingRowTitle>
        <Switch checked={mdShowProvider} onChange={setMdShowProvider} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>导出时排除引用（Citations）</SettingRowTitle>
        <Switch checked={mdExcludeCitations} onChange={setMdExcludeCitations} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>规范化引用（Citations）</SettingRowTitle>
        <Switch checked={mdStandardizeCitations} onChange={setMdStandardizeCitations} />
      </SettingRow>
    </SettingGroup>
  );

  const renderNotion = () => (
    <SettingGroup>
      <SettingTitle>Notion 设置</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>数据库 ID</SettingRowTitle>
        <Input value={notionDb} onChange={(e) => setNotionDb(e.target.value)} placeholder="请输入 Notion 数据库 ID" style={{ width: 315 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>页面名称字段</SettingRowTitle>
        <Input value={notionPageKey} onChange={(e) => setNotionPageKey(e.target.value)} placeholder="例如：title" style={{ width: 315 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>API Key</SettingRowTitle>
        <Space.Compact style={{ width: 315 }}>
          <Input.Password value={notionApiKey} onChange={(e) => setNotionApiKey(e.target.value)} placeholder="请输入 Notion API Key" style={{ width: '100%' }} />
          <Button>检测</Button>
        </Space.Compact>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>导出推理过程</SettingRowTitle>
        <Switch checked={notionExportReasoning} onChange={setNotionExportReasoning} />
      </SettingRow>
    </SettingGroup>
  );

  const renderYuque = () => (
    <SettingGroup>
      <SettingTitle>语雀配置</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>知识库 URL</SettingRowTitle>
        <Input value={yuqueUrl} onChange={(e) => setYuqueUrl(e.target.value)} placeholder="https://www.yuque.com/组织/知识库" style={{ width: 315 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>
          访问令牌
        </SettingRowTitle>
        <Space.Compact style={{ width: 315 }}>
          <Input.Password value={yuqueToken} onChange={(e) => setYuqueToken(e.target.value)} placeholder="请输入语雀访问令牌" style={{ width: '100%' }} />
          <Button>检测</Button>
        </Space.Compact>
      </SettingRow>
    </SettingGroup>
  );

  const renderJoplin = () => (
    <SettingGroup>
      <SettingTitle>Joplin 配置</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>服务地址</SettingRowTitle>
        <Input value={joplinUrl} onChange={(e) => setJoplinUrl(e.target.value)} onBlur={(e) => !e.target.value.endsWith('/') && setJoplinUrl(e.target.value + '/')} placeholder="http://127.0.0.1:41184/" style={{ width: 315 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>访问令牌</SettingRowTitle>
        <Space.Compact style={{ width: 315 }}>
          <Input.Password value={joplinToken} onChange={(e) => setJoplinToken(e.target.value)} placeholder="Joplin Clipper Token" style={{ width: '100%' }} />
          <Button>检测</Button>
        </Space.Compact>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>导出推理过程</SettingRowTitle>
        <Switch checked={joplinExportReasoning} onChange={setJoplinExportReasoning} />
      </SettingRow>
    </SettingGroup>
  );

  const renderObsidian = () => (
    <SettingGroup>
      <SettingTitle>Obsidian 配置</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>默认 Obsidian 仓库</SettingRowTitle>
        <Select value={obsidianVault} onChange={setObsidianVault} placeholder="请选择默认 Obsidian 仓库" style={{ width: 300 }} options={obsidianVaults.map((v) => ({ label: v, value: v }))} />
      </SettingRow>
    </SettingGroup>
  );

  const renderSiyuan = () => (
    <SettingGroup>
      <SettingTitle>思源笔记配置</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>API 地址</SettingRowTitle>
        <Input value={siyuanApiUrl} onChange={(e) => setSiyuanApiUrl(e.target.value)} placeholder="例如：http://127.0.0.1:6806" style={{ width: 315 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>API 令牌</SettingRowTitle>
        <Space.Compact style={{ width: 315 }}>
          <Input.Password value={siyuanToken} onChange={(e) => setSiyuanToken(e.target.value)} placeholder="请输入思源笔记令牌" style={{ width: '100%' }} />
          <Button>检测</Button>
        </Space.Compact>
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>笔记本 ID</SettingRowTitle>
        <Input value={siyuanBoxId} onChange={(e) => setSiyuanBoxId(e.target.value)} placeholder="请输入笔记本 ID" style={{ width: 315 }} />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>文档根路径</SettingRowTitle>
        <Input value={siyuanRootPath} onChange={(e) => setSiyuanRootPath(e.target.value)} placeholder="例如：/CherryStudio" style={{ width: 315 }} />
      </SettingRow>
    </SettingGroup>
  );

  const renderAgents = () => (
    <SettingGroup>
      <SettingTitle>助手配置</SettingTitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitle>订阅源地址</SettingRowTitle>
        <Input value={agentsSubscribeUrl} onChange={(e) => setAgentsSubscribeUrl(e.target.value)} placeholder="输入订阅源 URL" style={{ width: 315 }} />
      </SettingRow>
    </SettingGroup>
  );

  const renderContent = () => {
    switch (subKey) {
      case 'data':
        return renderDataContent();
      case 'local_backup':
        return renderLocalBackup();
      case 'webdav':
        return renderWebdav();
      case 'nutstore':
        return renderEmpty('坚果云配置');
      case 's3':
        return renderS3();
      case 'export_menu':
        return renderExportMenu();
      case 'markdown_export':
        return renderMarkdownExport();
      case 'notion':
        return renderNotion();
      case 'yuque':
        return renderYuque();
      case 'joplin':
        return renderJoplin();
      case 'obsidian':
        return renderObsidian();
      case 'siyuan':
        return renderSiyuan();
      case 'agentssubscribe_url':
        return renderAgents();
      default:
        return null;
    }
  };

  return (
    <DataLayout>
      <DataMenu>
        {leftMenu.map((item, idx) =>
          'type' in item && item.type === 'divider' ? (
            <MenuDividerLabel key={`div-${idx}`}>{item.text}</MenuDividerLabel>
          ) : (
            <DataMenuItem
              key={(item as any).key}
              className={subKey === (item as any).key ? 'active' : ''}
              onClick={() => setSubKey((item as any).key)}>
              <span className="icon">{(item as any).icon}</span>
              <span className="label">{(item as any).label}</span>
            </DataMenuItem>
          )
        )}
      </DataMenu>
      <SettingContainer style={{ display: 'flex', flex: 1, height: '100%' }}>{renderContent()}</SettingContainer>
    </DataLayout>
  );
};

const MCPSection = () => {
  type ServerType = 'stdio' | 'sse' | 'streamableHttp' | 'inMemory';
  type McpServer = {
    id: string;
    name: string;
    description?: string;
    type: ServerType;
    isActive: boolean;
    baseUrl?: string;
    command?: string;
    version?: string | null;
  };

  const [mode, setMode] = useState<'list' | 'detail' | 'npx' | 'install'>('list');
  const [search, setSearch] = useState('');
  const [servers, setServers] = useState<McpServer[]>([
    {
      id: 'local-files',
      name: 'Local Files',
      description: '访问本地文件系统的示例服务器',
      type: 'stdio',
      isActive: true,
      command: 'uvx mcp-localfs',
      version: '1.0.0'
    },
    {
      id: 'browser-chrome',
      name: 'Chrome Browser',
      description: '通过 Chrome 自动化提供网页操作能力',
      type: 'sse',
      isActive: false,
      baseUrl: 'http://localhost:3030/mcp'
    }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!kw.length) return servers;
    return servers.filter((s) => kw.some((k) => `${s.name} ${s.description ?? ''}`.toLowerCase().includes(k)));
  }, [servers, search]);

  const selected = useMemo(() => servers.find((s) => s.id === selectedId) || null, [servers, selectedId]);

  const addNewServer = () => {
    const id = `server-${Date.now()}`;
    const next: McpServer = {
      id,
      name: '新建 MCP 服务器',
      description: '',
      type: 'stdio',
      isActive: false
    };
    setServers((prev) => [next, ...prev]);
    setSelectedId(id);
    setMode('detail');
  };

  const deleteServer = (id: string) => {
    setServers((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const toggleServer = (id: string, active: boolean) => {
    setServers((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: active, version: active ? s.version ?? '1.0.0' : null } : s)));
  };

  const menuItems = [
    { key: 'manual', label: '手动创建', onClick: addNewServer },
    { key: 'json', label: '从 JSON 导入', onClick: () => setMode('list') },
    { key: 'dxt', label: '从 DXT 导入', onClick: () => setMode('list') }
  ];

  if (mode !== 'detail') {
    return (
      <SettingContainer $noPadding>
        <McpHeader>
          <SettingTitle style={{ gap: 8 }}>
            <span>新建 MCP 服务器</span>
            <Input
              allowClear
              size="small"
              placeholder="搜索 MCP 服务器"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
            />
          </SettingTitle>
          <div className="actions">
            <Button size="small" onClick={() => setMode('install')}>安装 npx/uv</Button>
            <Button size="small" onClick={() => { /* 打开 JSON 编辑 */ }}>编辑</Button>
            <Dropdown menu={{ items: menuItems }} trigger={[ 'click' ]}>
              <Button size="small">添加</Button>
            </Dropdown>
            <Button size="small">同步</Button>
          </div>
        </McpHeader>
        <ServerList>
          {filtered.map((s) => (
            <ServerCard key={s.id}>
              <div className="meta">
                <div className="title">
                  <span>{s.name}</span>
                  {s.isActive && s.version && (
                    <Tag color="#8c8c8c" style={{ marginLeft: 8 }}>{s.version}</Tag>
                  )}
                </div>
                {s.description && <div className="desc">{s.description}</div>}
              </div>
              <div className="ops">
                <Switch checked={s.isActive} onChange={(v) => toggleServer(s.id, v)} />
                <Button type="text" size="small" onClick={() => { setSelectedId(s.id); setMode('detail'); }}>编辑</Button>
                <Button type="text" size="small" danger onClick={() => deleteServer(s.id)}>删除</Button>
              </div>
            </ServerCard>
          ))}
          {filtered.length === 0 && <EmptyHint>暂无服务器</EmptyHint>}
        </ServerList>

        <SettingGroup>
          <SettingTitle>MCP 市场</SettingTitle>
        </SettingGroup>
        <SettingGroup>
          <SettingTitle>内置 MCP 服务</SettingTitle>
        </SettingGroup>
      </SettingContainer>
    );
  }

  // Detail page
  if (!selected) return null;

  const [activeTab] = [ 'settings' ];

  return (
    <SettingContainer style={{ paddingTop: 10 }}>
      <SettingGroup>
        <SettingTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button size="small" onClick={() => setMode('list')}>返回</Button>
            <span style={{ fontWeight: 600 }}>{selected.name}</span>
            {selected.isActive && selected.version && <Tag color="#8c8c8c">{selected.version}</Tag>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Switch checked={selected.isActive} onChange={(v) => toggleServer(selected.id, v)} />
            <Button type="primary" size="small">保存</Button>
          </div>
        </SettingTitle>
        <SettingDivider />
        <Tabs
          defaultActiveKey={activeTab}
          items={[{ key: 'settings', label: '设置', children: <McpSettingsForm server={selected} onChange={(srv) => setServers((prev) => prev.map((s) => (s.id === srv.id ? srv : s)))} /> }]}
        />
      </SettingGroup>
    </SettingContainer>
  );
};

interface McpSettingsFormProps {
  server: { id: string; name: string; type: 'stdio' | 'sse' | 'streamableHttp' | 'inMemory'; baseUrl?: string; command?: string };
  onChange: (next: any) => void;
}

const McpSettingsForm: React.FC<McpSettingsFormProps> = ({ server, onChange }) => {
  const [serverType, setServerType] = useState(server.type);
  const [name, setName] = useState(server.name);
  const [description, setDescription] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState(server.baseUrl || '');
  const [command, setCommand] = useState(server.command || '');
  const [args, setArgs] = useState('');
  const [env, setEnv] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    onChange({ ...server, name, type: serverType, baseUrl, command });
  }, [name, serverType, baseUrl, command]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <RowItem label="名称">
        <Input value={name} onChange={(e) => setName(e.target.value)} style={{ width: 260 }} />
      </RowItem>
      <RowItem label="描述">
        <Input value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: 420 }} />
      </RowItem>
      <RowItem label="类型">
        <Select
          value={serverType}
          onChange={(v) => setServerType(v)}
          options={[
            { label: 'stdio', value: 'stdio' },
            { label: 'sse', value: 'sse' },
            { label: 'streamableHttp', value: 'streamableHttp' }
          ]}
          style={{ width: 220 }}
        />
      </RowItem>
      {serverType === 'sse' && (
        <>
          <RowItem label="URL">
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://localhost:3000/sse" style={{ width: 420 }} />
          </RowItem>
          <RowItem label="请求头">
            <Input.TextArea rows={3} placeholder={`Content-Type=application/json\nAuthorization=Bearer token`} style={{ width: 420, fontFamily: 'monospace' }} />
          </RowItem>
        </>
      )}
      {serverType === 'streamableHttp' && (
        <>
          <RowItem label="URL">
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://localhost:3000/mcp" style={{ width: 420 }} />
          </RowItem>
          <RowItem label="请求头">
            <Input.TextArea rows={3} placeholder={`Content-Type=application/json\nAuthorization=Bearer token`} style={{ width: 420, fontFamily: 'monospace' }} />
          </RowItem>
        </>
      )}
      {serverType === 'stdio' && (
        <>
          <RowItem label="命令">
            <Input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="uvx 或 npx" style={{ width: 420 }} />
          </RowItem>
          <RowItem label="参数">
            <Input.TextArea rows={3} value={args} onChange={(e) => setArgs(e.target.value)} placeholder={`arg1\narg2`} style={{ width: 420, fontFamily: 'monospace' }} />
          </RowItem>
          <RowItem label="环境变量">
            <Input.TextArea rows={3} value={env} onChange={(e) => setEnv(e.target.value)} placeholder={`KEY1=value1\nKEY2=value2`} style={{ width: 420, fontFamily: 'monospace' }} />
          </RowItem>
        </>
      )}
      <div>
        <Button type="link" onClick={() => setShowAdvanced((v) => !v)} style={{ padding: 0 }}>高级设置</Button>
      </div>
      {showAdvanced && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <RowItem label="Provider"><Input placeholder="Provider" style={{ width: 260 }} /></RowItem>
          <RowItem label="Provider URL"><Input placeholder="https://provider-website.com" style={{ width: 420 }} /></RowItem>
          <RowItem label="Logo URL"><Input placeholder="https://example.com/logo.png" style={{ width: 420 }} /></RowItem>
          <RowItem label="标签"><Select mode="tags" style={{ width: 420 }} placeholder="输入标签" /></RowItem>
          <RowItem label="长运行"><Switch size="small" /></RowItem>
          <RowItem label="超时"><Input type="number" placeholder="60" addonAfter="s" style={{ width: 160 }} /></RowItem>
        </div>
      )}
    </div>
  );
};

const RowItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--color-border)' }}>
    <SettingRowTitle>{label}</SettingRowTitle>
    {children}
  </div>
);

const McpHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
`;

const ServerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 18px 18px;
`;

const ServerCard = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 0.5px solid var(--color-border);
  border-radius: var(--list-item-border-radius);
  background: var(--color-background);

  .meta .title { font-weight: 600; }
  .meta .desc { color: var(--color-text-3); font-size: 12px; margin-top: 4px; }
  .ops { display: flex; align-items: center; gap: 8px; }
`;

const EmptyHint = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--color-text-3);
`;

const NotesSection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>笔记同步</SettingTitle>
      <SettingRow>
        <SettingRowTitle>Notion 同步</SettingRowTitle>
        <Switch defaultChecked />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>思源笔记</SettingRowTitle>
        <Switch />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>Obsidian</SettingRowTitle>
        <Switch />
      </SettingRow>
    </SettingGroup>
  </SettingContainer>
);

const WebSearchSection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>联网搜索</SettingTitle>
      <SettingRow>
        <SettingRowTitle>Tavily</SettingRowTitle>
        <Switch defaultChecked />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>Serper</SettingRowTitle>
        <Switch defaultChecked />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>Exa.ai</SettingRowTitle>
        <Switch />
      </SettingRow>
    </SettingGroup>
  </SettingContainer>
);

const MemorySection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>全局记忆</SettingTitle>
      <SettingDescription>提取对话中的关键信息，为后续会话提供上下文。</SettingDescription>
      <SettingRow>
        <SettingRowTitle>自动更新</SettingRowTitle>
        <Switch defaultChecked />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>定期清理</SettingRowTitle>
        <Switch />
      </SettingRow>
    </SettingGroup>
  </SettingContainer>
);

const ApiServerSection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>内置 API Server</SettingTitle>
      <SettingDescription>将 Cherry Studio 暴露为 OpenAI 兼容接口。</SettingDescription>
      <SettingRow>
        <SettingRowTitle>监听地址</SettingRowTitle>
        <Input defaultValue="http://127.0.0.1:3001" style={{ width: 260 }} />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>并发上限</SettingRowTitle>
        <Input type="number" defaultValue={16} style={{ width: 120 }} />
      </SettingRow>
    </SettingGroup>
  </SettingContainer>
);

const DocProcessSection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>预处理流程</SettingTitle>
      <SettingDescription>上传文档后自动拆分段落并提取标题。</SettingDescription>
      <SettingRow>
        <SettingRowTitle>启用 Markdown 优化</SettingRowTitle>
        <Switch defaultChecked />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>检测重复段落</SettingRowTitle>
        <Switch />
      </SettingRow>
    </SettingGroup>
    <SettingGroup>
      <SettingTitle>OCR 识别</SettingTitle>
      <SettingRow>
        <SettingRowTitle>内置引擎</SettingRowTitle>
        <Switch defaultChecked />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>Paddle OCR</SettingRowTitle>
        <Switch />
      </SettingRow>
    </SettingGroup>
  </SettingContainer>
);

const QuickPhraseSection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>快捷短语</SettingTitle>
      <SettingDescription>在输入框中快速插入常用指令。</SettingDescription>
      <SettingRow>
        <SettingRowTitle>启用推荐</SettingRowTitle>
        <Switch defaultChecked />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>短语同步</SettingRowTitle>
        <Switch />
      </SettingRow>
    </SettingGroup>
  </SettingContainer>
);

const ShortcutSection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>快捷键</SettingTitle>
      <SettingRow>
        <SettingRowTitle>打开悬浮窗</SettingRowTitle>
        <Input defaultValue="⌥ Space" style={{ width: 160 }} />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>搜索历史对话</SettingRowTitle>
        <Input defaultValue="⌘ K" style={{ width: 160 }} />
      </SettingRow>
    </SettingGroup>
  </SettingContainer>
);

const QuickAssistantSection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>悬浮助手</SettingTitle>
      <SettingDescription>在桌面上显示轻量问答窗口。</SettingDescription>
      <SettingRow>
        <SettingRowTitle>默认模型</SettingRowTitle>
        <Select
          defaultValue="gpt-4o-mini"
          style={{ width: 200 }}
          options={[
            { label: 'GPT-4o mini', value: 'gpt-4o-mini' },
            { label: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku' }
          ]}
        />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>自动贴边</SettingRowTitle>
        <Switch defaultChecked />
      </SettingRow>
    </SettingGroup>
  </SettingContainer>
);

const SelectionAssistantSection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>划词助手</SettingTitle>
      <SettingDescription>选中文本后自动弹出快速菜单。</SettingDescription>
      <SettingRow>
        <SettingRowTitle>自动显示</SettingRowTitle>
        <Switch defaultChecked />
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>最小字符数</SettingRowTitle>
        <Input type="number" defaultValue={6} style={{ width: 120 }} />
      </SettingRow>
    </SettingGroup>
  </SettingContainer>
);

const AboutSection = () => (
  <SettingContainer>
    <SettingGroup>
      <SettingTitle>关于 Cherry Studio</SettingTitle>
      <SettingDescription>企业级多模态智能体工作台，支持多服务商协同。</SettingDescription>
      <SettingRow>
        <SettingRowTitle>版本</SettingRowTitle>
        <span>v2.5.0-beta</span>
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>更新日期</SettingRowTitle>
        <span>2024-08-12</span>
      </SettingRow>
      <SettingRow>
        <SettingRowTitle>许可证</SettingRowTitle>
        <span>AGPL-3.0</span>
      </SettingRow>
    </SettingGroup>
  </SettingContainer>
);



const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const Sidebar = styled.div`
  width: 240px;
  border-right: 0.5px solid var(--color-border);
  padding: 12px;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const MenuList = styled(Scrollbar)`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;
`;

const GroupBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MenuSeparator = styled.div`
  height: 1px;
  background: var(--color-border);
  opacity: 0.6;
  margin: 6px 0;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  width: 100%;
  border: 0.5px solid transparent;
  border-radius: var(--list-item-border-radius);
  background: transparent;
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  .icon {
    display: flex;
    align-items: center;
  }

  &:hover {
    background: var(--color-background-soft);
  }

  &.active {
    background: var(--color-background-soft);
    border-color: var(--color-border);
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  background: var(--color-background-soft);
  display: flex;
`;

export default SettingsPage;

const StyledIcon = styled(FileSearchOutlined)`
  color: var(--color-text-2);
  cursor: pointer;
`;

const PathText = styled(Typography.Text)`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  text-align: right;
  margin-left: 5px;
  cursor: pointer;
`;

const PathRow = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  width: 0;
  align-items: center;
  gap: 5px;
`;

const CacheText = styled(Typography.Text)`
  color: var(--color-text-3);
  font-size: 12px;
  margin-left: 6px;
`;

const ColorDot = styled.span<{ $active?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${({ $active }) => ($active ? 'var(--color-border)' : 'transparent')};
  cursor: pointer;
  display: inline-block;
`;

const ZoomButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 210px;
`;

const ZoomValue = styled.span`
  width: 40px;
  text-align: center;
  margin: 0 5px;
`;

const SelectRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 300px;
`;

const TitleExtra = styled.span`
  font-size: 12px;
  margin-left: 8px;
  text-decoration: underline;
  cursor: pointer;
  opacity: 0.8;
`;

const SidebarIconsPlaceholder = styled.div`
  border: 0.5px solid var(--color-border);
  border-radius: var(--list-item-border-radius);
  min-height: 120px;
  background: var(--color-background);
`;

const DataLayout = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
`;

const DataMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: var(--settings-width);
  padding: 12px;
  padding-bottom: 48px;
  border-right: 0.5px solid var(--color-border);
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
`;

const MenuDividerLabel = styled.div`
  color: var(--color-text-3);
  font-size: 12px;
  padding: 8px 6px 6px;
`;

const DataMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  width: 100%;
  cursor: pointer;
  border-radius: var(--list-item-border-radius);
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border: 0.5px solid transparent;
  background: transparent;
  color: var(--color-text);

  &:hover {
    background: var(--color-background-soft);
  }
  &.active {
    background: var(--color-background-soft);
    border: 0.5px solid var(--color-border);
  }
`;
