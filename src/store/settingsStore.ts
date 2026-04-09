import { create } from 'zustand';
import { ThemeType } from './types';
import { getDatabase } from './database';

interface SettingsState {
  settings: Record<string, string>;
  isLoaded: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  setSetting: (key: string, value: string) => Promise<void>;
  getSetting: (key: string, defaultValue?: string) => string | undefined;

  // Typed accessors
  theme: ThemeType;
  currencyLocale: string;
  onboardingCompleted: boolean;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  isLoaded: false,

  loadSettings: async () => {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<{ key: string; value: string }>(
        'SELECT key, value FROM user_settings',
      );

      const settings: Record<string, string> = {};
      for (const row of rows) {
        settings[row.key] = row.value;
      }

      set({ settings, isLoaded: true });
      console.log('[SettingsStore] Settings loaded');
    } catch (error) {
      console.error('[SettingsStore] Error loading settings:', error);
      set({ isLoaded: true });
    }
  },

  setSetting: async (key, value) => {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
        [key, value],
      );

      set((state) => ({
        settings: { ...state.settings, [key]: value },
      }));

      console.log('[SettingsStore] Setting saved:', key);
    } catch (error) {
      console.error('[SettingsStore] Error saving setting:', error);
      throw error;
    }
  },

  getSetting: (key, defaultValue) => {
    return get().settings[key] ?? defaultValue;
  },

  get theme(): ThemeType {
    const value = get().settings['theme'] || 'system';
    return value as ThemeType;
  },

  get currencyLocale(): string {
    return get().settings['currency_locale'] || 'es-CO';
  },

  get onboardingCompleted(): boolean {
    return get().settings['onboarding_completed'] === 'true';
  },
}));
