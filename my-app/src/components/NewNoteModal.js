// 📝 NewNoteModal.js rewritten using Chakra UI's Dialog
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  Button,
  Stack,
  Text,
} from '@chakra-ui/react';
import Note from './Note';

export default function NewNoteModal({
  opened,
  onClose,
  noteContent,
  setNoteContent,
  noteCurrency,
  setNoteCurrency,
  notePrize,
  setNotePrize,
  handleCreateNote,
}) {
  const tempNote = {
    id: 'new',
    content: noteContent,
    currency: noteCurrency,
    prize: notePrize,
    pin_type: 'red',
  };

  return (
    <Modal isOpen={opened} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text fontSize="lg" fontWeight="bold">
            📝 Create a New Note
          </Text>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <Stack spacing={4}>
            <Note
              note={tempNote}
              layoutMode="grid"
              updateNotePin={() => {}}
              isPinMenuOpen={false}
              openPinMenuFor={() => {}}
              closePinMenu={() => {}}
              dndAttributes={{}}
              dndListeners={{}}
            />
            <Input
              placeholder="Write something..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <Input
              placeholder="Currency"
              value={noteCurrency}
              onChange={(e) => setNoteCurrency(e.target.value)}
            />
            <Input
              placeholder="Gummy worms, nap..."
              value={notePrize}
              onChange={(e) => setNotePrize(e.target.value)}
            />
            <Button colorScheme="blue" onClick={handleCreateNote}>
              Add Note
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
