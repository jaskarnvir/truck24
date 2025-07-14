import { Suspense } from "react"
import { TrucksHeader } from "@/components/trucks-header"
import { TrucksTable } from "@/components/trucks-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function TrucksPage() {
  return (
    <div className="w-full max-w-full">
      <TrucksHeader />
      <div className="mt-6 w-full">
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <TrucksTable />
        </Suspense>
      </div>
    </div>
  )
}
