import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiServer } from './server.mjs';

const requestBody = {
  language: 'en',
  question: 'How can I approach a new opportunity?',
  spread: {
    name: 'One Card',
    positions: [{ label: 'Guidance', meaning: 'A perspective for this moment.' }],
  },
  cards: [
    {
      position: 0,
      positionLabel: 'Guidance',
      positionMeaning: 'A perspective for this moment.',
      name: 'The Fool',
      orientation: 'upright',
      keywords: ['beginnings', 'trust'],
      meaning: 'A fresh start and an open mind.',
    },
  ],
};

describe('interpretation API', () => {
  let server: ReturnType<typeof createApiServer> | undefined;

  afterEach(async () => {
    if (server?.listening) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => (error ? reject(error) : resolve()));
      });
    }
    server = undefined;
    vi.restoreAllMocks();
  });

  async function startApi(apiKey: string | undefined, fetchImpl?: typeof fetch) {
    server = createApiServer({ apiKey, fetchImpl });
    await new Promise<void>((resolve) => server?.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Could not start test API.');
    }
    return `http://127.0.0.1:${address.port}/api/interpretation`;
  }

  it('rejects methods other than POST', async () => {
    const endpoint = await startApi(undefined);
    const response = await fetch(endpoint);

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });

  it('rejects oversized request bodies', async () => {
    const endpoint = await startApi(undefined);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'x'.repeat(24 * 1024 + 1),
    });

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: 'Request body is too large.' });
  });

  it('rejects requests that are not JSON', async () => {
    const endpoint = await startApi(undefined);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'not json',
    });

    expect(response.status).toBe(415);
  });

  it('requires a configured server-side API key', async () => {
    const endpoint = await startApi(undefined);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'AI reflection is unavailable. Configure GEMINI_API_KEY on the API server.',
    });
  });

  it('validates the request and returns the Gemini reflection', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'Consider this a moment for openness.' }] } }],
        }),
        { status: 200 },
      ),
    );
    const endpoint = await startApi('test-key', fetchImpl);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      interpretation: 'Consider this a moment for openness.',
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('/models/gemini-3.5-flash:generateContent'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-goog-api-key': 'test-key' }),
      }),
    );
  });

  it('accepts long card meanings in keyword entries from the bundled deck', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'A reflection on a complex card.' }] } }],
        }),
        { status: 200 },
      ),
    );
    const endpoint = await startApi('test-key', fetchImpl);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...requestBody,
        cards: [{ ...requestBody.cards[0], keywords: ['x'.repeat(535)] }],
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      interpretation: 'A reflection on a complex card.',
    });
  });

  it('uses the current Flash model by default', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'A current model reflection.' }] } }],
        }),
        { status: 200 },
      ),
    );
    const endpoint = await startApi('test-key', fetchImpl);
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('/models/gemini-3.5-flash:generateContent'),
      expect.objectContaining({
        body: expect.stringContaining('"maxOutputTokens":4096'),
      }),
    );
  });

  it('does not return a truncated Gemini reflection as complete', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              finishReason: 'MAX_TOKENS',
              content: { parts: [{ text: 'This reflection ends in the middle of a' }] },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const endpoint = await startApi('test-key', fetchImpl);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Gemini cut off the reflection before it was complete. Please generate it again.',
    });
  });

  it('reports Gemini temporary unavailability clearly', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Service temporarily overloaded.' } }), {
        status: 503,
      }),
    );
    const endpoint = await startApi('test-key', fetchImpl);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'Gemini Flash is temporarily busy. Please try again in a moment.',
    });
  });

  it('rejects invalid reading data without calling Gemini', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const endpoint = await startApi('test-key', fetchImpl);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...requestBody, cards: [] }),
    });

    expect(response.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
