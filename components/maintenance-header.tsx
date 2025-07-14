"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MaintenanceDialog } from "@/components/maintenance-dialog"

export function MaintenanceHeader() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Maintenance Log</h1>
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Add Maintenance Entry
      </Button>
      <MaintenanceDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
