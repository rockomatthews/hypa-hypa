export const COLORS = {
  black: "#050505",
  blue: "#1246D8",
  yellow: "#FFD81A",
  white: "#FFFFFF",
} as const;

export type Accent = keyof typeof COLORS;

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
} as const;
