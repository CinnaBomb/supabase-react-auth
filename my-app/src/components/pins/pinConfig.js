import RoundPin from './assets/RoundPin.png';

export const PIN_TYPES = {
  COLOR: 'color',
  IMAGE: 'image',
  WASHI: 'washi'
};

export const PIN_COLORS = {
  red: '#FF6B6B',
  blue: '#4C9AFF',
  green: '#68D391',
  gold: '#F6E05E'
};

export const availablePins = [
  { type: PIN_TYPES.COLOR, value: 'red', label: 'Red' },
  { type: PIN_TYPES.COLOR, value: 'blue', label: 'Blue' },
  { type: PIN_TYPES.COLOR, value: 'green', label: 'Green' },
  { type: PIN_TYPES.COLOR, value: 'gold', label: 'Gold' },
  // For image pins, we no longer use a custom value; instead we use the actual src.
  { type: PIN_TYPES.IMAGE, src: RoundPin, label: 'Round Pin' }
];

export const getPinImage = (pinType) => {
  if (!pinType?.startsWith('image:')) return null;
  // Remove the "image:" prefix so we get the stored src.
  const imgSrc = pinType.replace('image:', '').trim();
  // Compare using trimmed strings.
  const pin = availablePins.find(p =>
    p.type === PIN_TYPES.IMAGE &&
    p.src.toString().trim() === imgSrc
  );
  console.log('getPinImage - p.src:', pin ? pin.src.toString() : 'none', 'imgSrc:', imgSrc);
  if (!pin) {
    console.warn("No matching image pin found for", imgSrc, "—returning default RoundPin");
    // Fallback to first image pin if available.
    const defaultPin = availablePins.find(p => p.type === PIN_TYPES.IMAGE);
    return defaultPin ? defaultPin.src : null;
  }
  return pin.src;
};