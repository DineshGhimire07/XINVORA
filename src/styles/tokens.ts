/**
 * styles/tokens.ts — XINVORA Design Tokens (TypeScript Mirror)
 *
 * This file mirrors the CSS custom properties defined in globals.css
 * as JavaScript constants. Use these whenever you need token values
 * in JS/TS contexts (Framer Motion, GSAP, Canvas, testing, etc.).
 *
 * The CSS custom properties are the authoritative source.
 * This file must stay in sync with globals.css.
 */

// ── Color Tokens ─────────────────────────────────────────────────────────────
export const colors = {
  // Backgrounds
  background: "#F8F5F0",         // Warm ivory — primary background
  surface: "#FFFFFF",            // Pure white — cards, modals
  surfaceElevated: "#FAF8F5",    // Slightly warm — elevated surfaces
  surfaceOverlay: "rgba(26, 26, 26, 0.5)", // Dark overlay for modals/drawers

  // Text hierarchy
  textPrimary: "#1A1A1A",        // Almost black — primary text
  textSecondary: "#666666",      // Muted gray — secondary text
  textTertiary: "#999999",       // Light gray — placeholders, hints
  textInverse: "#FFFFFF",        // White — text on dark backgrounds
  textDisabled: "#BBBBBB",       // Very light — disabled text

  // Brand accent (Warm Taupe)
  accent: "#A48B78",             // Primary brand accent
  accentHover: "#8F7562",        // Darker on hover
  accentMuted: "#D4C4B8",        // Lighter tint for backgrounds
  accentForeground: "#FFFFFF",   // Text on accent backgrounds

  // Borders
  border: "#ECE8E2",             // Default border — soft neutral
  borderStrong: "#D4CFC9",       // Emphasized borders
  borderSubtle: "#F5F2EE",       // Barely visible dividers

  // Semantic states
  success: "#4A7C59",
  successForeground: "#FFFFFF",
  successMuted: "#E8F2EB",
  warning: "#B8860B",
  warningForeground: "#FFFFFF",
  warningMuted: "#FFF8E1",
  error: "#C0392B",
  errorForeground: "#FFFFFF",
  errorMuted: "#FDEDEC",

  // Pure blacks
  ink: "#111111",                // Deepest black — logo, high contrast
  inkSoft: "#1A1A1A",            // Slightly softer black

  // Shadow base
  shadow: "26, 26, 26",         // HSL RGB for shadow calculations
} as const

// ── Typography Tokens ─────────────────────────────────────────────────────────
export const typography = {
  fontDisplay: "Cormorant Garamond",
  fontSans: "Manrope",
  fontMono: "JetBrains Mono",

  // Font weights
  weight: {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  } as const,

  // Line heights
  lineHeight: {
    tighter: 1.05,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  } as const,
} as const

// ── Spacing Scale ─────────────────────────────────────────────────────────────
// Base unit: 4px (0.25rem)
export const spacing = {
  0: "0",
  0.5: "0.125rem",   // 2px
  1: "0.25rem",      // 4px
  2: "0.5rem",       // 8px
  3: "0.75rem",      // 12px
  4: "1rem",         // 16px
  5: "1.25rem",      // 20px
  6: "1.5rem",       // 24px
  8: "2rem",         // 32px
  10: "2.5rem",      // 40px
  12: "3rem",        // 48px
  16: "4rem",        // 64px
  20: "5rem",        // 80px
  24: "6rem",        // 96px
  32: "8rem",        // 128px
  40: "10rem",       // 160px
  48: "12rem",       // 192px
  64: "16rem",       // 256px
} as const

// ── Border Radius ─────────────────────────────────────────────────────────────
export const radius = {
  none: "0",
  xs: "0.125rem",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const

// ── Animation Durations ───────────────────────────────────────────────────────
export const duration = {
  instant: 75,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
  cinematic: 1500,
} as const

// ── Easing Functions ──────────────────────────────────────────────────────────
export const easing = {
  smooth: [0.4, 0, 0.2, 1],
  inSmooth: [0.4, 0, 1, 1],
  outSmooth: [0, 0, 0.2, 1],
  spring: [0.34, 1.56, 0.64, 1],
  outExpo: [0.19, 1, 0.22, 1],
  premium: [0.25, 0.46, 0.45, 0.94],
} as const

// ── Breakpoints ───────────────────────────────────────────────────────────────
export const breakpoints = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
  "3xl": 1920,
} as const

// ── Z-Index Scale ─────────────────────────────────────────────────────────────
export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  drawer: 400,
  modal: 500,
  toast: 600,
  tooltip: 700,
  max: 9999,
} as const

// ── Shadow Scale ──────────────────────────────────────────────────────────────
export const shadows = {
  xs: "0 1px 2px 0 rgba(26, 26, 26, 0.04)",
  sm: "0 1px 3px 0 rgba(26, 26, 26, 0.06), 0 1px 2px -1px rgba(26, 26, 26, 0.04)",
  md: "0 6px 12px -2px rgba(26, 26, 26, 0.08), 0 3px 7px -3px rgba(26, 26, 26, 0.05)",
  lg: "0 10px 20px -4px rgba(26, 26, 26, 0.08), 0 5px 10px -5px rgba(26, 26, 26, 0.04)",
  xl: "0 20px 35px -8px rgba(26, 26, 26, 0.1), 0 8px 16px -8px rgba(26, 26, 26, 0.05)",
} as const

// ── Type exports ──────────────────────────────────────────────────────────────
export type ColorToken = keyof typeof colors
export type SpacingToken = keyof typeof spacing
export type DurationToken = keyof typeof duration
export type EasingToken = keyof typeof easing
export type BreakpointToken = keyof typeof breakpoints
