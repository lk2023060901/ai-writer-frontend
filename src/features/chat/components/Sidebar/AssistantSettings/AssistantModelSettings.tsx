'use client';

import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Slider,
  Switch,
  Tooltip
} from 'antd';
import { Check, PlusIcon, RotateCcw, Trash2 } from 'lucide-react';
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import EditableNumber from '../EditableNumber';
import { HStack } from '@/shared/ui/layout/primitives';
import Selector from '@/shared/ui/inputs/SegmentedSelector';
import { useTimer } from '@/shared/hooks/useTimer';
import { modalConfirm } from '@/shared/utils/modal';
import {
  Assistant,
  AssistantCustomParameter,
  AssistantModel,
  AssistantSettings,
  mockAssistants
} from '@/features/chat/hooks/useMockData';

import { SettingRow } from '.';

const DEFAULT_TEMPERATURE = 1;
const DEFAULT_CONTEXT_COUNT = 10;
const DEFAULT_TOP_P = 1;
const MAX_CONTEXT_COUNT = 100;

const PRESET_MODELS: AssistantModel[] = [
  { name: 'gpt-4o', provider: 'openai' },
  { name: 'gpt-4o-mini', provider: 'openai' },
  { name: 'claude-3-haiku', provider: 'anthropic' },
  { name: 'claude-3-opus', provider: 'anthropic' },
  { name: 'kimi-k2', provider: 'moonshot' },
  { name: 'moonshot-v1-32k', provider: 'moonshot' }
];

type CustomParameter = AssistantCustomParameter;

type Props = {
  assistant: Assistant;
  updateAssistant: (updates: Partial<Assistant>) => void;
  updateAssistantSettings: (updates: Partial<AssistantSettings>) => void;
  updateCustomParameters: (updater: (params: CustomParameter[]) => CustomParameter[]) => void;
};

