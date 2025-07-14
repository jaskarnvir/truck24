"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Edit, MoreHorizontal, Trash, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useData } from "@/lib/data-context"
import { TruckDialog } from "@/components/truck-dialog"
import { useMobile } from "@/hooks/use-mobile"
import { Spinner } from "@/components/ui/spinner"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { motion } from "framer-motion"

type Truck = {
  id: string
  name: string
  identifier: string
  make: string
  model: string
  year: number
  vin?: string
  licensePlate?: string
  notes?: string
}

export function TrucksTable() {
  const { toast } = useToast()
  const router = useRouter()
  const { trucks, loadingTrucks, deleteTruckWithRefresh } = useData()
  const isMobile = useMobile()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [truckToDelete, setTruckToDelete] = useState<string | null>(null)

  // Update the columns definition to be responsive
  const columns: ColumnDef<Truck>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "identifier",
      header: "ID",
      cell: ({ row }) => {
        const value = row.getValue<string>("identifier")
        return isMobile && value.length > 8 ? `${value.substring(0, 8)}...` : value
      },
    },
    // Only show these columns on non-mobile
    ...(isMobile
      ? []
      : [
          {
            accessorKey: "make",
            header: "Make",
          },
          {
            accessorKey: "model",
            header: "Model",
          },
          {
            accessorKey: "year",
            header: "Year",
          },
          {
            accessorKey: "licensePlate",
            header: "License Plate",
            cell: ({ row }) => row.getValue("licensePlate") || "-",
          },
        ]),
    // Show year on mobile
    ...(isMobile
      ? [
          {
            accessorKey: "year",
            header: "Year",
          },
        ]
      : []),
    {
      id: "actions",
      cell: ({ row }) => {
        const truck = row.original
        const isDeleting = deletingId === truck.id

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingTruck(truck)
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/maintenance")}>
                <Wrench className="mr-2 h-4 w-4" />
                Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  setTruckToDelete(truck.id)
                  setDeleteDialogOpen(true)
                }}
                disabled={isDeleting}
              >
                {isDeleting ? <Spinner size="sm" className="mr-2" /> : <Trash className="mr-2 h-4 w-4" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: trucks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const handleDeleteTruck = async () => {
    if (!truckToDelete) return

    try {
      setDeletingId(truckToDelete)
      await deleteTruckWithRefresh(truckToDelete)
      toast({
        title: "Truck deleted",
        description: "The truck has been deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting truck:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete truck",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setTruckToDelete(null)
      setDeletingId(null)
    }
  }

  if (loadingTrucks) {
    return <SkeletonTable columns={isMobile ? 3 : 6} />
  }

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        when: "beforeChildren",
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div className="w-full space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center"
      >
        <Input
          placeholder="Filter trucks..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </motion.div>

      <motion.div
        className="rounded-md border w-full overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={tableVariants}
      >
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th key={header.id} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50"
                    variants={rowVariants}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center">
                    No trucks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col-reverse items-center justify-end gap-4 py-4 sm:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </motion.div>

      {editingTruck && (
        <TruckDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) setEditingTruck(null)
          }}
          truck={editingTruck}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the truck from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTruck}
              className="bg-red-600 hover:bg-red-700"
              disabled={!!deletingId}
            >
              {deletingId ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
