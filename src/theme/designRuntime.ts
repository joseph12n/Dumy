export type UiPreset = "candy" | "emerald" | "ocean";
export type UiDensity = "compact" | "comfortable";
export type UiRadius = "sharp" | "soft" | "rounded";
export type UiThemeMode = "light" | "dark" | "system";

export interface GradientConfig {
  colors: [string, string];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export interface ShadowConfig {
  color: string;
  offset: { width: number; height: number };
  opacity: number;
  radius: number;
  elevation: number;
}

export interface UnifiedDesignPreset {
  id: string;
  title: string;
  subtitle: string;
  theme: UiThemeMode;
  uiPreset: UiPreset;
  accentColor: string;
  density: UiDensity;
  radius: UiRadius;
  fontScale: "0.95" | "1" | "1.15";
}

export const UNIFIED_DESIGN_PRESETS: UnifiedDesignPreset[] = [
  {
    id: "quick-candy",
    title: "Candy Flow",
    subtitle: "Calido, amigable y expresivo",
    theme: "light",
    uiPreset: "candy",
    accentColor: "#e040a0",
    density: "comfortable",
    radius: "rounded",
    fontScale: "1",
  },
  {
    id: "quick-emerald",
    title: "Emerald Calm",
    subtitle: "Natural, limpio y estable",
    theme: "light",
    uiPreset: "emerald",
    accentColor: "#02735E",
    density: "compact",
    radius: "soft",
    fontScale: "0.95",
  },
  {
    id: "quick-ocean",
    title: "Ocean Focus",
    subtitle: "Tecnico, claro y enfocado",
    theme: "light",
    uiPreset: "ocean",
    accentColor: "#0096cc",
    density: "compact",
    radius: "sharp",
    fontScale: "0.95",
  },
  {
    id: "quick-night",
    title: "Night Pro",
    subtitle: "Contraste alto para sesiones largas",
    theme: "dark",
    uiPreset: "ocean",
    accentColor: "#4db8e5",
    density: "comfortable",
    radius: "soft",
    fontScale: "1",
  },
];

export const QUICK_UNIFIED_DESIGN_PRESETS = UNIFIED_DESIGN_PRESETS;

export interface DesignPalette {
  primary: string;
  secondary: string;
  backgroundLight: string;
  backgroundDark: string;
  textLight: string;
  textDark: string;
  borderLight: string;
  borderDark: string;
  surfaceLight: string;
  surfaceDark: string;
}

export interface RuntimeDesign {
  preset: UiPreset;
  accentColor: string;
  density: UiDensity;
  radius: UiRadius;
  fontScale: number;
  palette: DesignPalette;
  gradients: {
    hero: GradientConfig;
    secondary: GradientConfig;
    accent: GradientConfig;
  };
  shadows: {
    card: ShadowConfig;
    hero: ShadowConfig;
    button: ShadowConfig;
  };
}

const PRESET_PALETTES: Record<UiPreset, DesignPalette> = {
  candy: {
    primary: "#e040a0",
    secondary: "#7c52aa",
    backgroundLight: "#fef7ff",
    backgroundDark: "#2e1a28",
    textLight: "#2e1a28",
    textDark: "#fef7ff",
    borderLight: "#dcc8e0",
    borderDark: "#604868",
    surfaceLight: "#f8eef8",
    surfaceDark: "#3a2533",
  },
  emerald: {
    primary: "#02735E",
    secondary: "#034159",
    backgroundLight: "#f2faf7",
    backgroundDark: "#0b2824",
    textLight: "#12352f",
    textDark: "#e9fff6",
    borderLight: "#9fd5c8",
    borderDark: "#2a5f56",
    surfaceLight: "#e7f6f1",
    surfaceDark: "#173c36",
  },
  ocean: {
    primary: "#0096cc",
    secondary: "#005f85",
    backgroundLight: "#f3fbff",
    backgroundDark: "#11202a",
    textLight: "#193342",
    textDark: "#ecf8ff",
    borderLight: "#b7dbea",
    borderDark: "#36596a",
    surfaceLight: "#e7f5fc",
    surfaceDark: "#223744",
  },
};

const VALID_PRESETS: UiPreset[] = ["candy", "emerald", "ocean"];
const VALID_DENSITY: UiDensity[] = ["compact", "comfortable"];
const VALID_RADIUS: UiRadius[] = ["sharp", "soft", "rounded"];

function parseFontScale(value: string | undefined): number {
  const parsed = Number(value ?? "1");
  if (Number.isNaN(parsed)) return 1;
  return Math.min(Math.max(parsed, 0.9), 1.25);
}

function buildGradients(
  primary: string,
  secondary: string,
): RuntimeDesign["gradients"] {
  return {
    hero: {
      colors: [primary, secondary],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    secondary: {
      colors: [secondary, "#0096cc"],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0.5 },
    },
    accent: {
      colors: [primary, blendColor(primary, "#ff6b6b", 0.5)],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
  };
}

function buildShadows(
  primary: string,
  secondary: string,
): RuntimeDesign["shadows"] {
  return {
    card: {
      color: secondary,
      offset: { width: 0, height: 4 },
      opacity: 0.12,
      radius: 12,
      elevation: 4,
    },
    hero: {
      color: primary,
      offset: { width: 0, height: 8 },
      opacity: 0.25,
      radius: 24,
      elevation: 8,
    },
    button: {
      color: primary,
      offset: { width: 0, height: 4 },
      opacity: 0.2,
      radius: 12,
      elevation: 4,
    },
  };
}

function blendColor(hex1: string, hex2: string, ratio: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function applyShadow(shadow: ShadowConfig) {
  return {
    shadowColor: shadow.color,
    shadowOffset: shadow.offset,
    shadowOpacity: shadow.opacity,
    shadowRadius: shadow.radius,
    elevation: shadow.elevation,
  };
}

export function resolveRuntimeDesign(
  settings: Record<string, string>,
): RuntimeDesign {
  const rawPreset = settings["ui_preset"] as UiPreset | undefined;
  const preset = VALID_PRESETS.includes(rawPreset as UiPreset)
    ? (rawPreset as UiPreset)
    : "candy";

  const palette = PRESET_PALETTES[preset];
  const accentColor = settings["accent_color"] || palette.primary;

  const rawDensity = settings["ui_density"] as UiDensity | undefined;
  const density = VALID_DENSITY.includes(rawDensity as UiDensity)
    ? (rawDensity as UiDensity)
    : "comfortable";

  const rawRadius = settings["ui_radius"] as UiRadius | undefined;
  const radius = VALID_RADIUS.includes(rawRadius as UiRadius)
    ? (rawRadius as UiRadius)
    : "soft";

  const gradients = buildGradients(accentColor, palette.secondary);
  const shadows = buildShadows(accentColor, palette.secondary);

  return {
    preset,
    accentColor,
    density,
    radius,
    fontScale: parseFontScale(settings["ui_font_scale"]),
    palette: {
      ...palette,
      primary: accentColor,
    },
    gradients,
    shadows,
  };
}

export function getCardPadding(density: UiDensity): number {
  return density === "compact" ? 12 : 16;
}

export function getButtonPadding(
  size: "sm" | "md" | "lg",
  density: UiDensity,
): { px: number; py: number } {
  const compact = density === "compact";
  if (size === "sm") return { px: compact ? 12 : 16, py: compact ? 7 : 8 };
  if (size === "lg") return { px: compact ? 20 : 28, py: compact ? 10 : 14 };
  return { px: compact ? 16 : 24, py: compact ? 9 : 12 };
}

export function getCornerRadius(
  radius: UiRadius,
  target: "card" | "button" | "pill",
): number {
  if (target === "pill") {
    if (radius === "sharp") return 12;
    if (radius === "soft") return 20;
    return 999;
  }

  if (target === "button") {
    if (radius === "sharp") return 8;
    if (radius === "soft") return 14;
    return 22;
  }

  if (radius === "sharp") return 8;
  if (radius === "soft") return 16;
  return 24;
}

export function scaleFont(base: number, fontScale: number): number {
  return Math.round(base * fontScale);
}

export function toRgba(hexColor: string, alpha: number): string {
  const raw = hexColor.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => `${c}${c}`)
          .join("")
      : raw;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
