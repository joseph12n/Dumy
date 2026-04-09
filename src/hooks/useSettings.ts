/**
 * Custom hooks for user settings
 * Wraps settingsStore for component consumption
 */

import { useSettingsStore } from '../store/settingsStore';
import { ThemeType } from '../store/types';

/**
 * Get all settings and set/get operations
 */
export function useSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const getSetting = useSettingsStore((s) => s.getSetting);
  const isLoaded = useSettingsStore((s) => s.isLoaded);

  return {
    settings,
    setSetting,
    getSetting,
    isLoaded,
  };
}

/**
 * Get theme setting
 */
export function useTheme(): ThemeType {
  return useSettingsStore((s) => s.theme);
}

/**
 * Get currency locale setting (e.g., 'es-CO')
 */
export function useCurrencyLocale(): string {
  return useSettingsStore((s) => s.currencyLocale);
}

/**
 * Get onboarding completion status
 */
export function useOnboardingCompleted(): boolean {
  return useSettingsStore((s) => s.onboardingCompleted);
}

/**
 * Get a specific setting value
 */
export function useSetting(key: string, defaultValue?: string): string | undefined {
  return useSettingsStore((s) => s.getSetting(key, defaultValue));
}

/**
 * Get settings loading state
 */
export function useSettingsLoading(): boolean {
  return !useSettingsStore((s) => s.isLoaded);
}

/**
 * Get all settings as a Record
 */
export function useAllSettings(): Record<string, string> {
  return useSettingsStore((s) => s.settings);
}

/**
 * Hook to update theme
 */
export function useSetTheme() {
  const setSetting = useSettingsStore((s) => s.setSetting);

  return async (theme: ThemeType) => {
    await setSetting('theme', theme);
  };
}

/**
 * Hook to update currency locale
 */
export function useSetCurrencyLocale() {
  const setSetting = useSettingsStore((s) => s.setSetting);

  return async (locale: string) => {
    await setSetting('currency_locale', locale);
  };
}

/**
 * Hook to mark onboarding as completed
 */
export function useCompleteOnboarding() {
  const setSetting = useSettingsStore((s) => s.setSetting);

  return async () => {
    await setSetting('onboarding_completed', 'true');
  };
}

/**
 * Hook to update a generic setting
 */
export function useUpdateSetting() {
  const setSetting = useSettingsStore((s) => s.setSetting);

  return async (key: string, value: string) => {
    await setSetting(key, value);
  };
}
