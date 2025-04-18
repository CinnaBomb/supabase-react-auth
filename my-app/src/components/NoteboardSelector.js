export default function NoteboardSelector({ noteboards, selectedBoard, onChange }) {
    return (
        <div>
            <h2>Noteboards</h2>
            <select
                onChange={(e) => onChange(Number(e.target.value))}
                value={selectedBoard ?? ''}
            >
                <option value="" disabled>Select a noteboard</option>
                {noteboards.map((board) => (
                    <option key={board.id} value={board.id}>
                        {board.title}
                    </option>
                ))}
            </select>
        </div>
    );
}
