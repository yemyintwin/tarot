import { afterEach, describe, expect, it } from 'vitest';
import { useUiStore } from './uiStore';

const reading = {
  id: '00000000-0000-4000-8000-000000000001',
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  spreadId: 'one-card',
  cards: [{ position: 0, cardId: 'major-00-fool', reversed: false }],
};

describe('reading interpretation state', () => {
  afterEach(() => {
    useUiStore.getState().resetReading();
  });

  it('keeps a generated interpretation through result navigation and replaces it on regeneration', () => {
    const store = useUiStore.getState();
    store.beginReading('one-card');
    store.setDrawPlan(reading);

    expect(store.beginInterpretation(reading.id)).toBe(true);
    useUiStore.getState().setInterpretation(reading.id, 'First reflection');

    expect(useUiStore.getState().interpretations[reading.id]?.text).toBe('First reflection');
    expect(useUiStore.getState().beginInterpretation(reading.id)).toBe(true);
    expect(useUiStore.getState().interpretations[reading.id]).toMatchObject({
      text: 'First reflection',
      regenerationsUsed: 1,
      isPending: true,
    });
    expect(useUiStore.getState().beginInterpretation(reading.id)).toBe(false);
    useUiStore.getState().setInterpretation(reading.id, 'Updated reflection');
    expect(useUiStore.getState().interpretations[reading.id]).toMatchObject({
      text: 'Updated reflection',
      isPending: false,
    });
  });

  it('clears the active interpretation when the reading is restarted', () => {
    const store = useUiStore.getState();
    store.beginReading('one-card');
    store.setDrawPlan(reading);
    store.beginInterpretation(reading.id);
    useUiStore.getState().setInterpretation(reading.id, 'Reflection');

    useUiStore.getState().resetReading();

    expect(useUiStore.getState().interpretations[reading.id]).toBeUndefined();
  });

  it('keeps the interpretation when the reading is saved', () => {
    const store = useUiStore.getState();
    store.beginReading('one-card');
    store.setDrawPlan(reading);
    store.beginInterpretation(reading.id);
    useUiStore.getState().setInterpretation(reading.id, 'Saved reading reflection');

    useUiStore.getState().resetReading(false);

    expect(useUiStore.getState().interpretations[reading.id]?.text).toBe(
      'Saved reading reflection',
    );
  });
});
