// NoteboardSelector.js — Chakra UI Version
import { Box, Heading, Select } from '@chakra-ui/react';

export default function NoteboardSelector({ noteboards, selectedBoard, onChange }) {
  return (
    <Box mb={4}>
      <Heading size="sm" mb={2}>Select Noteboard</Heading>
      <Select
        placeholder="Select a noteboard"
        value={selectedBoard?.toString() ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        size="md"
        variant="filled"
      >
        {noteboards.map((board) => (
          <option key={board.id} value={board.id}>
            {board.title}
          </option>
        ))}
      </Select>
    </Box>

);
}
