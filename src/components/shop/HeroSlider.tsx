"use client"

import * as React from "react"
import Link from "next/link"
import { ParallaxHero } from "@/components/shared/Hero/ParallaxHero"
import { Section } from "@/components/shared/section"
import { cn } from "@/lib/utils"

interface HeroSlide {
  id: string
  eyebrow: string
  titleLine1: string
  titleLine2: string
  titleLine3: string
  description: React.ReactNode
  linkText: string
  linkUrl: string
  image: string
}

const placeholderSlides: HeroSlide[] = [
  {
    id: "slide-1",
    eyebrow: "Curated Living",
    titleLine1: "Crafted for",
    titleLine2: "Those Who",
    titleLine3: "Live Beautifully.",
    description: (
      <>
        Objects of quiet luxury.
        <br />
        Designed to live beautifully.
      </>
    ),
    linkText: "Discover Piece",
    linkUrl: "/collections",
    image: "/assets/brand/hero/hero-bg.png",
  },
  {
    id: "slide-2",
    eyebrow: "Curated Living",
    titleLine1: "Crafted for",
    titleLine2: "Those Who",
    titleLine3: "Live Beautifully.",
    description: (
      <>
        Objects of quiet luxury.
        <br />
        Designed to live beautifully.
      </>
    ),
    linkText: "Discover Piece",
    linkUrl: "/collections",
    image: "/assets/brand/hero/hero-bg.png",
  },
  {
    id: "slide-3",
    eyebrow: "Curated Living",
    titleLine1: "Crafted for",
    titleLine2: "Those Who",
    titleLine3: "Live Beautifully.",
    description: (
      <>
        Objects of quiet luxury.
        <br />
        Designed to live beautifully.
      </>
    ),
    linkText: "Discover Piece",
    linkUrl: "/collections",
    image: "/assets/brand/hero/hero-bg.png",
  },
]

export function HeroSlider({ heroLink }: { heroLink: string }) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  
  // Update the link of the first placeholder to use the heroLink prop if needed, 
  // but user requested static /collections link for Discover Piece.
  const slide = placeholderSlides[currentSlide]

  return (
    <Section
      id="hero"
      padding="none"
      className="relative h-[100dvh] w-full flex flex-col bg-background border-b border-border overflow-hidden select-none"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 block w-full h-full z-0"
        aria-label="View Featured Piece"
      >
        <ParallaxHero
          src={slide.image}
          alt={`Hero Background ${currentSlide + 1}`}
        />
      </div>

      {/* Content Overlay */}
      {/* Explicit standard tailwind padding to guarantee 80-96px from viewport edge on desktop */}
      <div className="relative z-10 flex flex-col justify-center w-full h-full pt-40 pb-20 md:pt-48 md:pb-24 px-6 md:px-20 lg:px-24 pointer-events-none">
        
        {/* Text Block & Indicator Wrapper to align them on the left */}
        <div className="relative h-full flex flex-col justify-center">
          
          <div className="absolute bottom-24 -right-2 sm:bottom-28 sm:right-8 md:relative md:bottom-auto md:right-auto flex flex-col items-end md:items-start max-w-[32rem] pointer-events-auto">
            {/* Eyebrow */}
            <span className="hidden md:block text-[12px] font-display font-medium tracking-[0.4em] text-text-secondary uppercase select-none opacity-80 mb-6 transition-all duration-300">
              {slide.eyebrow}
            </span>

            {/* Title */}
            <h1 className="text-[3.15rem] sm:text-[4.5rem] md:text-[5.5rem] font-playfair text-text-primary tracking-normal font-normal leading-[1.1] select-none capitalize transition-all duration-300">
              <span className="block whitespace-nowrap">{slide.titleLine1}</span>
              <span className="block whitespace-nowrap italic">{slide.titleLine2}</span>
              <span className="block whitespace-nowrap">{slide.titleLine3}</span>
            </h1>

            {/* Subtitle */}
            <p className="hidden md:block mt-8 text-body-lg md:text-[1.25rem] text-text-secondary leading-relaxed font-light font-sans max-w-[24rem] transition-all duration-300">
              {slide.description}
            </p>

            {/* CTA */}
            <div className="hidden md:block mt-12">
              <Link
                href={slide.linkUrl}
                className="group relative inline-flex items-center text-[13px] font-display font-semibold tracking-widest text-text-primary uppercase pb-2 transition-all duration-200 border-b border-text-primary/40 hover:border-text-primary"
              >
                {slide.linkText}
                <span className="opacity-0 max-w-0 translate-x-2 group-hover:opacity-100 group-hover:max-w-[20px] group-hover:translate-x-0 transition-all duration-[250ms] ease-out pl-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Slide Progress Indicator removed per user request */}
          
        </div>
      </div>
    </Section>
  )
}
