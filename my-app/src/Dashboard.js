import { useEffect, useState } from 'react';
import { Container, Title, TextInput, NumberInput, Button, Stack, Group, Divider, SegmentedControl } from '@mantine/core';
import supabase from './supabase';
import './Dashboard.css';
import Note from './components/Note';
import NoteboardSelector from './components/NoteboardSelector';

import NotesGrid from './components/NotesGrid';
import NotesChaos from './components/NotesChaos';

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


export default function Dashboard({ session }) {
  const [noteboards, setNoteboards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [noteCurrency, setNoteCurrency] = useState('');
  const [notePrize, setNotePrize] = useState('');
  const [openPinMenuForNote, setOpenPinMenuForNote] = useState(null);
  const [layoutMode, setLayoutMode] = useState('grid');
  const [originalGridOrder, setOriginalGridOrder] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor));

  function handleGridDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = notes.findIndex((n) => n.id === active.id);
    const newIndex = notes.findIndex((n) => n.id === over.id);

    const newOrder = arrayMove(notes, oldIndex, newIndex);
    setNotes(newOrder);
  }


  useEffect(() => {
    if (layoutMode !== 'chaos') return;

    // 💾 Capture original order before layout changes
    if (originalGridOrder.length === 0 && notes.length > 0) {
      setOriginalGridOrder(notes.map((n) => n.id));
    }

    const unplacedNotes = notes.filter((n) => n.chaos_x === null || n.chaos_y === null);
    if (unplacedNotes.length === 0) return;

    const updatedNotes = [];
    const spacing = 220;
    let row = 0;
    let col = 0;

    const jittered = unplacedNotes.map((note) => {
      const baseX = col * spacing + Math.random() * 30 - 15;
      const baseY = row * spacing + Math.random() * 30 - 15;

      col++;
      if (col >= 3) {
        col = 0;
        row++;
      }

      updatedNotes.push({ id: note.id, chaos_x: baseX, chaos_y: baseY });

      return { ...note, chaos_x: baseX, chaos_y: baseY };
    });

    setNotes((prev) =>
      prev.map((note) => {
        const found = updatedNotes.find((u) => u.id === note.id);
        return found ? { ...note, ...found } : note;
      })
    );

    updatedNotes.forEach(({ id, chaos_x, chaos_y }) => {
      supabase.from('notes').update({ chaos_x, chaos_y }).eq('id', id);
    });
  }, [layoutMode]);


  useEffect(() => {
    if (layoutMode !== 'grid' || originalGridOrder.length === 0) return;

    // Restore original note order
    const sortedNotes = [...notes].sort(
      (a, b) => originalGridOrder.indexOf(a.id) - originalGridOrder.indexOf(b.id)
    );

    setNotes(sortedNotes);
    setOriginalGridOrder([]); // Reset for next chaos switch
  }, [layoutMode]);


  function updateNotePin(noteId, newPin) {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? {
            ...note,
            pin_type: newPin,
            grid_index: note.grid_index ?? 0, // 👈 keep it safe
            chaos_x: note.chaos_x ?? null,
            chaos_y: note.chaos_y ?? null,
          }
          : note
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
      .eq('noteboard_id', boardId)
      .order('grid_index', { ascending: true });

    if (data) {
      setNotes(data);
    }
  }

  async function handleCreateNote() {
    if (!noteContent || !selectedBoard) return;

    // Count existing notes to determine new index
    const { count } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('noteboard_id', selectedBoard);

    const { data, error } = await supabase
      .from('notes')
      .insert({
        noteboard_id: selectedBoard,
        content: noteContent,
        currency: noteCurrency ? Number(noteCurrency) : null,
        prize: notePrize || null,
        grid_index: count ?? 0 // 👈 ensure it's placed correctly
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

  async function handleNoteDragStop(noteId, x, y) {
    // Optimistically update local state
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, chaos_x: x, chaos_y: y } : n))
    );

    // Update in Supabase
    const { error } = await supabase
      .from('notes')
      .update({ chaos_x: x, chaos_y: y })
      .eq('id', noteId);

    if (error) {
      console.error('Failed to save chaos position:', error);
    }
  }


  return (
    <Container size="md" py="xl">
      <NoteboardSelector
        noteboards={noteboards}
        selectedBoard={selectedBoard}
        onChange={setSelectedBoard}
      />

      <SegmentedControl
        data={[{ label: 'Grid', value: 'grid' }, { label: 'Chaos', value: 'chaos' }]}
        value={layoutMode}
        onChange={setLayoutMode}
        my="md"
      />

      <Stack spacing="xs">
        <TextInput
          label="Note Content"
          placeholder="Write something..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.currentTarget.value)}
        />
        <NumberInput
          label="Currency Reward"
          placeholder="0"
          value={noteCurrency}
          onChange={setNoteCurrency}
        />
        <TextInput
          label="Prize (optional)"
          placeholder="Gummy worms, nap..."
          value={notePrize}
          onChange={(e) => setNotePrize(e.currentTarget.value)}
        />
        <Button onClick={handleCreateNote}>Create Note</Button>
      </Stack>

      <Divider my="md" label="Notes" labelPosition="center" />
      {layoutMode === 'grid' ? (
        <NotesGrid
          notes={notes}
          updateNotePin={updateNotePin}
          fetchNotes={fetchNotes}
          selectedBoard={selectedBoard}
          openPinMenuForNote={openPinMenuForNote}
          setOpenPinMenuForNote={setOpenPinMenuForNote}
          setNotes={setNotes}
        />
      ) : (
        <NotesChaos
          notes={notes}
          updateNotePin={updateNotePin}
          onDragStop={handleNoteDragStop}
          openPinMenuForNote={openPinMenuForNote}
          setOpenPinMenuForNote={setOpenPinMenuForNote}
        />
      )}

      <Divider my="md" label="Add a New Note" labelPosition="center" />


    </Container>
  );
}
