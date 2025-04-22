import { Menu } from '@mantine/core';
import roundPin from './pin-style-images/RoundPin.png';
import { useEffect } from 'react';
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
  dragListeners,       // ← add this
  dragAttributes       // ← and this
}) {
  const isImagePin = currentPin?.startsWith?.('image:');
  const currentImageSrc = isImagePin ? currentPin.replace('image:', '') : null;

  return (
    <Menu
      shadow="md"
      width={160}
      position="right-start"
      withArrow
      withinPortal={false}
      opened={isPinMenuOpen}
      onClose={closePinMenu}
    >
      <Menu.Target>
        <div
          className="pin-circle"
          role="button"
          tabIndex={0}
          onDoubleClick={(e) => {
            e.stopPropagation();
            openPinMenuFor(noteId);
          }}
          {...dragListeners}
          {...dragAttributes}
          style={{
            position: 'relative',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            cursor: 'grab',
          }}
        >
          {isImagePin ? (
            <img
              src={currentImageSrc}
              alt="pin"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: currentPin || 'red',
              }}
            />
          )}
        </div>
      </Menu.Target>


      <Menu.Dropdown>
        {availablePins.map((pin, i) => (
          <Menu.Item
            key={i}
            onClick={async () => {
              const value = pin.type === 'image' ? `image:${pin.src}` : pin.value;

              // Update local state
              updateLocalPin(noteId, value);

              // Persist to Supabase
              const { error } = await supabase
                .from('notes')
                .update({ pin_type: value })
                .eq('id', noteId);

              if (error) {
                console.error('Failed to save pin_type to DB:', error);
              }

              closePinMenu();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: pin.type === 'color' ? pin.value : undefined,
              color: pin.type === 'color' ? '#fff' : '#000',
            }}
          >
            {pin.type === 'image' ? (
              <img
                src={pin.src}
                alt={pin.label}
                width={20}
                height={20}
                style={{ borderRadius: '50%' }}
              />
            ) : (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: pin.value,
                  boxShadow: '0 0 2px rgba(0,0,0,0.4)',
                }}
              />
            )}
            {pin.label || pin.value}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
