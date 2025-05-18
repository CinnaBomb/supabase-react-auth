import { useState } from 'react';
import { generateAIImage } from '../utils/generateAIImage';
import { Input, Button, Image, VStack, Heading } from '@chakra-ui/react';

export default function WashiGenerator({ onCompleted, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    try {
      setError('');
      const base64 = await generateAIImage(prompt, 'washi');
      const generatedImage = `data:image/png;base64,${base64}`;
      setPreview(generatedImage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUsePattern = () => {
    // Pass the generated image back with a prefix so that it can be recognized as a washi tape pin.
    if (preview && onCompleted) {
      onCompleted(`washi:${preview}`);
      onClose(); // Close the modal after selection
    }
  };

  return (
    <VStack spacing={4}>
      <Heading size="md">Washi Tape Generator</Heading>
      <Input
        placeholder="Enter prompt for washi tape pattern"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button colorScheme="blue" onClick={handleGenerate}>
        Generate Washtape
      </Button>
      {preview && <Image src={preview} boxSize="300px" alt="Generated washi" />}
      {preview && (
        <Button colorScheme="green" onClick={handleUsePattern}>
          Use This Pattern
        </Button>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </VStack>
  );
}
