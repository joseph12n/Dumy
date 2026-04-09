import { create } from 'zustand';
import { ThemeType } from './types';
import { loadFromStorage, saveToStorage } from './storage';

const STORAGE_KEY = 'dumy-settings';

interface SettingsState {
  settings: Record<string, string>;

  setSetting: (key: string, value: string) => void;
  getSetting: (key: string, defaultValue?: string) => string | undefined;

  // Typed accessors
  theme: ThemeType;
  currencyLocale: string;
  onboardingCompleted: boolean;
  monthlySalary: number;
}

const saved = loadFromStorage<Record<string, string>>(STORAGE_KEY, {});

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: saved,

  setSetting: (key, value) => {
    set((s) => ({ settings: { ...s.settings, [key]: value } }));
  },

  getSetting: (key, defaultValue) => {
    return get().settings[key] ?? defaultValue;
  },

  get theme(): ThemeType {
    return (get().settings['theme'] || 'system') as ThemeType;
  },

  get currencyLocale(): string {
    return get().settings['currency_locale'] || 'es-CO';
  },

  get onboardingCompleted(): boolean {
    return get().settings['onboarding_completed'] === 'true';
  },

  get monthlySalary(): number {
    const val = get().settings['monthly_salary'];
    return val ? parseInt(val, 10) : 0;
  },
}));

// Auto-persist
useSettingsStore.subscribe((state) => {
  saveToStorage(STORAGE_KEY, state.settings);
});
