import React from 'react';
import { MenuItem } from '@chakra-ui/react';
import PinDisplay from './PinDisplay';
import { availablePins, PIN_TYPES } from './pinConfig';

export default function PinMenuItems({ noteId, updateLocalPin, closePinMenu, openWashiGenerator }) {
  return (
    <>
      {availablePins.map((pin, i) => (
        <MenuItem
          key={i}
          onClick={async () => {
            const value = pin.type === PIN_TYPES.IMAGE 
              ? `image:${pin.src}`  // use the image src
              : pin.value;
            await updateLocalPin(noteId, value);
            closePinMenu();
          }}
        >
          <PinDisplay 
            type={pin.type}
            src={pin.src}
            color={pin.value}
            size="20px"
          />
          {pin.label}
        </MenuItem>
      ))}
      {/* Washi tape option */}
      <MenuItem onClick={() => {
        openWashiGenerator(noteId);
        closePinMenu();
      }}>
        <PinDisplay type="image" src="/washi-icon.png" size="20px" />
        Custom Washtape
      </MenuItem>
    </>
  );
}