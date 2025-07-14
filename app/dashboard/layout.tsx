import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthCheck } from "@/components/auth-check"
import { SidebarInset } from "@/components/ui/sidebar"
import { DataProvider } from "@/lib/data-context"
import { MobileNavbar } from "@/components/mobile-navbar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck>
      <DataProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex-1 w-full overflow-auto flex flex-col">
            <MobileNavbar className="md:hidden w-full" />
            <div className="p-4 flex-1 overflow-auto pb-16 md:pb-4 w-full">{children}</div>
            <MobileBottomNav />
          </SidebarInset>
        </div>
      </DataProvider>
    </AuthCheck>
  )
}
