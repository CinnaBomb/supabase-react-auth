import { Menu } from '@mantine/core';

const availablePins = ['red', 'blue', 'green', 'gold', 'cat-paw'];

export default function PinSelector({ noteId, currentPin, updateLocalPin }) {
  return (
    <Menu shadow="md" width={160} position="right-start" withArrow withinPortal={false}>
      <Menu.Target>
        <div
          className="pin-circle"
          style={{ backgroundColor: currentPin || 'red' }}
        />
      </Menu.Target>

      <Menu.Dropdown>
        {availablePins.map((pin) => (
          <Menu.Item
            key={pin}
            onClick={() => updateLocalPin(noteId, pin)}
            style={{ backgroundColor: pin, color: '#fff' }}
          >
            {pin}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