const AssistantModelSettings: FC<Props> = ({
  assistant,
  updateAssistant,
  updateAssistantSettings,
  updateCustomParameters
}) => {
  const { t } = useTranslation();
  const { setTimeoutTimer } = useTimer();
  const settings = assistant.settings;

  const [temperature, setTemperature] = useState<number>(settings?.temperature ?? DEFAULT_TEMPERATURE);
  const [contextCount, setContextCount] = useState<number>(settings?.contextCount ?? DEFAULT_CONTEXT_COUNT);
  const [enableMaxTokens, setEnableMaxTokens] = useState<boolean>(settings?.enableMaxTokens ?? false);
  const [maxTokens, setMaxTokens] = useState<number>(settings?.maxTokens ?? 0);
  const [streamOutput, setStreamOutput] = useState<boolean>(settings?.streamOutput ?? true);
  const [toolUseMode, setToolUseMode] = useState<AssistantSettings['toolUseMode']>(
    settings?.toolUseMode ?? 'prompt'
  );
  const [defaultModel, setDefaultModel] = useState<AssistantModel | undefined>(
    assistant.model ?? assistant.defaultModel
  );
  const [topP, setTopP] = useState<number>(settings?.topP ?? DEFAULT_TOP_P);
  const [enableTopP, setEnableTopP] = useState<boolean>(settings?.enableTopP ?? false);
  const [customParameters, setCustomParameters] = useState<CustomParameter[]>(
    settings?.customParameters ?? []
  );
  const [enableTemperature, setEnableTemperature] = useState<boolean>(settings?.enableTemperature ?? true);
  const [isModelModalOpen, setModelModalOpen] = useState(false);

  const {
    temperature: settingsTemperature = DEFAULT_TEMPERATURE,
    contextCount: settingsContextCount = DEFAULT_CONTEXT_COUNT,
    enableMaxTokens: settingsEnableMaxTokens = false,
    maxTokens: settingsMaxTokens = 0,
    streamOutput: settingsStreamOutput = true,
    topP: settingsTopP = DEFAULT_TOP_P,
    enableTopP: settingsEnableTopP = false,
    enableTemperature: settingsEnableTemperature = true,
    toolUseMode: settingsToolUseMode = 'prompt',
    customParameters: settingsCustomParameters = []
  } = settings ?? ({} as AssistantSettings);

  const defaultModelFromAssistant = assistant.model ?? assistant.defaultModel;
  const defaultModelKey = defaultModelFromAssistant ? buildModelId(defaultModelFromAssistant) : '';
  const customParametersSignature = useMemo(
    () => JSON.stringify(settingsCustomParameters),
    [settingsCustomParameters]
  );

  useEffect(() => {
    setTemperature((prev) => (prev !== settingsTemperature ? settingsTemperature : prev));
    setContextCount((prev) => (prev !== settingsContextCount ? settingsContextCount : prev));
    setEnableMaxTokens((prev) => (prev !== settingsEnableMaxTokens ? settingsEnableMaxTokens : prev));
    setMaxTokens((prev) => (prev !== settingsMaxTokens ? settingsMaxTokens : prev));
    setStreamOutput((prev) => (prev !== settingsStreamOutput ? settingsStreamOutput : prev));
    setTopP((prev) => (prev !== settingsTopP ? settingsTopP : prev));
    setEnableTopP((prev) => (prev !== settingsEnableTopP ? settingsEnableTopP : prev));
    setEnableTemperature((prev) => (prev !== settingsEnableTemperature ? settingsEnableTemperature : prev));
    setToolUseMode((prev) => (prev !== settingsToolUseMode ? settingsToolUseMode : prev));

    setDefaultModel((prev) => {
      if (!defaultModelFromAssistant) {
        return prev ? undefined : prev;
      }
      const prevKey = prev ? buildModelId(prev) : '';
      return prevKey === defaultModelKey ? prev : defaultModelFromAssistant;
    });

    setCustomParameters((prev) =>
      areCustomParametersEqual(prev, settingsCustomParameters) ? prev : settingsCustomParameters
    );
  }, [
    assistant.id,
    settingsTemperature,
    settingsContextCount,
    settingsEnableMaxTokens,
    settingsMaxTokens,
    settingsStreamOutput,
    settingsTopP,
    settingsEnableTopP,
    settingsEnableTemperature,
    settingsToolUseMode,
    defaultModelFromAssistant,
    defaultModelKey,
    settingsCustomParameters,
    customParametersSignature
  ]);

  const availableModels = useMemo(() => {
    const map = new Map<string, AssistantModel>();
    const addModel = (model?: AssistantModel) => {
      if (!model) return;
      const id = buildModelId(model);
      if (!map.has(id)) {
        map.set(id, model);
      }
    };

    mockAssistants.forEach((item) => {
      addModel(item.model);
      addModel(item.defaultModel);
    });

    PRESET_MODELS.forEach(addModel);
    addModel(assistant.model);
    addModel(assistant.defaultModel);

    return Array.from(map.values());
  }, [assistant]);

  const modelOptions = useMemo(
    () =>
      availableModels.map((model) => ({
        id: buildModelId(model),
        model,
        label: (
          <ModelOption>
            <ModelBadge>{getModelInitial(model)}</ModelBadge>
            <ModelMeta>
              <ModelNameText>{model.name}</ModelNameText>
              <ModelProviderText>{model.provider}</ModelProviderText>
            </ModelMeta>
          </ModelOption>
        )
      })),
    [availableModels]
  );

  const selectedModelId = defaultModel ? buildModelId(defaultModel) : undefined;

  const handleModelChange = useCallback(
    (model: AssistantModel) => {
      setDefaultModel(model);
      updateAssistant({ model, defaultModel: model });
      if (model.name.includes('kimi-k2')) {
        setTemperature(0.6);
        setTimeoutTimer('temperature_auto_kimi', () => updateAssistantSettings({ temperature: 0.6 }), 300);
      } else if (model.name.includes('moonshot')) {
        setTemperature(0.3);
        setTimeoutTimer('temperature_auto_moonshot', () => updateAssistantSettings({ temperature: 0.3 }), 300);
      }
    },
    [setTimeoutTimer, updateAssistant, updateAssistantSettings]
  );

  const onAddCustomParameter = () => {
    const next = [...customParameters, { name: '', value: '', type: 'string' as const }];
    commitCustomParameters(next);
  };

  const commitCustomParameters = (next: CustomParameter[]) => {
    setCustomParameters(next);
    updateCustomParameters(() => next);
    updateAssistantSettings({ customParameters: next });
  };

  const onUpdateCustomParameter = (
    index: number,
    field: 'name' | 'value' | 'type',
    value: string | number | boolean | Record<string, unknown>
  ) => {
    const next = [...customParameters];
    if (!next[index]) return;

    if (field === 'type') {
      const typeValue = value as CustomParameter['type'];
      next[index] = {
        ...next[index],
        type: typeValue,
        value: getDefaultValueByType(typeValue)
      };
    } else {
      next[index] = {
        ...next[index],
        [field]: value
      } as CustomParameter;
    }

    commitCustomParameters(next);
  };

  const onDeleteCustomParameter = (index: number) => {
    const next = customParameters.filter((_, i) => i !== index);
    commitCustomParameters(next);
  };

  const onReset = () => {
    setTemperature(DEFAULT_TEMPERATURE);
    setEnableTemperature(true);
    setContextCount(DEFAULT_CONTEXT_COUNT);
    setEnableMaxTokens(false);
    setMaxTokens(0);
    setStreamOutput(true);
    setTopP(DEFAULT_TOP_P);
    setEnableTopP(false);
    setToolUseMode('prompt');
    commitCustomParameters([]);
    updateAssistantSettings({
      temperature: DEFAULT_TEMPERATURE,
      enableTemperature: true,
      contextCount: DEFAULT_CONTEXT_COUNT,
      enableMaxTokens: false,
      maxTokens: 0,
      streamOutput: true,
      topP: DEFAULT_TOP_P,
      enableTopP: false,
      toolUseMode: 'prompt'
    });
  };

  const renderParameterValueInput = (param: CustomParameter, index: number): ReactNode => {
    switch (param.type) {
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            value={typeof param.value === 'number' ? param.value : 0}
            step={0.01}
            onChange={(value) => onUpdateCustomParameter(index, 'value', typeof value === 'number' ? value : 0)}
          />
        );
      case 'boolean':
        return (
          <Select
            style={{ width: '100%' }}
            value={Boolean(param.value)}
            onChange={(value: boolean) => onUpdateCustomParameter(index, 'value', value)}
            options={[
              { label: 'true', value: true },
              { label: 'false', value: false }
            ]}
          />
        );
      case 'json': {
        const stringValue = typeof param.value === 'string' ? param.value : JSON.stringify(param.value, null, 2);
        return (
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 4 }}
            value={stringValue}
            onChange={(event) => {
              const text = event.target.value;
              try {
                onUpdateCustomParameter(index, 'value', JSON.parse(text));
              } catch {
                onUpdateCustomParameter(index, 'value', text);
              }
            }}
          />
        );
      }
      default:
        return (
          <Input
            value={typeof param.value === 'string' ? param.value : ''}
            onChange={(event) => onUpdateCustomParameter(index, 'value', event.target.value)}
          />
        );
    }
  };

  const formatSliderTooltip = (value?: number) => (typeof value === 'number' ? value.toString() : '');

  return (
    <Container>
      <HStack alignItems="center" justifyContent="space-between" style={{ marginBottom: 10 }}>
        <Label>{t('assistants.settings.default_model', '默认模型')}</Label>
        <HStack alignItems="center" gap={8}>
          <ModelSelectButton
            icon={defaultModel ? <ModelBadge>{getModelInitial(defaultModel)}</ModelBadge> : <PlusIcon size={18} />}
            onClick={() => setModelModalOpen(true)}
          >
            <ModelName>{defaultModel ? defaultModel.name : t('assistants.settings.model.select', '选择模型')}</ModelName>
          </ModelSelectButton>
          {defaultModel && (
            <Button
              danger
              type="text"
              icon={<Trash2 size={14} />}
              onClick={() => {
                setDefaultModel(undefined);
                updateAssistant({ model: undefined, defaultModel: undefined });
              }}
            />
          )}
        </HStack>
      </HStack>
      <Divider style={{ margin: '10px 0' }} />

      <SettingRow style={{ minHeight: 30 }}>
        <HStack alignItems="center">
          <Label>
            {t('chat.settings.temperature.label', '采样温度')}
            <Tooltip title={t('chat.settings.temperature.tip', '较高的温度会带来更多样化的回复')}>
              <QuestionIcon />
            </Tooltip>
          </Label>
        </HStack>
        <Switch
          checked={enableTemperature}
          onChange={(enabled) => {
            setEnableTemperature(enabled);
            updateAssistantSettings({ enableTemperature: enabled });
          }}
        />
      </SettingRow>
      {enableTemperature && (
        <Row align="middle" gutter={12}>
          <Col span={20}>
            <Slider
              min={0}
              max={2}
              marks={{ 0: '0', 0.7: '0.7', 2: '2' }}
              step={0.01}
              value={temperature}
              onChange={(value) => setTemperature(value as number)}
              onChangeComplete={(value) => updateAssistantSettings({ temperature: value as number })}
            />
          </Col>
          <Col span={4}>
            <EditableNumber
              value={temperature}
              min={0}
              max={2}
              step={0.01}
              style={{ width: '100%' }}
              onChange={(value) => {
                if (typeof value === 'number') {
                  setTemperature(value);
                  setTimeoutTimer('temperature_manual', () => updateAssistantSettings({ temperature: value }), 400);
                }
              }}
            />
          </Col>
        </Row>
      )}

      <Divider style={{ margin: '10px 0' }} />

      <SettingRow style={{ minHeight: 30 }}>
        <HStack alignItems="center">
          <Label>{t('chat.settings.top_p.label', 'Top P')}</Label>
          <Tooltip title={t('chat.settings.top_p.tip', '限制采样到概率最高的百分比范围内')}>
            <QuestionIcon />
          </Tooltip>
        </HStack>
        <Switch
          checked={enableTopP}
          onChange={(enabled) => {
            setEnableTopP(enabled);
            updateAssistantSettings({ enableTopP: enabled });
          }}
        />
      </SettingRow>
      {enableTopP && (
        <Row align="middle" gutter={12}>
          <Col span={20}>
            <Slider
              min={0}
              max={1}
              marks={{ 0: '0', 1: '1' }}
              step={0.01}
              value={topP}
              onChange={(value) => setTopP(value as number)}
              onChangeComplete={(value) => updateAssistantSettings({ topP: value as number })}
            />
          </Col>
          <Col span={4}>
            <EditableNumber
              value={topP}
              min={0}
              max={1}
              step={0.01}
              style={{ width: '100%' }}
              onChange={(value) => {
                if (typeof value === 'number') {
                  setTopP(value);
                  setTimeoutTimer('topP_manual', () => updateAssistantSettings({ topP: value }), 400);
                }
              }}
            />
          </Col>
        </Row>
      )}

      <Divider style={{ margin: '10px 0' }} />

      <Row align="middle">
        <Col span={20}>
          <Label>
            {t('chat.settings.context_count.label', '上下文记忆条数')}
            <Tooltip title={t('chat.settings.context_count.tip', '控制模型回复时可引用的历史消息数量')}>
              <QuestionIcon />
            </Tooltip>
          </Label>
        </Col>
        <Col span={4}>
          <EditableNumber
            value={contextCount}
            min={0}
            max={MAX_CONTEXT_COUNT}
            step={1}
            style={{ width: '100%' }}
            onChange={(value) => {
              if (typeof value === 'number') {
                setContextCount(value);
                setTimeoutTimer('context_manual', () => updateAssistantSettings({ contextCount: value }), 400);
              }
            }}
          />
        </Col>
      </Row>
      <Row align="middle" gutter={24}>
        <Col span={24}>
          <Slider
            min={0}
            max={MAX_CONTEXT_COUNT}
            marks={{ 0: '0', 25: '25', 50: '50', 75: '75', 100: t('chat.settings.max', '最大') }}
            step={1}
            value={contextCount}
            tooltip={{ formatter: formatSliderTooltip }}
            onChange={(value) => setContextCount(value as number)}
            onChangeComplete={(value) => updateAssistantSettings({ contextCount: value as number })}
          />
        </Col>
      </Row>

      <Divider style={{ margin: '10px 0' }} />

      <SettingRow style={{ minHeight: 30 }}>
        <HStack alignItems="center">
          <Label>{t('chat.settings.max_tokens.label', '最大 Token 数')}</Label>
          <Tooltip title={t('chat.settings.max_tokens.tip', '在长回复场景开启，可能影响回答完整度')}>
            <QuestionIcon />
          </Tooltip>
        </HStack>
        <Switch
          checked={enableMaxTokens}
          onChange={async (enabled) => {
            if (enabled) {
              const confirmed = await modalConfirm({
                title: t('chat.settings.max_tokens.confirm', '确定开启最大 Token 限制？'),
                content: t(
                  'chat.settings.max_tokens.confirm_content',
                  '开启后，当达到上限时模型会提前停止回复。'
                ),
                okButtonProps: { danger: true }
              });
              if (!confirmed) return;
            }
            setEnableMaxTokens(enabled);
            updateAssistantSettings({ enableMaxTokens: enabled });
          }}
        />
      </SettingRow>
      {enableMaxTokens && (
        <Row align="middle" style={{ marginTop: 5, marginBottom: 5 }}>
          <Col span={24}>
            <InputNumber
              min={0}
              max={1_000_000}
              step={100}
              style={{ width: '100%' }}
              value={maxTokens}
              onChange={(value) => {
                if (typeof value === 'number') {
                  setMaxTokens(value);
                  setTimeoutTimer('maxTokens_manual', () => updateAssistantSettings({ maxTokens: value }), 600);
                }
              }}
            />
          </Col>
        </Row>
      )}

      <Divider style={{ margin: '10px 0' }} />

      <SettingRow style={{ minHeight: 30 }}>
        <Label>{t('models.stream_output', '流式输出')}</Label>
        <Switch
          checked={streamOutput}
          onChange={(checked) => {
            setStreamOutput(checked);
            updateAssistantSettings({ streamOutput: checked });
          }}
        />
      </SettingRow>

      <Divider style={{ margin: '10px 0' }} />

      <SettingRow style={{ minHeight: 30 }}>
        <Label>{t('assistants.settings.tool_use_mode.label', '工具调度模式')}</Label>
        <Selector
          value={toolUseMode}
          options={[
            { label: t('assistants.settings.model.toolUse.prompt', '提示词控制'), value: 'prompt' },
            { label: t('assistants.settings.model.toolUse.auto', '自动'), value: 'auto' },
            { label: t('assistants.settings.model.toolUse.manual', '手动确认'), value: 'manual' }
          ]}
          onChange={(value) => {
            const mode = value as AssistantSettings['toolUseMode'];
            setToolUseMode(mode);
            updateAssistantSettings({ toolUseMode: mode });
          }}
          size={14}
        />
      </SettingRow>

      <Divider style={{ margin: '10px 0' }} />

      <SettingRow style={{ minHeight: 30 }}>
        <Label>{t('models.custom_parameters', '自定义参数')}</Label>
        <Button icon={<PlusIcon size={18} />} onClick={onAddCustomParameter}>
          {t('models.add_parameter', '添加参数')}
        </Button>
      </SettingRow>

      {customParameters.map((param, index) => (
        <Row key={`${param.name || 'param'}-${index}`} align="stretch" gutter={10} style={{ marginTop: 10 }}>
          <Col span={6}>
            <Input
              placeholder={t('models.parameter_name', '参数名称')}
              value={param.name}
              onChange={(event) => onUpdateCustomParameter(index, 'name', event.target.value)}
            />
          </Col>
          <Col span={6}>
            <Select
              value={param.type}
              onChange={(value: CustomParameter['type']) => onUpdateCustomParameter(index, 'type', value)}
              style={{ width: '100%' }}
              options={[
                { label: t('models.parameter_type.string', '字符串'), value: 'string' },
                { label: t('models.parameter_type.number', '数字'), value: 'number' },
                { label: t('models.parameter_type.boolean', '布尔值'), value: 'boolean' },
                { label: t('models.parameter_type.json', 'JSON'), value: 'json' }
              ]}
            />
          </Col>
          <Col span={10}>{renderParameterValueInput(param, index)}</Col>
          <Col span={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button danger type="text" icon={<Trash2 size={14} />} onClick={() => onDeleteCustomParameter(index)} />
          </Col>
        </Row>
      ))}

      <Divider style={{ margin: '15px 0' }} />
      <HStack justifyContent="flex-end">
        <Button onClick={onReset} danger type="primary" icon={<RotateCcw size={16} />}>
          {t('chat.settings.reset', '重置为默认值')}
        </Button>
      </HStack>

      <Modal
        open={isModelModalOpen}
        title={t('assistants.settings.model.select_title', '选择默认模型')}
        onCancel={() => setModelModalOpen(false)}
        footer={null}
        width={420}
        centered
      >
        <ModelList>
          {modelOptions.map((option) => (
            <ModelListItem
              key={option.id}
              $selected={option.id === selectedModelId}
              onClick={() => {
                handleModelChange(option.model);
                setModelModalOpen(false);
              }}
            >
              {option.label}
              {option.id === selectedModelId && <Check size={16} />}
            </ModelListItem>
          ))}
        </ModelList>
      </Modal>
    </Container>
  );
};

