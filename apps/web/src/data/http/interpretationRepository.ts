import {
  InterpretationRequestSchema,
  InterpretationResponseSchema,
  type InterpretationRequest,
  type InterpretationResponse,
} from '@tarot/shared';
import type { InterpretationRepository } from '../interfaces/InterpretationRepository';

export const interpretationRepository: InterpretationRepository = {
  async interpret(request: InterpretationRequest): Promise<InterpretationResponse> {
    const input = InterpretationRequestSchema.parse(request);
    const response = await fetch('/api/interpretation', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new Error('The AI service returned an unreadable response.');
    }

    if (!response.ok) {
      const message =
        typeof body === 'object' &&
        body !== null &&
        'error' in body &&
        typeof body.error === 'string'
          ? body.error
          : `AI reflection request failed (${response.status}).`;
      throw new Error(message);
    }

    return InterpretationResponseSchema.parse(body);
  },
};
