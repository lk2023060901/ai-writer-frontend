'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Dropdown, Empty, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { Book, PencilLine, Plus, Settings, Trash2 } from 'lucide-react';

import { useKnowledgeBases } from '@/features/knowledge/hooks/useKnowledgeBases';
import type { KnowledgeBase } from '@/types/launchpad';
import KnowledgeContent from './KnowledgeContent';
import DraggableList from '@/shared/ui/DraggableList';
import ListItem from '@/shared/ui/ListItem';
import Scrollbar from '@/shared/ui/Scrollbar';
import AddKnowledgeBasePopup from './AddKnowledgeBasePopup';
import EditKnowledgeBasePopup from './EditKnowledgeBasePopup';
import PromptPopup from './PromptPopup';
import KnowledgeSearchPopup from './KnowledgeSearchPopup';
import { useShortcut } from '@/shared/hooks/useShortcut';

const KnowledgePage: React.FC = () => {
  const {
    bases,
    renameKnowledgeBase,
    deleteKnowledgeBase,
    addKnowledgeBase,
    updateKnowledgeBases,
    updateKnowledgeBase,
  } = useKnowledgeBases();
  const [selectedBase, setSelectedBase] = useState<KnowledgeBase | undefined>(bases[0]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!bases.length) {
      setSelectedBase(undefined);
      return;
    }

    if (!selectedBase) {
      setSelectedBase(bases[0]);
      return;
    }

    const next = bases.find((item) => item.id === selectedBase.id);
    if (!next) {
      setSelectedBase(bases[0]);
    } else if (next !== selectedBase) {
      setSelectedBase(next);
    }
  }, [bases, selectedBase]);

  const handleAddKnowledge = useCallback(async () => {
    const newBase = await AddKnowledgeBasePopup.show({
      title: '创建知识库',
      onCreate: (name) => addKnowledgeBase({ name }),
    });
    if (newBase) {
      setSelectedBase(newBase);
    }
  }, [addKnowledgeBase]);

  const handleEdit = useCallback(
    async (base: KnowledgeBase) => {
      const updated = await EditKnowledgeBasePopup.show({
        base,
        onSubmit: async (values) => {
          updateKnowledgeBase(base.id, {
            description: values.description,
            tags: values.tags,
          });
        },
      });
      if (updated) {
        setSelectedBase(updated);
      }
    },
    [updateKnowledgeBase]
  );

  const handleDelete = useCallback(
    (base: KnowledgeBase) => {
      Modal.confirm({
        title: `删除知识库《${base.name}》`,
        content: '删除后将无法恢复，确认继续吗？',
        okButtonProps: { danger: true },
        okText: '删除',
        cancelText: '取消',
        centered: true,
        onOk: () => {
          deleteKnowledgeBase(base.id);
          if (selectedBase?.id === base.id) {
            setSelectedBase(undefined);
          }
        },
      });
    },
    [deleteKnowledgeBase, selectedBase]
  );

  const handleRename = useCallback(
    async (base: KnowledgeBase) => {
      const name = await PromptPopup.show({
        title: '重命名',
        defaultValue: base.name,
      });
      if (name && name !== base.name) {
        renameKnowledgeBase(base.id, name);
      }
    },
    [renameKnowledgeBase]
  );

  const handleSearch = useCallback(
    (base?: KnowledgeBase) => {
      const target = base ?? selectedBase;
      if (target) {
        KnowledgeSearchPopup.show({ base: target });
      }
    },
    [selectedBase]
  );

  const shortcuts = useMemo(
    () => ({
      'meta+k': (event: KeyboardEvent) => {
        event.preventDefault();
        handleSearch();
      },
      'ctrl+k': (event: KeyboardEvent) => {
        event.preventDefault();
        handleSearch();
      },
    }),
    [handleSearch]
  );

  useShortcut(shortcuts);

  const getMenuItems = useCallback(
    (base: KnowledgeBase): MenuProps['items'] => [
      {
        key: 'rename',
        label: '重命名',
        icon: <PencilLine size={14} />,
        onClick: () => handleRename(base),
      },
      {
        key: 'settings',
        label: '编辑',
        icon: <Settings size={14} />,
        onClick: () => handleEdit(base),
      },
      { type: 'divider' },
      {
        key: 'delete',
        label: '删除',
        danger: true,
        icon: <Trash2 size={14} />,
        onClick: () => handleDelete(base),
      },
    ],
    [handleDelete, handleEdit, handleRename]
  );

  const content = useMemo(() => {
    if (!bases.length) {
      return (
        <MainContent>
          <Empty description="暂无知识库" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </MainContent>
      );
    }

    if (!selectedBase) {
      return null;
    }

    return (
      <KnowledgeContent selectedBase={selectedBase} onEdit={handleEdit} onSearch={handleSearch} />
    );
  }, [bases.length, handleEdit, handleSearch, selectedBase]);

  return (
    <Container>
      <ContentContainer>
        <KnowledgeSideNav>
          <DraggableList
            list={bases}
            onUpdate={updateKnowledgeBases}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            listStyle={{ marginBottom: 8, cursor: 'grab' }}
            listProps={{ style: { marginBottom: 0, paddingBottom: isDragging ? 50 : 0 } }}
            itemKey="id">
            {(base) => (
              <Dropdown key={base.id} menu={{ items: getMenuItems(base) }} trigger={['contextMenu']}>
                <div onClick={() => setSelectedBase(base)}>
                  <ListItem
                    active={selectedBase?.id === base.id}
                    icon={<Book size={16} />}
                    title={base.name}
                  />
                </div>
              </Dropdown>
            )}
          </DraggableList>
          {!isDragging && (
            <AddKnowledgeItem onClick={handleAddKnowledge}>
              <AddKnowledgeName>
                <Plus size={18} />
                新增
              </AddKnowledgeName>
            </AddKnowledgeItem>
          )}
          <SidebarSpacer />
        </KnowledgeSideNav>
        {content}
      </ContentContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: calc(100vh - var(--navbar-height, 0px));
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const KnowledgeSideNav = styled(Scrollbar)`
  width: calc(var(--settings-width, 240px) + 100px);
  border-right: 0.5px solid var(--color-border);
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
`;

const AddKnowledgeItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 7px 12px;
  position: relative;
  border-radius: var(--list-item-border-radius);
  border: 0.5px solid transparent;
  cursor: pointer;

  &:hover {
    background-color: var(--color-background-soft);
  }
`;

const AddKnowledgeName = styled.div`
  color: var(--color-text);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

const SidebarSpacer = styled.div`
  flex: 1;
`;

const MainContent = styled(Scrollbar)`
  display: flex;
  width: 100%;
  padding: 15px 20px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default KnowledgePage;