const getDefaultValueByType = (type: CustomParameter['type']) => {
  switch (type) {
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'json':
      return '{}';
    default:
      return '';
  }
};

const buildModelId = (model: AssistantModel) => `${model.provider}:${model.name}`;

const getModelInitial = (model: AssistantModel) => model.name.charAt(0).toUpperCase();
const areCustomParametersEqual = (a: CustomParameter[], b: CustomParameter[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const paramA = a[i];
    const paramB = b[i];
    if (paramA.name !== paramB.name || paramA.type !== paramB.type) {
      return false;
    }
    const valueA = paramA.value;
    const valueB = paramB.value;
    const isObjectValue = typeof valueA === 'object' || typeof valueB === 'object';
    if (isObjectValue) {
      if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
        return false;
      }
    } else if (valueA !== valueB) {
      return false;
    }
  }
  return true;
};


const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 5px;
`;

const Label = styled.p`
  margin-right: 5px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
`;

const QuestionIcon = styled(QuestionCircleOutlined)`
  font-size: 12px;
  cursor: pointer;
  color: var(--color-text-2);
`;

const ModelSelectButton = styled(Button)`
  max-width: 300px;
  justify-content: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-inline: 10px;

  .ant-btn-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
`;

const ModelName = styled.span`
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ModelBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--color-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
`;

const ModelOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const ModelMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const ModelNameText = styled.span`
  font-weight: 600;
  color: var(--color-text);
`;

const ModelProviderText = styled.span`
  font-size: 12px;
  color: var(--color-text-2);
`;

const ModelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ModelListItem = styled.button.attrs({ type: 'button' })<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px solid ${({ $selected }) => ($selected ? 'var(--color-primary)' : 'var(--color-border)')};
  border-radius: 8px;
  padding: 10px 12px;
  background: ${({ $selected }) => ($selected ? 'rgba(0, 128, 255, 0.05)' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;
  color: inherit;

  &:hover {
    border-color: var(--color-primary);
    background: rgba(0, 128, 255, 0.08);
  }
`;

export default AssistantModelSettings;
