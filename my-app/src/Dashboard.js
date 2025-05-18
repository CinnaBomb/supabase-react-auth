import { useState } from 'react';
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
import PinSelector from './components/PinSelector';
import useChaosLayout from './hooks/useChaosLayout';
import useGridLayout from './hooks/useGridLayout';
import useNoteboards from './hooks/useNoteboard';
import useNotes from './hooks/useNotes';

export default function Dashboard({ session }) {
  const { noteboards, selectedBoard, setSelectedBoard } = useNoteboards(session);
  const { notes, setNotes, fetchNotes } = useNotes(selectedBoard);
  const [noteContent, setNoteContent] = useState('');
  const [noteCurrency, setNoteCurrency] = useState('');
  const [notePrize, setNotePrize] = useState('');
  const [openPinMenuForNote, setOpenPinMenuForNote] = useState(null);
  const [layoutMode, setLayoutMode] = useState('grid');
  const [originalGridOrder, setOriginalGridOrder] = useState([]);
  const [gridColumns, setGridColumns] = useState(4);
  const [modalOpen, setModalOpen] = useState(false);
  const [isWashiOpen, setIsWashiOpen] = useState(false);
  const [targetNoteId, setTargetNoteId] = useState(null);

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

  // Use custom hooks for layout effects.
  useChaosLayout({ layoutMode, notes, setNotes, originalGridOrder, setOriginalGridOrder });
  useGridLayout({ layoutMode, notes, setNotes, originalGridOrder, setOriginalGridOrder });

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
    if (error) {
      console.error("Insert error:", error);
      return;
    }
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

  function updateNotePin(noteId, newPin) {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, pin_type: newPin } : note
      )
    );
  }

  const openWashiGenerator = (noteId) => {
    setTargetNoteId(noteId);
    setIsWashiOpen(true);
  };

  const closeWashiGenerator = () => {
    setIsWashiOpen(false);
    setTargetNoteId(null);
  };

  const handleWashiCompleted = (generatedPattern) => {
    // Update the note's pin with the generated washi tape
    updateNotePin(targetNoteId, generatedPattern);
  };

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

      <PinSelector
        noteId={targetNoteId}
        openWashiGenerator={openWashiGenerator}
      />

      {isWashiOpen && (
        <WashiGenerator
          onCompleted={handleWashiCompleted}
          onClose={closeWashiGenerator}
        />
      )}
    </Container>
  );
}
