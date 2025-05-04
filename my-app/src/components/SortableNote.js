import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Note from './Note';

export default function SortableNote(props) {
  const { note } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: note.id });

  const cellSize = 220;
  const columns = 4;

  const row = Math.floor(note.grid_index / columns);
  const col = note.grid_index % columns;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    top: `${row * cellSize}px`,
    left: `${col * cellSize}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sortable-note"
      {...attributes}
      {...listeners}
    >
      <Note
        {...props}
        dragListeners={listeners}
        dragAttributes={attributes}
        dragRef={setNodeRef}
      />
    </div>
  );
}
