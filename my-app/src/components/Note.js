import Draggable from 'react-draggable';
import PinSelector from './PinSelector';

export default function Note({
  note,
  refresh,
  updateNotePin,
  isPinMenuOpen,
  openPinMenuFor,
  closePinMenu,
  layoutMode,
  onDragStop,
  dragListeners,
  dragAttributes,
  dragRef,
}) {
  const chaosMode = layoutMode === 'chaos';

  const defaultX = note.chaos_x ?? 0;
  const defaultY = note.chaos_y ?? 0;

  const content = (
    <div className="sticky-note">
      <PinSelector
        noteId={note.id}
        currentPin={note.pin_type}
        updateLocalPin={updateNotePin}
        isOpen={isPinMenuOpen}
        open={() => openPinMenuFor(note.id)}
        close={closePinMenu}
      />
      <div className="note-content">{note.content}</div>
      <div className="note-meta">
        {note.currency ? `💰 ${note.currency}` : ''}
        {note.prize ? ` 🎁 ${note.prize}` : ''}
      </div>
    </div>
  );

  return chaosMode ? (
    <Draggable
      defaultPosition={{ x: defaultX, y: defaultY }}
      onStop={(_, data) => onDragStop(note.id, data.x, data.y)}
    >
      <div style={{ position: 'absolute' }}>{content}</div>
    </Draggable>
  ) : (
    <div
      ref={dragRef}
      {...dragAttributes}
      {...dragListeners}
      style={{ width: 200, height: 150, backgroundColor: 'lightblue', border: '2px dashed #333' }}
    >
      {note.id}
    </div>
  );
  
}
