"use client"

import { useState } from "react"
import { format } from "date-fns"
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
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { useData } from "@/lib/data-context"
import { MaintenanceDialog } from "@/components/maintenance-dialog"
import { ResponsiveTableWrapper } from "@/components/responsive-table-wrapper"
import { useMobile } from "@/hooks/use-mobile"

type MaintenanceLog = {
  id: string
  date: string
  truckId: string
  serviceType: string
  mileage: number
  cost: number
  description: string
  nextServiceDate?: string
  nextServiceMileage?: number
}

export function MaintenanceTable() {
  const { toast } = useToast()
  const { maintenanceLogs, trucksMap, loadingMaintenanceLogs, deleteMaintenanceLogWithRefresh } = useData()
  const isMobile = useMobile()

  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [logToDelete, setLogToDelete] = useState<string | null>(null)

  // Update the columns definition to be responsive
  const columns: ColumnDef<MaintenanceLog>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("date")), isMobile ? "MM/dd/yy" : "MMM d, yyyy"),
    },
    {
      accessorKey: "truckId",
      header: "Truck",
      cell: ({ row }) => {
        const truckId = row.getValue("truckId") as string
        const truckName = trucksMap[truckId] || truckId
        return isMobile && truckName.length > 8 ? `${truckName.substring(0, 8)}...` : truckName
      },
    },
    {
      accessorKey: "serviceType",
      header: "Service",
      cell: ({ row }) => {
        const value = row.getValue<string>("serviceType")
        return isMobile && value.length > 8 ? `${value.substring(0, 8)}...` : value
      },
    },
    // Only show these columns on non-mobile
    ...(isMobile
      ? []
      : [
          {
            accessorKey: "mileage",
            header: "Mileage",
            cell: ({ row }) => row.getValue<number>("mileage").toLocaleString(),
          },
          {
            accessorKey: "cost",
            header: "Cost",
            cell: ({ row }) => `$${row.getValue<number>("cost").toLocaleString()}`,
          },
          {
            accessorKey: "description",
            header: "Description",
          },
          {
            accessorKey: "nextServiceDate",
            header: "Next Service",
            cell: ({ row }) => {
              const nextDate = row.original.nextServiceDate
              return nextDate ? format(new Date(nextDate), "MMM d, yyyy") : "-"
            },
          },
        ]),
    // Show cost on mobile
    ...(isMobile
      ? [
          {
            accessorKey: "cost",
            header: "Cost",
            cell: ({ row }) => `$${row.getValue<number>("cost").toLocaleString()}`,
          },
        ]
      : []),
    {
      id: "actions",
      cell: ({ row }) => {
        const log = row.original

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
                  setEditingLog(log)
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  setLogToDelete(log.id)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: maintenanceLogs,
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

  const handleDeleteLog = async () => {
    if (!logToDelete) return

    try {
      await deleteMaintenanceLogWithRefresh(logToDelete)
      toast({
        title: "Maintenance log deleted",
        description: "The maintenance log has been deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting maintenance log:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete maintenance log",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setLogToDelete(null)
    }
  }

  if (loadingMaintenanceLogs) {
    return <div>Loading maintenance logs...</div>
  }

  // Update the table rendering to use ResponsiveTableWrapper
  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by service type..."
          value={(table.getColumn("serviceType")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("serviceType")?.setFilterValue(event.target.value)}
          className="w-full max-w-sm"
        />
      </div>
      <ResponsiveTableWrapper>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No maintenance logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ResponsiveTableWrapper>
      <div className="flex flex-col-reverse items-center justify-end gap-4 py-4 sm:flex-row">
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
      </div>

      {editingLog && (
        <MaintenanceDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) setEditingLog(null)
          }}
          maintenanceLog={editingLog}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the maintenance log from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLog} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
