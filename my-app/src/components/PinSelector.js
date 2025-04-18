import { useState } from 'react';
import supabase from '../supabase';

const availablePins = ['red', 'blue', 'green', 'gold', 'cat-paw'];

export default function PinSelector({ noteId, currentPin, updateLocalPin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuOpen(true);
    setAnchor({ x: e.pageX, y: e.pageY });
  };

  const handleChange = async (newPin) => {
    const { error } = await supabase
      .from('notes')
      .update({ pin_type: newPin })
      .eq('id', noteId);

    if (!error) {
      updateLocalPin(noteId, newPin);
      setMenuOpen(false);
    }
  };

  return (
    <>
      <div
        className="pin-circle"
        style={{ backgroundColor: currentPin || 'red' }}
        onContextMenu={handleContextMenu}
        onClick={(e) => {
          if (e.detail === 2) {
            // fallback: double click to open on mobile
            handleContextMenu(e);
          }
        }}
      />
      {menuOpen && (
        <ul
          className="pin-dropdown"
          style={{ top: anchor.y, left: anchor.x, position: 'absolute' }}
          onMouseLeave={() => setMenuOpen(false)}
        >
          {availablePins.map((pin) => (
            <li
              key={pin}
              onClick={() => handleChange(pin)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: pin,
                  display: 'inline-block',
                }}
              />
              {pin}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}