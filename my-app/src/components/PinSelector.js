import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Image,
  Button,
} from '@chakra-ui/react';
import roundPin from './pin-style-images/RoundPin.png';
import supabase from '../supabase';

const availablePins = [
  { type: 'color', value: 'red' },
  { type: 'color', value: 'blue' },
  { type: 'color', value: 'green' },
  { type: 'color', value: 'gold' },
  { type: 'image', src: roundPin, label: 'Round Pin' },
];

export default function PinSelector({
  noteId,
  currentPin,
  updateLocalPin,
  isPinMenuOpen,
  openPinMenuFor,
  closePinMenu,
  dragListeners,
  dragAttributes,
}) {
  const isImagePin = currentPin?.startsWith?.('image:');
  const currentImageSrc = isImagePin ? currentPin.replace('image:', '') : null;

  return (
    <Box className="pin-wrapper">
      <Box
        className="pin-drag-handle"
        {...dragListeners}
        {...dragAttributes}
      />

      <Menu isOpen={isPinMenuOpen} onClose={closePinMenu}>
        <MenuButton
          as={Button}
          onClick={(e) => {
            e.stopPropagation();
            openPinMenuFor(noteId);
          }}
        >
          <Box className="pin-circle">
            {isImagePin ? (
              <Image src={currentImageSrc} alt="pin" className="pin-image" />
            ) : (
              <Box
                className="pin-color"
                style={{ backgroundColor: currentPin || 'red' }}
              />
            )}
          </Box>
        </MenuButton>
        <MenuList>
          {availablePins.map((pin, i) => (
            <MenuItem
              key={i}
              onClick={async () => {
                const value = pin.type === 'image' ? `image:${pin.src}` : pin.value;
                updateLocalPin(noteId, value);
                const { error } = await supabase
                  .from('notes')
                  .update({ pin_type: value })
                  .eq('id', noteId);
                if (error) console.error('DB update failed:', error);
                closePinMenu();
              }}
            >
              {pin.type === 'image' ? (
                <Image src={pin.src} alt={pin.label} boxSize="20px" borderRadius="full" />
              ) : (
                <Box
                  boxSize="16px"
                  borderRadius="full"
                  bg={pin.value}
                  boxShadow="0 0 2px rgba(0,0,0,0.4)"
                />
              )}
              {pin.label || pin.value}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
}