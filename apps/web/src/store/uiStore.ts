import type { Reading, Settings } from '@tarot/shared';
import { create } from 'zustand';

type ReadingStage = 'question' | 'draw' | 'result';

interface UiState {
  theme: Settings['theme'];
  setTheme: (theme: Settings['theme']) => void;
  activeSpreadId: string | null;
  question: string;
  activeReading: Reading | null;
  revealedCount: number;
  shuffled: boolean;
  stage: ReadingStage;
  beginReading: (spreadId: string) => void;
  setQuestion: (question: string) => void;
  continueToDraw: () => void;
  setDrawPlan: (reading: Reading) => void;
  revealNext: () => void;
  revealAll: () => void;
  resetReading: () => void;
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
  beginReading: (spreadId) =>
    set({
      activeSpreadId: spreadId,
      question: '',
      activeReading: null,
      revealedCount: 0,
      shuffled: false,
      stage: 'question',
    }),
  setQuestion: (question) => set({ question }),
  continueToDraw: () => set({ stage: 'draw' }),
  setDrawPlan: (reading) =>
    set({
      activeReading: reading,
      revealedCount: 0,
      shuffled: true,
      stage: 'draw',
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
  resetReading: () =>
    set({
      activeSpreadId: null,
      question: '',
      activeReading: null,
      revealedCount: 0,
      shuffled: false,
      stage: 'question',
    }),
}));
