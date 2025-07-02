'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon } from '@heroicons/react/24/outline';

// Sortable Item Component
function SortableItem({ 
  id, 
  children, 
  className = '',
  disabled = false,
  handle = false 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandleProps = handle ? {} : { ...listeners, ...attributes };
  const handleProps = handle ? { ...listeners, ...attributes } : {};

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${className} ${isDragging ? 'z-50' : ''}`}
      {...dragHandleProps}
    >
      {handle && (
        <div 
          className="drag-handle cursor-grab active:cursor-grabbing p-1"
          {...handleProps}
        >
          <Bars3Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      {children}
    </div>
  );
}

// Main Drag and Drop Container
export default function DragDropContainer({
  items,
  onReorder,
  children,
  strategy = 'vertical', // 'vertical' or 'grid'
  disabled = false,
  className = '',
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item._id === active.id);
      const newIndex = items.findIndex(item => item._id === over.id);

      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      onReorder(reorderedItems);
    }
  };

  const sortingStrategy = strategy === 'grid' 
    ? rectSortingStrategy 
    : verticalListSortingStrategy;

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(item => item._id)} 
        strategy={sortingStrategy}
      >
        <div className={className}>
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export { SortableItem };
