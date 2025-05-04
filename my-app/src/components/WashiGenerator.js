import { useState } from 'react';
import { generateAIImage } from '../utils/generateAIImage';
import { Input, Button, Image, VStack, Heading } from '@chakra-ui/react';

export default function WashiGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    try {
      setError('');
      const base64 = await generateAIImage(prompt, 'washi');
      setImage(`data:image/png;base64,${base64}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <VStack spacing={4}>
      <Heading size="md">Washi Tape Generator</Heading>
      <Input
        placeholder="floral red pattern with sakura blossoms"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button colorScheme="blue" onClick={handleGenerate}>
        Generate Washi
      </Button>
      {image && <Image src={image} boxSize="300px" alt="Generated washi" />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </VStack>
  );
}
