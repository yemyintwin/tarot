import { app } from '@azure/functions';

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: () => ({
    jsonBody: { status: 'ok' },
    headers: { 'cache-control': 'no-store' },
  }),
});
