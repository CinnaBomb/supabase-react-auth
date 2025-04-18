import { useEffect, useState } from 'react';
import supabase from './supabase';
import './Dashboard.css';
import Note from './components/Note';
import NoteboardSelector from './components/NoteboardSelector';

export default function Dashboard({ session }) {
    const [noteboards, setNoteboards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [notes, setNotes] = useState([]);
    const [noteContent, setNoteContent] = useState('');
    const [noteCurrency, setNoteCurrency] = useState('');
    const [notePrize, setNotePrize] = useState('');

    function updateNotePin(noteId, newPin) {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === noteId ? { ...note, pin_type: newPin } : note
          )
        );
      }

    useEffect(() => {
        async function fetchNoteboards() {
            if (!session?.user?.id) return;

            const { data, error } = await supabase
                .from('noteboards')
                .select('*')
                .eq('user_id', session.user.id);

            if (error) {
                console.error("Error fetching noteboards:", error);
                return;
            }

            if (!data || data.length === 0) {
                const { data: newBoard, error: insertError } = await supabase
                    .from('noteboards')
                    .insert([
                        {
                            user_id: session.user.id,
                            title: 'Dashboard',
                        },
                    ])
                    .select();

                if (insertError) {
                    console.error("Error creating default noteboard:", insertError);
                    return;
                }

                setNoteboards(newBoard);
                setSelectedBoard(newBoard[0].id);
            } else {
                setNoteboards(data);
                setSelectedBoard(data[0].id);
            }
        }

        fetchNoteboards();
    }, [session]);

    useEffect(() => {
        if (selectedBoard) {
            fetchNotes(selectedBoard);
        }
    }, [selectedBoard]);

    async function fetchNotes(boardId) {
        const { data } = await supabase
            .from('notes')
            .select('*')
            .eq('noteboard_id', boardId);

        if (data) {
            setNotes(data);
        }
    }

    async function handleCreateNote() {
        if (!noteContent || !selectedBoard) return;

        const { data, error } = await supabase
            .from('notes')
            .insert({
                noteboard_id: selectedBoard,
                content: noteContent,
                currency: noteCurrency ? Number(noteCurrency) : null,
                prize: notePrize || null,
            })
            .select();

        if (error) {
            console.error("Insert error:", error);
        } else {
            setNoteContent('');
            setNoteCurrency('');
            setNotePrize('');
            fetchNotes(selectedBoard);
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <NoteboardSelector
                noteboards={noteboards}
                selectedBoard={selectedBoard}
                onChange={setSelectedBoard}
            />

            <h3>Notes</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {notes.map((note) => (
                    <Note 
                    key={note.id} 
                    note={note} 
                    refresh={() => fetchNotes(selectedBoard)} 
                    updateNotePin={updateNotePin}
                    />
                ))}
            </div>

            <h4>Add a New Note</h4>
            <input
                type="text"
                placeholder="Note content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
            />
            <br />
            <input
                type="number"
                placeholder="Currency reward"
                value={noteCurrency}
                onChange={(e) => setNoteCurrency(e.target.value)}
            />
            <br />
            <input
                type="text"
                placeholder="Prize (optional)"
                value={notePrize}
                onChange={(e) => setNotePrize(e.target.value)}
            />
            <br />
            <button onClick={handleCreateNote}>Create Note</button>
        </div>
    );
}