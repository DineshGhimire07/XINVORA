import type { Config } from "tailwindcss"

/**
 * tailwind.config.ts — XINVORA Design System
 *
 * This file is the single source of truth for all design tokens.
 * Every color, font, spacing, shadow, and animation duration used
 * across the project flows through here.
 *
 * Rules:
 * - Never hardcode values in components. Use these tokens.
 * - Extend, never replace. Tailwind defaults remain available.
 * - Keep names semantic (e.g. "accent", not "warm-taupe-64").
 */

const config: Config = {
  // ── Dark mode ──────────────────────────────────────────────────────────────
  // "class" strategy lets next-themes toggle dark mode programmatically
  darkMode: ["class", ".dark"],

  // ── Content paths ──────────────────────────────────────────────────────────
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/providers/**/*.{ts,tsx}",
    "./src/animations/**/*.{ts,tsx}",
  ],

  theme: {
    // ── Containers ──────────────────────────────────────────────────────────
    // Custom container replaces Tailwind default
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
        lg: "2.5rem",
        xl: "3rem",
        "2xl": "4rem",
      },
    },

    extend: {
      // ── Color Tokens ──────────────────────────────────────────────────────
      // All values reference CSS custom properties defined in globals.css.
      // This allows runtime theme switching (light ↔ dark) with zero JS.
      colors: {
        // Background layers
        background: "hsl(var(--color-background))",
        surface: "hsl(var(--color-surface))",
        "surface-elevated": "hsl(var(--color-surface-elevated))",
        "surface-overlay": "hsl(var(--color-surface-overlay))",

        // Text hierarchy
        "text-primary": "hsl(var(--color-text-primary))",
        "text-secondary": "hsl(var(--color-text-secondary))",
        "text-tertiary": "hsl(var(--color-text-tertiary))",
        "text-inverse": "hsl(var(--color-text-inverse))",
        "text-disabled": "hsl(var(--color-text-disabled))",

        // Brand accent
        accent: {
          DEFAULT: "hsl(var(--color-accent))",
          hover: "hsl(var(--color-accent-hover))",
          muted: "hsl(var(--color-accent-muted))",
          foreground: "hsl(var(--color-accent-foreground))",
        },

        // Borders
        border: {
          DEFAULT: "hsl(var(--color-border))",
          strong: "hsl(var(--color-border-strong))",
          subtle: "hsl(var(--color-border-subtle))",
        },

        // Semantic states
        success: {
          DEFAULT: "hsl(var(--color-success))",
          foreground: "hsl(var(--color-success-foreground))",
          muted: "hsl(var(--color-success-muted))",
        },
        warning: {
          DEFAULT: "hsl(var(--color-warning))",
          foreground: "hsl(var(--color-warning-foreground))",
          muted: "hsl(var(--color-warning-muted))",
        },
        error: {
          DEFAULT: "hsl(var(--color-error))",
          foreground: "hsl(var(--color-error-foreground))",
          muted: "hsl(var(--color-error-muted))",
        },

        // Pure blacks — used sparingly for high-contrast moments
        ink: {
          DEFAULT: "hsl(var(--color-ink))",
          soft: "hsl(var(--color-ink-soft))",
        },

        // Shadcn compatibility tokens
        card: {
          DEFAULT: "hsl(var(--color-surface))",
          foreground: "hsl(var(--color-text-primary))",
        },
        popover: {
          DEFAULT: "hsl(var(--color-surface))",
          foreground: "hsl(var(--color-text-primary))",
        },
        primary: {
          DEFAULT: "hsl(var(--color-ink))",
          foreground: "hsl(var(--color-text-inverse))",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-surface-elevated))",
          foreground: "hsl(var(--color-text-primary))",
        },
        muted: {
          DEFAULT: "hsl(var(--color-surface-elevated))",
          foreground: "hsl(var(--color-text-secondary))",
        },
        destructive: {
          DEFAULT: "hsl(var(--color-error))",
          foreground: "hsl(var(--color-error-foreground))",
        },
        input: "hsl(var(--color-border))",
        ring: "hsl(var(--color-accent))",
        foreground: "hsl(var(--color-text-primary))",
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        // Display / Editorial — large headings, brand moments
        display: ["var(--font-display)", "Georgia", "serif"],
        // Body / UI — all body copy, labels, UI text
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Monospace — code, tracking numbers, SKUs
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },

      fontSize: {
        // Display scale — editorial, large headlines
        "display-2xl": ["clamp(3.5rem, 8vw, 7.5rem)", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(3rem, 6vw, 6rem)", { lineHeight: "1.08", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2.5rem, 5vw, 4.5rem)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
        "display-sm": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.2", letterSpacing: "-0.02em" }],

        // Heading scale
        "heading-xl": ["2rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        "heading-lg": ["1.75rem", { lineHeight: "1.3", letterSpacing: "-0.015em" }],
        "heading-md": ["1.5rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        "heading-sm": ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        "heading-xs": ["1.125rem", { lineHeight: "1.45", letterSpacing: "-0.005em" }],

        // Body scale
        "body-xl": ["1.25rem", { lineHeight: "1.7" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75" }],
        "body-md": ["1rem", { lineHeight: "1.75" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.65" }],
        "body-xs": ["0.875rem", { lineHeight: "1.6" }],

        // UI scale — labels, captions, overlines
        "label-lg": ["0.9375rem", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        "label-md": ["0.875rem", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        "label-sm": ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        "caption": ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.02em" }],
        "overline": ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.12em" }],
      },

      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },

      // ── Spacing ───────────────────────────────────────────────────────────
      // Base 4px grid. Large values match our editorial, generous layout.
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
        "7.5": "1.875rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "17": "4.25rem",
        "18": "4.5rem",
        "19": "4.75rem",
        "21": "5.25rem",
        "22": "5.5rem",
        "25": "6.25rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
        "42": "10.5rem",
        "50": "12.5rem",
        "54": "13.5rem",
        "58": "14.5rem",
        "62": "15.5rem",
        "68": "17rem",
        "72": "18rem",
        "76": "19rem",
        "88": "22rem",
        "92": "23rem",
        "100": "25rem",
        "104": "26rem",
        "112": "28rem",
        "120": "30rem",
        "128": "32rem",
        "144": "36rem",
        "160": "40rem",
      },

      // ── Max Widths ────────────────────────────────────────────────────────
      maxWidth: {
        "content-xs": "20rem",
        "content-sm": "30rem",
        "content-md": "40rem",
        "content-lg": "52rem",
        "content-xl": "65rem",
        "content-2xl": "80rem",
        "content-3xl": "90rem",
        "site": "1440px",
        "editorial": "72rem",
        "prose": "65ch",
      },

      // ── Border Radius ─────────────────────────────────────────────────────
      // Restrained — premium brands avoid bubbly radii
      borderRadius: {
        "none": "0",
        "xs": "0.125rem",   // 2px
        "sm": "0.25rem",    // 4px
        DEFAULT: "0.375rem", // 6px
        "md": "0.5rem",     // 8px
        "lg": "0.75rem",    // 12px
        "xl": "1rem",       // 16px
        "2xl": "1.5rem",    // 24px
        "full": "9999px",
      },

      // ── Shadows ───────────────────────────────────────────────────────────
      // Soft, editorial shadows. No hard drop shadows.
      boxShadow: {
        "xs": "0 1px 2px 0 hsl(var(--shadow-color) / 0.04)",
        "sm": "0 1px 3px 0 hsl(var(--shadow-color) / 0.06), 0 1px 2px -1px hsl(var(--shadow-color) / 0.04)",
        DEFAULT: "0 4px 6px -1px hsl(var(--shadow-color) / 0.06), 0 2px 4px -2px hsl(var(--shadow-color) / 0.04)",
        "md": "0 6px 12px -2px hsl(var(--shadow-color) / 0.08), 0 3px 7px -3px hsl(var(--shadow-color) / 0.05)",
        "lg": "0 10px 20px -4px hsl(var(--shadow-color) / 0.08), 0 5px 10px -5px hsl(var(--shadow-color) / 0.04)",
        "xl": "0 20px 35px -8px hsl(var(--shadow-color) / 0.1), 0 8px 16px -8px hsl(var(--shadow-color) / 0.05)",
        "2xl": "0 30px 60px -12px hsl(var(--shadow-color) / 0.12)",
        "inner": "inset 0 2px 4px 0 hsl(var(--shadow-color) / 0.05)",
        "none": "none",
      },

      // ── Animation Durations ───────────────────────────────────────────────
      transitionDuration: {
        "75": "75ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
        "250": "250ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
        "600": "600ms",
        "700": "700ms",
        "800": "800ms",
        "900": "900ms",
        "1000": "1000ms",
        "1200": "1200ms",
        "1500": "1500ms",
      },

      // ── Easing Functions ──────────────────────────────────────────────────
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "in-smooth": "cubic-bezier(0.4, 0, 1, 1)",
        "out-smooth": "cubic-bezier(0, 0, 0.2, 1)",
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        "in-expo": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
        "premium": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },

      // ── Keyframe Animations ───────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "progress-grow": {
          "0%": { transform: "scaleX(0)", transformOrigin: "left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "left" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "drawer-out": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-down": "fade-down 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "slide-in-left": "slide-in-left 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin-slow 2s linear infinite",
        "drawer-in": "drawer-in 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "drawer-out": "drawer-out 0.3s cubic-bezier(0.55, 0, 1, 0.45)",
      },

      // ── Screens ───────────────────────────────────────────────────────────
      // Mobile-first breakpoints aligned to common device widths
      screens: {
        "xs": "375px",
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1440px",
        "3xl": "1920px",
      },

      // ── Z-Index Scale ─────────────────────────────────────────────────────
      zIndex: {
        "base": "0",
        "raised": "10",
        "dropdown": "100",
        "sticky": "200",
        "overlay": "300",
        "drawer": "400",
        "modal": "500",
        "toast": "600",
        "tooltip": "700",
        "max": "9999",
      },

      // ── Line Heights ──────────────────────────────────────────────────────
      lineHeight: {
        "tighter": "1.05",
        "tight": "1.2",
        "snug": "1.375",
        "normal": "1.5",
        "relaxed": "1.625",
        "loose": "2",
      },

      // ── Letter Spacing ────────────────────────────────────────────────────
      letterSpacing: {
        "tightest": "-0.04em",
        "tighter": "-0.025em",
        "tight": "-0.01em",
        "normal": "0",
        "wide": "0.025em",
        "wider": "0.05em",
        "widest": "0.1em",
        "overline": "0.12em",
        "tracked": "0.2em",
      },

      // ── Aspect Ratios ─────────────────────────────────────────────────────
      aspectRatio: {
        "product": "3 / 4",
        "editorial": "4 / 5",
        "hero": "16 / 9",
        "square": "1 / 1",
        "landscape": "16 / 9",
        "portrait": "2 / 3",
        "ultra-wide": "21 / 9",
      },

      // ── Backdrop Blur ─────────────────────────────────────────────────────
      backdropBlur: {
        "xs": "2px",
        "sm": "4px",
        "md": "8px",
        "lg": "16px",
        "xl": "24px",
        "nav": "20px",
      },
    },
  },

  plugins: [],
} satisfies Config

export default config
