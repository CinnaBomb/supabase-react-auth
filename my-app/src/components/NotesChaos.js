import Note from './Note';

export default function NotesChaos({
  notes,
  updateNotePin,
  onDragStop,
  openPinMenuForNote,
  setOpenPinMenuForNote
}) {
  return (
    <div className="notes-chaos">
      {notes.map((note) => (
        <Note
          key={note.id}
          note={note}
          layoutMode="chaos"
          updateNotePin={updateNotePin}
          onDragStop={onDragStop}
          isPinMenuOpen={openPinMenuForNote === note.id}
          openPinMenuFor={(id) => setOpenPinMenuForNote(id)}
          closePinMenu={() => setOpenPinMenuForNote(null)}
        />
      ))}
    </div>
  );
}
