import type { Reading, Settings } from '@tarot/shared';
import { create } from 'zustand';

type ReadingStage = 'question' | 'draw' | 'result';

export const MAX_REFLECTION_REGENERATIONS = 3;

export interface ReadingInterpretation {
  text?: string;
  hasGenerated: boolean;
  regenerationsUsed: number;
  isPending: boolean;
}

interface UiState {
  theme: Settings['theme'];
  setTheme: (theme: Settings['theme']) => void;
  activeSpreadId: string | null;
  question: string;
  activeReading: Reading | null;
  revealedCount: number;
  shuffled: boolean;
  stage: ReadingStage;
  interpretations: Record<string, ReadingInterpretation>;
  beginReading: (spreadId: string) => void;
  setQuestion: (question: string) => void;
  continueToDraw: () => void;
  setDrawPlan: (reading: Reading) => void;
  revealNext: () => void;
  revealAll: () => void;
  beginInterpretation: (readingId: string) => boolean;
  setInterpretation: (readingId: string, text: string) => void;
  failInterpretation: (readingId: string) => void;
  resetReading: (clearInterpretation?: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  activeSpreadId: null,
  question: '',
  activeReading: null,
  revealedCount: 0,
  shuffled: false,
  stage: 'question',
  interpretations: {},
  beginReading: (spreadId) =>
    set((state) => {
      const interpretations = { ...state.interpretations };
      if (state.activeReading) {
        delete interpretations[state.activeReading.id];
      }
      return {
        activeSpreadId: spreadId,
        question: '',
        activeReading: null,
        revealedCount: 0,
        shuffled: false,
        stage: 'question',
        interpretations,
      };
    }),
  setQuestion: (question) => set({ question }),
  continueToDraw: () => set({ stage: 'draw' }),
  setDrawPlan: (reading) =>
    set((state) => {
      const interpretations = { ...state.interpretations };
      if (state.activeReading) {
        delete interpretations[state.activeReading.id];
      }
      return {
        activeReading: reading,
        revealedCount: 0,
        shuffled: true,
        stage: 'draw',
        interpretations,
      };
    }),
  revealNext: () =>
    set((state) => {
      if (!state.activeReading) {
        return {};
      }
      const revealedCount = Math.min(state.revealedCount + 1, state.activeReading.cards.length);
      return {
        revealedCount,
        stage: revealedCount === state.activeReading.cards.length ? 'result' : 'draw',
      };
    }),
  revealAll: () =>
    set((state) => {
      if (!state.activeReading) {
        return {};
      }
      return { revealedCount: state.activeReading.cards.length, stage: 'result' };
    }),
  beginInterpretation: (readingId) => {
    let allowed = true;
    set((state) => {
      const current = state.interpretations[readingId] ?? {
        hasGenerated: false,
        regenerationsUsed: 0,
        isPending: false,
      };
      if (
        current.isPending ||
        (current.hasGenerated && current.regenerationsUsed >= MAX_REFLECTION_REGENERATIONS)
      ) {
        allowed = false;
        return {};
      }
      return {
        interpretations: {
          ...state.interpretations,
          [readingId]: {
            ...current,
            regenerationsUsed: current.regenerationsUsed + (current.hasGenerated ? 1 : 0),
            isPending: true,
          },
        },
      };
    });
    return allowed;
  },
  setInterpretation: (readingId, text) =>
    set((state) => {
      const current = state.interpretations[readingId] ?? {
        hasGenerated: false,
        regenerationsUsed: 0,
        isPending: false,
      };
      return {
        interpretations: {
          ...state.interpretations,
          [readingId]: { ...current, text, hasGenerated: true, isPending: false },
        },
      };
    }),
  failInterpretation: (readingId) =>
    set((state) => {
      const current = state.interpretations[readingId];
      if (!current) {
        return {};
      }
      return {
        interpretations: {
          ...state.interpretations,
          [readingId]: { ...current, isPending: false },
        },
      };
    }),
  resetReading: (clearInterpretation = true) =>
    set((state) => {
      const interpretations = { ...state.interpretations };
      if (clearInterpretation && state.activeReading) {
        delete interpretations[state.activeReading.id];
      }
      return {
        activeSpreadId: null,
        question: '',
        activeReading: null,
        revealedCount: 0,
        shuffled: false,
        stage: 'question',
        interpretations,
      };
    }),
}));
