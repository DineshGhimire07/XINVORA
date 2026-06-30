/**
 * animations/motion-variants.ts — XINVORA Framer Motion Presets
 *
 * Reusable Variants for the Framer Motion animation library.
 * Import these into animation wrapper components — never define
 * variants inline inside UI components.
 *
 * Design principle: All animations must feel calm and elegant.
 * No bouncing, no exaggerated spring, no fast flickers.
 * Every animation respects prefers-reduced-motion (handled at component level).
 *
 * Usage:
 *   <motion.div variants={fadeUp} initial="hidden" animate="visible" />
 */

import type { Variants, Transition } from "framer-motion"

// ── Shared Transitions ────────────────────────────────────────────────────────
export const transitions = {
  /** Default smooth transition — most UI elements */
  smooth: {
    duration: 0.5,
    ease: [0.25, 0.46, 0.45, 0.94],
  } satisfies Transition,

  /** Quick transition — small UI elements, hover states */
  quick: {
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1],
  } satisfies Transition,

  /** Slow, cinematic — hero reveals, editorial moments */
  cinematic: {
    duration: 1.0,
    ease: [0.19, 1, 0.22, 1],
  } satisfies Transition,

  /** Spring — interactive feedback (button press, card lift) */
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  } satisfies Transition,

  /** Gentle spring — drawer, modal open */
  gentleSpring: {
    type: "spring",
    stiffness: 200,
    damping: 28,
    mass: 1,
  } satisfies Transition,

  /** Page transitions */
  page: {
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94],
  } satisfies Transition,
} as const

// ── Fade Up ───────────────────────────────────────────────────────────────────
// Most common reveal — content scrolling into view from slightly below
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: transitions.quick,
  },
}

// ── Fade Down ─────────────────────────────────────────────────────────────────
export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
  exit: { opacity: 0, y: -16, transition: transitions.quick },
}

// ── Fade In ───────────────────────────────────────────────────────────────────
// Simple opacity reveal — overlays, images
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.smooth },
  exit: { opacity: 0, transition: transitions.quick },
}

// ── Fade In Slow ──────────────────────────────────────────────────────────────
export const fadeInSlow: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.cinematic },
  exit: { opacity: 0, transition: transitions.smooth },
}

// ── Scale In ──────────────────────────────────────────────────────────────────
// Cards, modals — subtle scale from slightly smaller
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitions.smooth },
  exit: { opacity: 0, scale: 0.98, transition: transitions.quick },
}

// ── Scale Up (hover) ──────────────────────────────────────────────────────────
export const hoverLift: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.01,
    transition: transitions.quick,
  },
  tap: {
    scale: 0.99,
    transition: { duration: 0.1 },
  },
}

// ── Slide In from Right ───────────────────────────────────────────────────────
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: transitions.smooth },
  exit: { opacity: 0, x: 32, transition: transitions.quick },
}

// ── Slide In from Left ────────────────────────────────────────────────────────
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: transitions.smooth },
  exit: { opacity: 0, x: -32, transition: transitions.quick },
}

// ── Stagger Container ─────────────────────────────────────────────────────────
// Wrap a list of elements to stagger their children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// ── Stagger Container (slow) ──────────────────────────────────────────────────
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

// ── Page Transition ───────────────────────────────────────────────────────────
// Wraps entire page content during route changes
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...transitions.page,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: transitions.quick,
  },
}

// ── Image Reveal ──────────────────────────────────────────────────────────────
// Clip-path reveal — editorial image entrances
export const imageReveal: Variants = {
  hidden: {
    clipPath: "inset(0 100% 0 0)",
    opacity: 0,
  },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: {
      clipPath: { duration: 0.9, ease: [0.19, 1, 0.22, 1] },
      opacity: { duration: 0.3 },
    },
  },
}

// ── Image Scale Reveal ────────────────────────────────────────────────────────
// Scale from slightly zoomed in — cinematic image load
export const imageScaleReveal: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.cinematic,
  },
}

// ── Drawer (mobile menu) ──────────────────────────────────────────────────────
export const drawerVariants: Variants = {
  closed: {
    x: "-100%",
    transition: {
      type: "tween",
      duration: 0.35,
      ease: [0.4, 0, 1, 1],
    },
  },
  open: {
    x: "0%",
    transition: {
      type: "tween",
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

// ── Overlay (drawer/modal backdrop) ──────────────────────────────────────────
export const overlayVariants: Variants = {
  closed: { opacity: 0, transition: { duration: 0.3 } },
  open: { opacity: 1, transition: { duration: 0.4 } },
}

// ── Navbar (hide on scroll down, show on scroll up) ──────────────────────────
export const navbarVariants: Variants = {
  visible: {
    y: 0,
    transition: {
      type: "tween",
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  hidden: {
    y: "-100%",
    transition: {
      type: "tween",
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
}
