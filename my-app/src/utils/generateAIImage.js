// src/utils/generateAIImage.js
export async function generateAIImage(prompt, type = 'washi') {
  const response = await fetch('https://ai-image-worker.laura-stephens2323.workers.dev', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, type }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI generation failed: ${response.status} ${text}`);
  }

  const { result } = await response.json();
  return result; // base64 string
}
