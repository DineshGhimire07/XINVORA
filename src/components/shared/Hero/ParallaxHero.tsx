"use client"

import * as React from "react"
import Image from "next/image"

interface ParallaxHeroProps {
  src: string
  alt: string
}

export function ParallaxHero({ src, alt }: ParallaxHeroProps) {
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse coordinates from -1 to 1 relative to center
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
      
      // Maximum shift is 4px
      setOffset({
        x: x * 4,
        y: y * 4
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
      {/* Parallax image container */}
      <div 
        className="relative w-[102%] h-[102%] -left-[1%] -top-[1%] transition-transform duration-700 ease-out"
        style={{ 
          transform: `translate(${offset.x}px, ${offset.y}px)` 
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority
          className="object-cover object-[80%_center]"
        />
      </div>

      {/* 2% subtle organic film grain overlay via inline SVG noise */}
      <div 
        className="absolute inset-0 pointer-events-none z-[1] opacity-[0.025]"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)"/%3E%3C/svg%3E')`
        }}
      />
    </div>
  )
}
