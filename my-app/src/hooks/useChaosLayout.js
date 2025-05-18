import { useEffect } from 'react';
import supabase from '../supabase';

export default function useChaosLayout({ layoutMode, notes, setNotes, originalGridOrder, setOriginalGridOrder }) {
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
        unplacedNotes.forEach((note) => {
            const baseX = col * spacing + Math.random() * 30 - 15;
            const baseY = row * spacing + Math.random() * 30 - 15;
            col++;
            if (col >= 3) {
                col = 0;
                row++;
            }
            updatedNotes.push({ id: note.id, chaos_x: baseX, chaos_y: baseY });
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
    }, [layoutMode, notes, setNotes, originalGridOrder, setOriginalGridOrder]);
}