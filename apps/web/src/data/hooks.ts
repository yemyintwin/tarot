import { SettingsSchema, type Reading, type Settings } from '@tarot/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardRepository, readingRepository, settingsRepository } from './local/repositories';

export const queryKeys = {
  cards: ['cards'] as const,
  readings: ['readings'] as const,
  reading: (id: string) => ['reading', id] as const,
  settings: ['settings'] as const,
};

export function useCards() {
  return useQuery({ queryKey: queryKeys.cards, queryFn: () => cardRepository.getAll() });
}

export function useCard(id: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.cards, id],
    queryFn: () => cardRepository.getById(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useReadings() {
  return useQuery({
    queryKey: queryKeys.readings,
    queryFn: () => readingRepository.getAll(),
  });
}

export function useReading(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reading(id ?? ''),
    queryFn: () => readingRepository.getById(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useSaveReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reading: Reading) => readingRepository.save(reading),
    onSuccess: (_result, reading) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readings });
      queryClient.invalidateQueries({ queryKey: queryKeys.reading(reading.id) });
    },
  });
}

export function useUpdateReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reading: Reading) => readingRepository.update(reading),
    onSuccess: (_result, reading) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readings });
      queryClient.invalidateQueries({ queryKey: queryKeys.reading(reading.id) });
    },
  });
}

export function useDeleteReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => readingRepository.delete(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readings });
      queryClient.removeQueries({ queryKey: queryKeys.reading(id) });
    },
  });
}

export function useSettings() {
  return useQuery({ queryKey: queryKeys.settings, queryFn: () => settingsRepository.get() });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Settings) => settingsRepository.save(SettingsSchema.parse(settings)),
    onSuccess: async (_result, settings) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      queryClient.setQueryData(queryKeys.settings, settings);
    },
  });
}
