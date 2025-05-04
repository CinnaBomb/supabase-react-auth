export default {
  async fetch(request, env) {
    const { prompt, type = 'generic' } = await request.json();

    const result = await env.AI.run('@cf/stabilityai/stable-diffusion', {
      prompt: `${prompt} pattern for ${type}`,
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
