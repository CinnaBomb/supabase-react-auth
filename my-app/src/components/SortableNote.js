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
        transition
    } = useSortable({ id: note.id });

    const cellSize = 220;
    const columns = 4;

    const row = Math.floor(note.grid_index / columns);
    const col = note.grid_index % columns;

    const baseX = col * cellSize;
    const baseY = row * cellSize;

    const dragging = !!transform;

    const style = {
        position: 'absolute',
        width: '200px',
        touchAction: 'none',
        transition,
        transform: CSS.Transform.toString(transform),
        top: `${baseY}px`,
        left: `${baseX}px`,
      };
      
      
    console.log('rendering note', note.id, 'index', note.grid_index);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Note
                {...props}
                dragListeners={listeners}
                dragAttributes={attributes}
                dragRef={setNodeRef}
            />

        </div>
    );
}
