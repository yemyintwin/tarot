import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleInterpretation, MAX_BODY_BYTES } from './interpretation.mjs';

const PORT = Number(process.env.PORT ?? 3001);

function sendJson(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

export function createApiServer({ apiKey = process.env.GEMINI_API_KEY, fetchImpl = fetch } = {}) {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (url.pathname === '/api/health') {
      if (request.method !== 'GET') {
        response.setHeader('allow', 'GET');
        sendJson(response, 405, { error: 'Method not allowed.' });
        return;
      }
      sendJson(response, 200, { status: 'ok' });
      return;
    }

    if (url.pathname !== '/api/interpretation') {
      sendJson(response, 404, { error: 'Endpoint not found.' });
      return;
    }
    if (request.method !== 'POST') {
      response.setHeader('allow', 'POST');
      sendJson(response, 405, { error: 'Method not allowed.' });
      return;
    }

    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        sendJson(response, 413, { error: 'Request body is too large.' });
        request.resume();
        return;
      }
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
      if (typeof value === 'string') {
        headers.set(name, value);
      }
    }
    const fetchRequest = new Request(`http://localhost${url.pathname}`, {
      method: request.method,
      headers,
      body: body.length ? body : undefined,
    });
    const result = await handleInterpretation(fetchRequest, { apiKey, fetchImpl });
    response.writeHead(result.status, result.headers);
    response.end(JSON.stringify(result.jsonBody));
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createApiServer();
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Tarot API listening on http://127.0.0.1:${PORT}`);
  });
}
