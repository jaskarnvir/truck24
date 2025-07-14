import type React from "react"
import { DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ScrollableDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  children: React.ReactNode
}

export function ScrollableDialogContent({ children, className, ...props }: ScrollableDialogContentProps) {
  return (
    <DialogContent className={cn("w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0", className)} {...props}>
      <div className="overflow-y-auto p-4 sm:p-6 flex-1">{children}</div>
    </DialogContent>
  )
}
