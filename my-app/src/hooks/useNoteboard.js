import { useState, useEffect } from 'react';
import supabase from '../supabase';

export default function useNoteboards(session) {
  const [noteboards, setNoteboards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    async function fetchNoteboards() {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('noteboards')
        .select('*')
        .eq('user_id', session.user.id);
      if (error) {
        console.error(error);
        return;
      }
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

  return { noteboards, selectedBoard, setSelectedBoard };
}