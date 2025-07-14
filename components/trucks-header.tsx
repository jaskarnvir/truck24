"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TruckDialog } from "@/components/truck-dialog"
import { useState } from "react"

export function TrucksHeader() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
      <h1 className="text-2xl font-bold tracking-tight">Trucks</h1>
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Add Truck
      </Button>
      <TruckDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
