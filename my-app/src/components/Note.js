import { useDraggable } from '@dnd-kit/core';
import PinSelector from './PinSelector';

export default function Note({
  note,
  layoutMode,
  isOverlay = false,
  draggable = false,
  updateNotePin,
  isPinMenuOpen,
  openPinMenuFor,
  closePinMenu,
  dndAttributes,
  dndListeners,
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: note.id });

  const activeAttributes = dndAttributes ?? attributes;
  const activeListeners = dndListeners ?? listeners;
  const activeRef = draggable ? setNodeRef : null;

  return (
    <div
      className="sticky-note"
      ref={activeRef}
      {...(draggable ? activeAttributes : {})}
    >
      <PinSelector
        noteId={note.id}
        currentPin={note.pin_type}
        updateLocalPin={updateNotePin}
        isPinMenuOpen={isPinMenuOpen}
        openPinMenuFor={openPinMenuFor}
        closePinMenu={closePinMenu}
        // Pass drag listeners to the pin so it can be dragged directly
        dragListeners={draggable ? activeListeners : {}}
        dragAttributes={draggable ? activeAttributes : {}}
      />

      <div
        className="note-drag-handle"
        {...(draggable ? activeListeners : {})}
      >
        <div className="note-content">{note.content}</div>
        <div className="note-meta">
          {note.currency && `💰 ${note.currency}`}
          {note.prize && ` 🎁 ${note.prize}`}
        </div>
      </div>
    </div>
  );
}
