/**
 * components/shared/primitives.ts — XINVORA Shared Layout Constants
 *
 * Shared constants used by layout primitives (Grid, Stack).
 * Centralizes gap token mappings to prevent duplication.
 */

export const gapMap = {
  0: "gap-0",
  0.5: "gap-0.5",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
  20: "gap-20",
  24: "gap-24",
  32: "gap-32",
  40: "gap-40",
  48: "gap-48",
  64: "gap-64",
} as const

export type GapSize = keyof typeof gapMap
