import React from 'react';
import { Image, Box } from '@chakra-ui/react';
import { PIN_TYPES } from './pinConfig';

export default function PinDisplay({ type, src, color, size = "30px" }) {
  if (type === PIN_TYPES.IMAGE) {
    return (
      <Image
        src={src}
        alt="pin"
        className="pin-image"
        boxSize={size}
        fit="cover"
        backgroundColor="transparent"
      />
    );
  }

  return (
    <Box
      className="pin-color"
      style={{
        backgroundColor: color || 'red',
        width: size,
        height: size
      }}
    />
  );
}