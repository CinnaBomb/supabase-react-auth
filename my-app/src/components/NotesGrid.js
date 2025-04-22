// New version of NotesGrid.js with position-based drag-and-drop

import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import Note from './Note';
import supabase from '../supabase';
import { useDroppable } from '@dnd-kit/core';

export default function NotesGrid({
  notes,
  updateNotePin,
  fetchNotes,
  selectedBoard,
  openPinMenuForNote,
  setOpenPinMenuForNote,
  setNotes,
  gridColumns
}) {
  const cellSize = 220;
  const rows = Math.ceil(notes.length / gridColumns) + 2;
  const sensors = useSensors(useSensor(PointerSensor));

  const [activeNote, setActiveNote] = useState(null);

  useEffect(() => {
    // Ensure any missing grid_index values are initialized
    const missing = notes.filter((n) => n.grid_index == null);
    if (missing.length > 0) {
      const updated = notes.map((n, i) => ({ ...n, grid_index: n.grid_index ?? i }));
      setNotes(updated);

      missing.forEach((note, i) => {
        const idx = notes.findIndex((n) => n.id === note.id);
        if (idx !== -1) {
          supabase.from('notes').update({ grid_index: idx }).eq('id', note.id);
        }
      });
    }
  }, [notes, setNotes]);

  function handleDragStart(event) {
    const noteId = event.active.id;
    const note = notes.find((n) => n.id.toString() === noteId.toString());
    setActiveNote(note);
  }

  function GridCell({ row, col, children }) {
    const id = `cell-${row}-${col}`;
    const { setNodeRef } = useDroppable({ id });

    return (
      <div
        ref={setNodeRef}
        id={id}
        style={{
          position: 'absolute',
          top: row * cellSize,
          left: col * cellSize,
          width: cellSize,
          height: cellSize,
          border: '1px dashed transparent',
        }}
      >
        {children}
      </div>
    );
  }

  async function handleDragEnd(event) {
    const { over, active } = event;
    setActiveNote(null);
    if (!over || !active?.id) return;

    const overId = over?.id;
    if (!overId?.startsWith('cell-')) return;
    const [, row, col] = overId.split('-');
    const newIndex = parseInt(row) * gridColumns + parseInt(col);

    setNotes((prev) =>
      prev.map((n) =>
        n.id.toString() === active.id.toString() ? { ...n, grid_index: newIndex } : n
      )
    );

    const { error } = await supabase
      .from('notes')
      .update({ grid_index: newIndex })
      .eq('id', parseInt(active.id));

    if (error) console.error('Supabase update error:', error);
  }

  const renderedGrid = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < gridColumns; col++) {
      const index = row * gridColumns + col;
      const note = notes.find((n) => n.grid_index === index);
      renderedGrid.push(
        <GridCell key={`cell-${row}-${col}`} row={row} col={col}>
          {note && note.id !== activeNote?.id && (
            <Note
              note={note}
              layoutMode="grid"
              refresh={() => fetchNotes(selectedBoard)}
              updateNotePin={updateNotePin}
              isPinMenuOpen={openPinMenuForNote === note.id} // ✅ this is the state value
              openPinMenuFor={setOpenPinMenuForNote}        // ✅ this is the setter
              closePinMenu={() => setOpenPinMenuForNote(null)}
              draggable
            />
          )}

        </GridCell>
      );
    }
  }

  return (
    <div
      className="notes-grid"
      style={{
        position: 'relative',
        width: `${gridColumns * cellSize}px`,
        height: `${rows * cellSize}px`,
        border: '1px solid #ddd',
        margin: '0 auto'
      }}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {renderedGrid}
        <DragOverlay>
          {activeNote && <Note note={activeNote} layoutMode="grid" />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
