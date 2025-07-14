"use client"

import { useState } from "react"
import { format, isValid, parseISO } from "date-fns"
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
import { PayDialog } from "@/components/pay-dialog"
import { ResponsiveTableWrapper } from "@/components/responsive-table-wrapper"
import { useMobile } from "@/hooks/use-mobile"

type PayEntry = {
  id: string
  startDate: string
  endDate: string
  amount: number
  client: string
  notes?: string
}

// Helper function to safely format dates
const safeFormatDate = (dateString: string, formatStr: string): string => {
  try {
    // First try to parse as ISO string
    const date = parseISO(dateString)
    if (isValid(date)) {
      return format(date, formatStr)
    }

    // If that fails, try creating a new Date object
    const fallbackDate = new Date(dateString)
    if (isValid(fallbackDate)) {
      return format(fallbackDate, formatStr)
    }

    // If all parsing fails, return a placeholder
    return "Invalid date"
  } catch (error) {
    console.error("Error formatting date:", dateString, error)
    return "Invalid date"
  }
}

export function PayTable() {
  const { toast } = useToast()
  const { payEntries, loadingPayEntries, deletePayEntryWithRefresh } = useData()
  const isMobile = useMobile()

  const [sorting, setSorting] = useState<SortingState>([{ id: "startDate", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [editingPayEntry, setEditingPayEntry] = useState<PayEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [payEntryToDelete, setPayEntryToDelete] = useState<string | null>(null)

  // Update the columns definition to be responsive
  const columns: ColumnDef<PayEntry>[] = [
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        const value = row.getValue("startDate")
        if (!value) return "N/A"
        return safeFormatDate(value as string, isMobile ? "MM/dd/yy" : "MMM d, yyyy")
      },
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => {
        const value = row.getValue("endDate")
        if (!value) return "N/A"
        return safeFormatDate(value as string, isMobile ? "MM/dd/yy" : "MMM d, yyyy")
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue<number>("amount")
        if (amount === undefined || amount === null) return "$0.00"
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => {
        const value = row.getValue<string>("client") || ""
        return isMobile && value.length > 10 ? `${value.substring(0, 10)}...` : value
      },
    },
    // Only show notes column on non-mobile
    ...(isMobile
      ? []
      : [
          {
            accessorKey: "notes",
            header: "Notes",
            cell: ({ row }) => row.getValue("notes") || "-",
          },
        ]),
    {
      id: "actions",
      cell: ({ row }) => {
        const payEntry = row.original

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
                  setEditingPayEntry(payEntry)
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  setPayEntryToDelete(payEntry.id)
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
    data: payEntries,
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

  const handleDeletePayEntry = async () => {
    if (!payEntryToDelete) return

    try {
      await deletePayEntryWithRefresh(payEntryToDelete)
      toast({
        title: "Pay entry deleted",
        description: "The pay entry has been deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting pay entry:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete pay entry",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setPayEntryToDelete(null)
    }
  }

  if (loadingPayEntries) {
    return <div>Loading pay entries...</div>
  }

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by client..."
          value={(table.getColumn("client")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("client")?.setFilterValue(event.target.value)}
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
                  No pay entries found.
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

      {editingPayEntry && (
        <PayDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) setEditingPayEntry(null)
          }}
          payEntry={editingPayEntry}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the pay entry from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePayEntry} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
