import type { InterpretationRequest, InterpretationResponse } from '@tarot/shared';

export interface InterpretationRepository {
  interpret(request: InterpretationRequest): Promise<InterpretationResponse>;
}
