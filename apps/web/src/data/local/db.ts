import Dexie, { type Table } from 'dexie';
import type { Reading, Settings } from '@tarot/shared';

type StoredSettings = Settings & { id: 'current' };

class ArcanaDatabase extends Dexie {
  readings!: Table<Reading, string>;
  settings!: Table<StoredSettings, string>;

  constructor() {
    super('arcana');
    this.version(1).stores({
      readings: 'id, createdAt, spreadId',
      settings: 'id',
    });
  }
}

export const database = new ArcanaDatabase();
export type { StoredSettings };
