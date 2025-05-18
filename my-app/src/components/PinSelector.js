import React, { useRef, useState } from 'react';
import { Menu, MenuButton, MenuList, Box, Button } from '@chakra-ui/react';
import PinMenuItems from './pins/PinMenuItems';
import PinDisplay from './pins/PinDisplay';
import { getPinImage, PIN_TYPES } from './pins/pinConfig';

export default function PinSelector({
  noteId,
  currentPin,
  updateLocalPin,
  isPinMenuOpen,
  openPinMenuFor,
  closePinMenu,
  dragListeners,
  dragAttributes,
  openWashiGenerator,
}) {
  const isImagePin = currentPin?.startsWith?.('image:');
  const currentImageSrc = isImagePin ? getPinImage(currentPin) : null;
  
  console.log('PinSelector - currentPin:', currentPin); // Debug log
  console.log('PinSelector - currentImageSrc:', currentImageSrc); // Debug log

  // For long press detection
  const longPressTimeout = useRef(null);
  const [touchMoved, setTouchMoved] = useState(false);
  const LONG_PRESS_DELAY = 600; // milliseconds

  const handleTouchStart = (e) => {
    setTouchMoved(false);
    longPressTimeout.current = setTimeout(() => {
      if (!touchMoved) {
        openPinMenuFor(noteId);
      }
    }, LONG_PRESS_DELAY);
  };

  const handleTouchMove = (e) => {
    setTouchMoved(true);
    clearTimeout(longPressTimeout.current);
  };

  const handleTouchEnd = (e) => {
    clearTimeout(longPressTimeout.current);
  };

  // For right-click (desktop)
  const handleContextMenu = (e) => {
    e.preventDefault();
    openPinMenuFor(noteId);
  };

  return (
    <Box
      className="pin-wrapper"
      position="relative"
      {...dragListeners}
      {...dragAttributes}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Menu isOpen={isPinMenuOpen} onClose={closePinMenu}>
        <MenuButton
          className="pin-button"
          as={Button}
          variant="ghost"
          p={0}
          bg="transparent"
          _hover={{ bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
        >
          <PinDisplay
            type={isImagePin ? PIN_TYPES.IMAGE : PIN_TYPES.COLOR}
            src={currentImageSrc}
            color={currentPin}
            size="30px"
          />
        </MenuButton>
        <MenuList>
          <PinMenuItems
            noteId={noteId}
            updateLocalPin={updateLocalPin}
            closePinMenu={closePinMenu}
            openWashiGenerator={openWashiGenerator}
          />
        </MenuList>
      </Menu>
    </Box>
  );
}