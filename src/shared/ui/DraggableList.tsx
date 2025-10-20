'use client';

import React, { useCallback, useMemo, useState } from 'react';

interface Props<T> {
  list: T[];
  children: (item: T, index: number) => React.ReactNode;
  onUpdate: (list: T[]) => void;
  itemKey?: keyof T | ((item: T, index: number) => React.Key);
  style?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  listProps?: React.HTMLAttributes<HTMLDivElement>;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const reorder = <T,>(items: T[], sourceIndex: number, targetIndex: number) => {
  const result = [...items];
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(targetIndex, 0, removed);
  return result;
};

export function DraggableList<T>({
  list,
  children,
  onUpdate,
  itemKey,
  style,
  listStyle,
  listProps,
  onDragStart,
  onDragEnd,
}: Props<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewOrder, setPreviewOrder] = useState<T[] | null>(null);

  const resolveKey = useMemo(() => {
    if (!itemKey) {
      return (item: T, index: number) => {
        if (item && typeof item === 'object' && 'id' in (item as Record<string, unknown>)) {
          return String((item as Record<string, unknown>).id);
        }
        return String(index);
      };
    }
    if (typeof itemKey === 'function') {
      return itemKey;
    }
    const keyProp = itemKey;
    return (item: T, index: number) => {
      const keyValue = (item as Record<string, unknown>)[keyProp as string];
      return keyValue !== undefined ? String(keyValue) : String(index);
    };
  }, [itemKey]);

  const data = previewOrder ?? list;

  const handleDragStart = useCallback(
    (index: number) => (event: React.DragEvent<HTMLDivElement>) => {
      onDragStart?.();
      setDragIndex(index);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    },
    [onDragStart]
  );

  const handleDragOver = useCallback(
    (hoverIndex: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const source = dragIndex ?? Number(event.dataTransfer.getData('text/plain'));
      if (Number.isNaN(source) || source === hoverIndex) return;
      setPreviewOrder(reorder(list, source, hoverIndex));
    },
    [dragIndex, list]
  );

  const clearDragState = useCallback(() => {
    setDragIndex(null);
    setPreviewOrder(null);
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const sourceIndex = dragIndex ?? Number(event.dataTransfer.getData('text/plain'));
      clearDragState();
      onDragEnd?.();
      if (Number.isNaN(sourceIndex) || sourceIndex === targetIndex) {
        return;
      }
      const next = reorder(list, sourceIndex, targetIndex);
      onUpdate(next);
    },
    [clearDragState, dragIndex, list, onDragEnd, onUpdate]
  );

  const handleDragEnd = useCallback(() => {
    clearDragState();
    onDragEnd?.();
  }, [clearDragState, onDragEnd]);

  return (
    <div style={style}>
      <div {...listProps}>
        {data.map((item, index) => (
          <div
            key={resolveKey(item, index)}
            draggable
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDrop={handleDrop(index)}
            onDragEnd={handleDragEnd}
            style={{
              ...listStyle,
              cursor: 'grab',
            }}>
            {children(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DraggableList;
