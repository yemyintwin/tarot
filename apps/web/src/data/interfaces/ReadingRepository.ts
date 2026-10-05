import type { Reading } from '@tarot/shared';

export interface ReadingRepository {
  getAll(): Promise<Reading[]>;
  getById(id: string): Promise<Reading | undefined>;
  save(reading: Reading): Promise<void>;
  update(reading: Reading): Promise<void>;
  delete(id: string): Promise<void>;
}
