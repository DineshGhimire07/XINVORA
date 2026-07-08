"use client"

import { motion } from "framer-motion"
import { type MaintenanceSettings } from "@/types/settings"

export function MaintenancePage({ settings }: { settings: MaintenanceSettings }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6">
      <div className="absolute top-8 left-8">
        {/* Placeholder for real logo */}
        <div className="text-2xl font-serif font-light tracking-[0.2em] uppercase">XINVORA</div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl text-center space-y-8"
      >
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-text-primary">
          We're Improving Your Experience
        </h1>
        
        <p className="text-lg text-text-secondary leading-relaxed max-w-lg mx-auto">
          {settings.message || "Our store is currently undergoing scheduled maintenance to bring you an even better shopping experience. We'll be back shortly."}
        </p>

        {settings.expectedReturnTime && (
          <div className="pt-4 pb-2 border-t border-b border-border max-w-sm mx-auto">
            <p className="text-sm font-medium uppercase tracking-widest text-text-secondary mb-1">Expected Return Time</p>
            <p className="text-lg text-text-primary">{settings.expectedReturnTime}</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 pt-8">
          <a href="https://instagram.com/xinvora" target="_blank" rel="noreferrer" className="text-sm font-medium tracking-wide text-text-secondary hover:text-text-primary transition-colors uppercase">
            Instagram
          </a>
          <span className="text-sm font-medium tracking-wide text-text-secondary cursor-default uppercase">
            Facebook
          </span>
          <a href="https://twitter.com/xinvora" target="_blank" rel="noreferrer" className="text-sm font-medium tracking-wide text-text-secondary hover:text-text-primary transition-colors uppercase">
            Twitter
          </a>
          <a href="mailto:support@xinvora.com" className="text-sm font-medium tracking-wide text-text-secondary hover:text-text-primary transition-colors uppercase">
            Contact Us
          </a>
        </div>
      </motion.div>
    </div>
  )
}
