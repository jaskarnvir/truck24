import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonTableProps {
  rows?: number
  columns?: number
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="w-full rounded-md border">
      <div className="border-b bg-muted/50 p-4">
        <div className="flex items-center space-x-4">
          {Array(columns)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
        </div>
      </div>
      <div className="p-0">
        {Array(rows)
          .fill(0)
          .map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center space-x-4 border-b p-4">
              {Array(columns)
                .fill(0)
                .map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-full" />
                ))}
            </div>
          ))}
      </div>
    </div>
  )
}
