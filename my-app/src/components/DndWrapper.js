// DndWrapper.js
// A reusable drag-and-drop wrapper that works with Mantine + @dnd-kit

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function DndWrapper({ id, children, className = '', style = {}, zIndex = 1 }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const combinedStyle = {
    transform: CSS.Translate.toString(transform),
    touchAction: 'none',
    position: 'absolute',
    zIndex,
    ...style,
  };

  return (
    <div
      ref={setNodeRef}
      className={className}
      style={combinedStyle}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
