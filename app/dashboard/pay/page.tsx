import { Suspense } from "react"
import { PayHeader } from "@/components/pay-header"
import { PayTable } from "@/components/pay-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function PayPage() {
  return (
    <div className="space-y-6 w-full">
      <PayHeader />

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <PayTable />
      </Suspense>
    </div>
  )
}
