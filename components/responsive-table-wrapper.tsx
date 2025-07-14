"use client"

import type React from "react"

import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface ResponsiveTableWrapperProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveTableWrapper({ children, className }: ResponsiveTableWrapperProps) {
  const isMobile = useMobile()

  return (
    <div className={cn("rounded-md border w-full", className)}>
      <div className={cn("overflow-x-auto w-full", isMobile && "pb-2")}>
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}
