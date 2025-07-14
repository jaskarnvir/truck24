"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { DollarSign, Home, ReceiptText, Truck, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/expenses", label: "Expenses", icon: ReceiptText },
    { href: "/dashboard/pay", label: "Pay", icon: DollarSign },
    { href: "/dashboard/trucks", label: "Trucks", icon: Truck },
    { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <nav className="grid grid-cols-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
