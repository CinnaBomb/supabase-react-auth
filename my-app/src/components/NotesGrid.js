import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import SortableNote from './SortableNote';
import supabase from '../supabase';
import { Box } from '@mantine/core';



export default function NotesGrid({
  notes,
  updateNotePin,
  fetchNotes,
  selectedBoard,
  openPinMenuForNote,
  setOpenPinMenuForNote,
  setNotes
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleGridDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  
    const oldIndex = notes.findIndex((n) => n.id === active.id);
    const newIndex = notes.findIndex((n) => n.id === over.id);
  
    const newOrder = arrayMove(notes, oldIndex, newIndex);
  
    const reordered = newOrder.map((note, index) => ({ ...note, grid_index: index }));
    setNotes(reordered);
  
    reordered.forEach((note) => {
      supabase.from('notes').update({ grid_index: note.grid_index }).eq('id', note.id);
    });
  }
  

  const columns = 4;
  const cellSize = 220;

  const rows = Math.ceil(notes.length / columns);
  const gridHeight = rows * cellSize;


  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGridDragEnd}>
      <SortableContext items={notes.map((n) => n.id)} strategy={rectSortingStrategy}>
      <Box className="notes-grid" style={{ height: gridHeight }}>


          {notes.map((note) => (
            <SortableNote
              key={note.id}
              note={note}
              layoutMode="grid"
              refresh={() => fetchNotes(selectedBoard)}
              updateNotePin={updateNotePin}
              isPinMenuOpen={openPinMenuForNote === note.id}
              openPinMenuFor={(id) => setOpenPinMenuForNote(id)}
              closePinMenu={() => setOpenPinMenuForNote(null)}
            />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
}
