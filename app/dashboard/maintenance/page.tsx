import { Suspense } from "react"
import { MaintenanceHeader } from "@/components/maintenance-header"
import { MaintenanceTable } from "@/components/maintenance-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function MaintenancePage() {
  return (
    <div className="space-y-6 w-full">
      <MaintenanceHeader />

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <MaintenanceTable />
      </Suspense>
    </div>
  )
}
