import { useEffect, useState } from 'react';
import {
  Container,
  Button,

  Box,
  Text,
  FormControl,
  FormLabel,
  Separator,
  Input,
  Flex
} from '@chakra-ui/react';
import supabase from './supabase';
import './Dashboard.css';
import NoteboardSelector from './components/NoteboardSelector';
import NotesGrid from './components/NotesGrid';
import NotesChaos from './components/NotesChaos';
import NewNoteModal from './components/NewNoteModal';
import WashiGenerator from './components/WashiGenerator';

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
  const [gridColumns, setGridColumns] = useState(4);
  const [modalOpen, setModalOpen] = useState(false);

  function handleGridDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = notes.findIndex((n) => n.id === active.id);
    const newIndex = notes.findIndex((n) => n.id === over.id);
    const newOrder = [...notes];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    setNotes(newOrder);
  }

  useEffect(() => {
    if (layoutMode !== 'chaos') return;
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
    const sortedNotes = [...notes].sort(
      (a, b) => originalGridOrder.indexOf(a.id) - originalGridOrder.indexOf(b.id)
    );
    setNotes(sortedNotes);
    setOriginalGridOrder([]);
  }, [layoutMode, notes, originalGridOrder]);

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
      if (error) return console.error(error);
      if (!data || data.length === 0) {
        const { data: newBoard } = await supabase
          .from('noteboards')
          .insert([{ user_id: session.user.id, title: 'Dashboard' }])
          .select();
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
    if (selectedBoard) fetchNotes(selectedBoard);
  }, [selectedBoard]);

  async function fetchNotes(boardId) {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('noteboard_id', boardId)
      .order('grid_index', { ascending: true });
    if (data) {
      setNotes(
        data.map((n, i) => ({
          ...n,
          grid_index: n.grid_index ?? i,
          chaos_x: n.chaos_x ?? null,
          chaos_y: n.chaos_y ?? null,
        }))
      );
    }
  }

  async function handleCreateNote() {
    if (!noteContent || !selectedBoard) return;
    const { count } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('noteboard_id', selectedBoard);
    const { error } = await supabase
      .from('notes')
      .insert({
        noteboard_id: selectedBoard,
        content: noteContent,
        currency: noteCurrency ? Number(noteCurrency) : null,
        prize: notePrize || null,
        grid_index: count ?? 0,
      });
    if (error) return console.error("Insert error:", error);
    setNoteContent('');
    setNoteCurrency('');
    setNotePrize('');
    setModalOpen(false);
    fetchNotes(selectedBoard);
  }

  async function handleNoteDragStop(noteId, x, y) {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, chaos_x: x, chaos_y: y } : n))
    );
    await supabase.from('notes').update({ chaos_x: x, chaos_y: y }).eq('id', noteId);
  }

  return (
    <Container maxW="container.md" py={10}>
      <NoteboardSelector
        noteboards={noteboards}
        selectedBoard={selectedBoard}
        onChange={setSelectedBoard}
      />

      <Box display="flex" mb={4} borderBottom="1px solid #e2e8f0">
        <Button
          onClick={() => setLayoutMode('grid')}
          variant={layoutMode === 'grid' ? 'solid' : 'ghost'}
          colorScheme="blue"
          borderRadius="0"
          flex="1"
        >
          Grid
        </Button>
        <Button
          onClick={() => setLayoutMode('chaos')}
          variant={layoutMode === 'chaos' ? 'solid' : 'ghost'}
          colorScheme="blue"
          borderRadius="0"
          flex="1"
        >
          Chaos
        </Button>
      </Box>

      <Box borderBottom="1px solid #e2e8f0" my={4} />

      <Box mb={4}>
        <Text fontWeight="bold" mb={2}>
          Grid Columns
        </Text>
        <Box display="flex" alignItems="center">
          <Button
            onClick={() => setGridColumns((prev) => Math.max(1, prev - 1))}
            colorScheme="blue"
            size="sm"
          >
            -
          </Button>
          <Input
            value={gridColumns}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1 && value <= 12) {
                setGridColumns(value);
              }
            }}
            textAlign="center"
            mx={2}
            width="60px"
          />
          <Button
            onClick={() => setGridColumns((prev) => Math.min(12, prev + 1))}
            colorScheme="blue"
            size="sm"
          >
            +
          </Button>
        </Box>
      </Box>

      <Button colorScheme="blue" onClick={() => setModalOpen(true)} my={2}>
        + Create New Note
      </Button>

      <Box textAlign="center" my={4}>
        <Text fontWeight="bold" fontSize="lg">Notes</Text>
        {/* <Separator my={4} /> */}
      </Box>

      {layoutMode === 'grid' ? (
        <NotesGrid
          notes={notes}
          updateNotePin={updateNotePin}
          fetchNotes={fetchNotes}
          selectedBoard={selectedBoard}
          openPinMenuForNote={openPinMenuForNote}
          setOpenPinMenuForNote={setOpenPinMenuForNote}
          setNotes={setNotes}
          gridColumns={gridColumns}
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

      <NewNoteModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        noteContent={noteContent}
        setNoteContent={setNoteContent}
        noteCurrency={noteCurrency}
        setNoteCurrency={setNoteCurrency}
        notePrize={notePrize}
        setNotePrize={setNotePrize}
        handleCreateNote={handleCreateNote}
      />
    </Container>
  );
}
