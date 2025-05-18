import { useEffect } from 'react';

export default function useGridLayout({ layoutMode, notes, setNotes, originalGridOrder, setOriginalGridOrder }) {
    useEffect(() => {
        if (layoutMode !== 'grid' || originalGridOrder.length === 0) return;
        const sortedNotes = [...notes].sort(
            (a, b) => originalGridOrder.indexOf(a.id) - originalGridOrder.indexOf(b.id)
        );
        setNotes(sortedNotes);
        setOriginalGridOrder([]);
    }, [layoutMode, notes, setNotes, originalGridOrder, setOriginalGridOrder]);
}