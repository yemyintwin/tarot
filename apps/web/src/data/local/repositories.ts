import { CardSchema, SettingsSchema, type Card, type Reading, type Settings } from '@tarot/shared';
import type { CardRepository } from '../interfaces/CardRepository';
import type { ReadingRepository } from '../interfaces/ReadingRepository';
import type { SettingsRepository } from '../interfaces/SettingsRepository';
import { database } from './db';

const defaultSettings: Settings = {
  theme: 'dark',
  language: 'en',
  allowReversed: true,
  reducedMotion: false,
};

let cardDataPromise: Promise<Card[]> | undefined;

function loadCardData() {
  if (!cardDataPromise) {
    cardDataPromise = fetch('/cards.json')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load card data (HTTP ${response.status}).`);
        }
        const result = CardSchema.array().safeParse(await response.json());
        if (!result.success) {
          throw new Error(
            `Card data is invalid: ${result.error.issues[0]?.message ?? 'unknown schema error'}`,
          );
        }
        return result.data;
      })
      .catch((error: unknown) => {
        cardDataPromise = undefined;
        throw error;
      });
  }
  return cardDataPromise;
}

export class StaticCardRepository implements CardRepository {
  async getAll() {
    return loadCardData();
  }

  async getById(id: string) {
    return (await loadCardData()).find((card) => card.id === id);
  }
}

export class DexieReadingRepository implements ReadingRepository {
  async getAll() {
    return database.readings.orderBy('createdAt').reverse().toArray();
  }

  async getById(id: string) {
    return database.readings.get(id);
  }

  async save(reading: Reading) {
    await database.readings.add(reading);
  }

  async update(reading: Reading) {
    const existing = await database.readings.get(reading.id);
    if (!existing) {
      throw new Error(`Reading "${reading.id}" was not found.`);
    }
    await database.readings.put(reading);
  }

  async delete(id: string) {
    await database.readings.delete(id);
  }
}

export class DexieSettingsRepository implements SettingsRepository {
  async get() {
    const stored = await database.settings.get('current');
    if (!stored) {
      return defaultSettings;
    }
    const { id: _id, ...settings } = stored;
    return SettingsSchema.parse(settings);
  }

  async save(settings: Settings) {
    await database.settings.put({ ...SettingsSchema.parse(settings), id: 'current' });
  }
}

export const cardRepository = new StaticCardRepository();
export const readingRepository = new DexieReadingRepository();
export const settingsRepository = new DexieSettingsRepository();
