import { app } from '@azure/functions';
import { handleInterpretation } from '../interpretation.mjs';

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: () => ({
    jsonBody: { status: 'ok' },
    headers: { 'cache-control': 'no-store' },
  }),
});

app.http('interpretation', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  authLevel: 'anonymous',
  route: 'interpretation',
  handler: (request) => handleInterpretation(request),
});
