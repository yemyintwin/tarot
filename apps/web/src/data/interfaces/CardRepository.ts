import type { Card } from '@tarot/shared';

export interface CardRepository {
  getAll(): Promise<Card[]>;
  getById(id: string): Promise<Card | undefined>;
}
