import PinSelector from './PinSelector';

export default function Note({ note, refresh, updateNotePin }) {

    return (
        <div className="sticky-note" style={{ position: 'relative' }}>
            <PinSelector
                noteId={note.id}
                currentPin={note.pin_type}
                updateLocalPin={updateNotePin}
            />

            <div className="note-content">{note.content}</div>
            <div className="note-meta">
                {note.currency ? `💰 ${note.currency}` : ''}
                {note.prize ? ` 🎁 ${note.prize}` : ''}
            </div>
        </div>
    );
}
