'use client';

import { useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CircleHelp } from 'lucide-react';
import { CheckOutlined } from '@ant-design/icons';
import { Row, Segmented, Select, SelectProps, Tooltip } from 'antd';

import { Assistant, knowledgeBaseCatalog } from '@/features/chat/hooks/useMockData';
import { Box } from '@/shared/ui/layout/primitives';

interface Props {
  assistant: Assistant;
  updateAssistant: (updates: Partial<Assistant>) => void;
}

const AssistantKnowledgeBaseSettings: React.FC<Props> = ({ assistant, updateAssistant }) => {
  const { t } = useTranslation();

  const knowledgeOptions: SelectProps['options'] = useMemo(
    () => knowledgeBaseCatalog.map((base) => ({ label: base.name, value: base.id })),
    []
  );

  const onUpdate = (values: string[]) => {
    const knowledge_bases = values
      .map((id) => knowledgeBaseCatalog.find((base) => base.id === id))
      .filter((base): base is NonNullable<typeof base> => Boolean(base));
    updateAssistant({ knowledge_bases });
  };

  return (
    <Container>
      <Box mb={8} style={{ fontWeight: 'bold' }}>
        {t('common.knowledge_base')}
      </Box>
      <Select
        mode="multiple"
        allowClear
        value={assistant.knowledge_bases?.map((base) => base.id)}
        placeholder={t('assistants.presets.add.knowledge_base.placeholder')}
        menuItemSelectedIcon={<CheckOutlined />}
        options={knowledgeOptions}
        onChange={onUpdate}
        filterOption={(input, option) =>
          String(option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
      <Row align="middle" style={{ marginTop: 10 }}>
        <Label>{t('assistants.settings.knowledge_base.recognition.label')}</Label>
      </Row>
      <Row align="middle" style={{ marginTop: 10 }}>
        <Segmented
          value={assistant.knowledgeRecognition ?? 'off'}
          options={[
            { label: t('assistants.settings.knowledge_base.recognition.off'), value: 'off' },
            {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {t('assistants.settings.knowledge_base.recognition.on')}
                  <Tooltip title={t('assistants.settings.knowledge_base.recognition.tip')}>
                    <QuestionIcon size={15} />
                  </Tooltip>
                </div>
              ),
              value: 'on'
            }
          ]}
          onChange={(value) => updateAssistant({ knowledgeRecognition: value as 'off' | 'on' })}
        />
      </Row>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  padding: 5px;
`;

const Label = styled.p`
  margin-right: 5px;
  font-weight: 500;
`;

const QuestionIcon = styled(CircleHelp)`
  cursor: pointer;
  color: var(--color-text-3);
`;

export default AssistantKnowledgeBaseSettings;
