import { app } from '@azure/functions';
import { handleInterpretation } from '../interpretation.mjs';

app.http('interpretation', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  authLevel: 'anonymous',
  route: 'interpretation',
  handler: (request) => handleInterpretation(request),
});
