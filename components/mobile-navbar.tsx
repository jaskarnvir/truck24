"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, DollarSign, Home, Menu, ReceiptText, Truck, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { motion, AnimatePresence } from "framer-motion"

export function MobileNavbar({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/expenses", label: "Expenses", icon: ReceiptText },
    { href: "/dashboard/pay", label: "Pay", icon: DollarSign },
    { href: "/dashboard/trucks", label: "Trucks", icon: Truck },
    { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  ]

  const isActive = (path: string) => pathname === path

  // Function to get the current page title based on the pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/dashboard/expenses") return "Expenses"
    if (pathname === "/dashboard/pay") return "Pay & Income"
    if (pathname === "/dashboard/trucks") return "Trucks"
    if (pathname === "/dashboard/maintenance") return "Maintenance"
    if (pathname === "/dashboard/reports") return "Reports"
    return "Trucking Tracker"
  }

  const navItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
      },
    }),
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b bg-background px-4 py-3 flex items-center justify-between w-full",
        className,
      )}
    >
      <motion.div
        className="flex items-center"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Truck className="h-5 w-5 mr-2" />
        <span className="font-semibold">{getPageTitle()}</span>
      </motion.div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </motion.div>
        </SheetTrigger>
        <SheetContent side="right" className="w-[250px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                <span className="font-semibold">Menu</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid gap-1 px-2">
                <AnimatePresence>
                  {navItems.map((item, i) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.href}
                        custom={i}
                        variants={navItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </nav>
            </div>
            <motion.div
              className="p-4 border-t"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="outline" className="w-full" onClick={signOut}>
                Sign Out
              </Button>
            </motion.div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
