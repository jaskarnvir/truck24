import { Suspense } from "react"
import { ExpensesHeader } from "@/components/expenses-header"
import { ExpensesTable } from "@/components/expenses-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExpensesPage() {
  return (
    <div className="space-y-6 w-full">
      <ExpensesHeader />

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <ExpensesTable />
      </Suspense>
    </div>
  )
}
