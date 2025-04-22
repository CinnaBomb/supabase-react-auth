import { DndContext, useSensor, useSensors, PointerSensor, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Note from './Note';

export default function NotesChaos({
  notes,
  updateNotePin,
  onDragStop,
  openPinMenuForNote,
  setOpenPinMenuForNote,
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  function ChaosDraggable({ note }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: note.id });

    const style = {
      position: 'absolute',
      top: typeof note.chaos_y === 'number' ? note.chaos_y : 0,
      left: typeof note.chaos_x === 'number' ? note.chaos_x : 0,
      transform: CSS.Translate.toString(transform),
      width: '200px',
      touchAction: 'none',
      zIndex: openPinMenuForNote === note.id ? 2 : 1,
    };

    return (
<div ref={setNodeRef} style={style}>
        <Note
          note={note}
          layoutMode="chaos"
          updateNotePin={updateNotePin}
          isPinMenuOpen={openPinMenuForNote === note.id} // ✅ this is the state value
          openPinMenuFor={setOpenPinMenuForNote}        // ✅ this is the setter
          closePinMenu={() => setOpenPinMenuForNote(null)}
          draggable
          dndAttributes={attributes}
          dndListeners={listeners}
        />
      </div>
    );
  }

  function handleDragEnd(event) {
    const { delta, active } = event;
    const draggedNote = notes.find((n) => n.id.toString() === active.id.toString());
    if (!draggedNote) return;

    const newX = (draggedNote.chaos_x ?? 0) + delta.x;
    const newY = (draggedNote.chaos_y ?? 0) + delta.y;

    onDragStop(draggedNote.id, newX, newY);
  }

  return (
    <div className="notes-chaos">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {notes.map((note) => (
          <ChaosDraggable key={note.id} note={note} />
        ))}
      </DndContext>
    </div>
  );
}
