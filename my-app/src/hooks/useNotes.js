import { useState, useEffect } from 'react';
import supabase from '../supabase';

export default function useNotes(selectedBoard) {
  const [notes, setNotes] = useState([]);

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

  useEffect(() => {
    if (selectedBoard) {
      fetchNotes(selectedBoard);
    }
  }, [selectedBoard]);

  return { notes, setNotes, fetchNotes };
}