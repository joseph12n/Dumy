export const BRAND_COLORS = {
  primary: "#e040a0",
  primarySoft: "#ffd6ee",
  secondary: "#7c52aa",
  accent: "#0096cc",
  background: "#fef7ff",
  surface: "#f8eef8",
  text: "#2e1a28",
  textMuted: "#604868",
  outline: "#dcc8e0",
  success: "#0ea5a5",
  warning: "#f59e0b",
  danger: "#e53e3e",
} as const;

export const BRAND_TYPOGRAPHY = {
  headingWeight: "700",
  bodyWeight: "500",
  smallWeight: "400",
} as const;

export const BRAND_SHAPES = {
  cardRadius: 16,
  pillRadius: 999,
} as const;

export const BRAND_GUIDELINES = {
  voice: "Friendly, direct, calm, and practical.",
  uiMood: "Soft candy palette, rounded cards, and high legibility.",
  interaction: "Offline-first cues with explicit online/fallback status.",
  logoNote:
    "Use the official Dumy logo asset when available in assets/images and keep a monogram fallback for development.",
} as const;
