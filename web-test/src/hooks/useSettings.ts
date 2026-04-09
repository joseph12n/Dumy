import { useSettingsStore } from '../store/settingsStore';
import { ThemeType } from '../store/types';

export function useSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const getSetting = useSettingsStore((s) => s.getSetting);
  return { settings, setSetting, getSetting, isLoaded: true };
}

export function useTheme(): ThemeType {
  return useSettingsStore((s) => s.theme);
}

export function useCurrencyLocale(): string {
  return useSettingsStore((s) => s.currencyLocale);
}

export function useOnboardingCompleted(): boolean {
  return useSettingsStore((s) => s.onboardingCompleted);
}

export function useMonthlySalary(): number {
  return useSettingsStore((s) => s.monthlySalary);
}

export function useSetTheme() {
  const setSetting = useSettingsStore((s) => s.setSetting);
  return async (theme: ThemeType) => { setSetting('theme', theme); };
}

export function useSetCurrencyLocale() {
  const setSetting = useSettingsStore((s) => s.setSetting);
  return async (locale: string) => { setSetting('currency_locale', locale); };
}

export function useSetMonthlySalary() {
  const setSetting = useSettingsStore((s) => s.setSetting);
  return (amount: number) => { setSetting('monthly_salary', String(amount)); };
}
