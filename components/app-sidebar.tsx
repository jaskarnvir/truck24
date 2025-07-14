"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, DollarSign, Home, ReceiptText, Truck, Wrench } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <Sidebar className="border-r hidden md:flex">
      <SidebarHeader className="flex items-center px-4 py-2">
        <Truck className="mr-2 h-6 w-6" />
        <span className="text-xl font-bold">Trucking Tracker</span>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
              <Link href="/dashboard">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/expenses")}>
              <Link href="/dashboard/expenses">
                <ReceiptText />
                <span>Expenses</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/pay")}>
              <Link href="/dashboard/pay">
                <DollarSign />
                <span>Pay</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/trucks")}>
              <Link href="/dashboard/trucks">
                <Truck />
                <span>Trucks</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/maintenance")}>
              <Link href="/dashboard/maintenance">
                <Wrench />
                <span>Maintenance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/reports")}>
              <Link href="/dashboard/reports">
                <BarChart3 />
                <span>Reports</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button variant="outline" className="w-full" onClick={signOut}>
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
