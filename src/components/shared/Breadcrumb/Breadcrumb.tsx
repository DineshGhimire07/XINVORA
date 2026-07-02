/**
 * components/shared/Breadcrumb/Breadcrumb.tsx — XINVORA Reusable Breadcrumb Component
 *
 * Implements a premium, accessible navigation breadcrumb trail.
 */

import Link from "next/link"
import * as React from "react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb navigation" className="py-4 select-none">
      <ul className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-widest text-text-secondary uppercase">
        <li>
          <Link href="/" className="hover:text-text-primary transition-colors duration-150">
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <React.Fragment key={index}>
              <li className="text-text-secondary/50 font-light" aria-hidden="true">
                /
              </li>
              <li>
                {isLast || !item.href ? (
                  <span className="text-text-primary select-none font-bold" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    href={item.href} 
                    className="hover:text-text-primary transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          )
        })}
      </ul>
    </nav>
  )
}
