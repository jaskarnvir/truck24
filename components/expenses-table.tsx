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
import { ExpenseDialog } from "@/components/expense-dialog"
import { ResponsiveTableWrapper } from "@/components/responsive-table-wrapper"
import { useMobile } from "@/hooks/use-mobile"

type Expense = {
  id: string
  date: string
  category: string
  amount: number
  description: string
  truckId?: string
  receipt?: string
}

export function ExpensesTable() {
  const { toast } = useToast()
  const { expenses, trucksMap, loadingExpenses, deleteExpenseWithRefresh } = useData()
  const isMobile = useMobile()

  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

  // Update the columns definition to be responsive
  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("date")), "MMM d, yyyy"),
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) =>
        `$${row.getValue<number>("amount").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const value = row.getValue<string>("description") || ""
        return isMobile && value.length > 20 ? `${value.substring(0, 20)}...` : value
      },
    },
    // Only show truck column on non-mobile
    ...(isMobile
      ? []
      : [
          {
            accessorKey: "truckId",
            header: "Truck",
            cell: ({ row }) => {
              const truckId = row.getValue("truckId") as string
              return truckId ? trucksMap[truckId] || truckId : "-"
            },
          },
        ]),
    {
      id: "actions",
      cell: ({ row }) => {
        const expense = row.original

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
                  setEditingExpense(expense)
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  setExpenseToDelete(expense.id)
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
    data: expenses,
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

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return

    try {
      await deleteExpenseWithRefresh(expenseToDelete)
      toast({
        title: "Expense deleted",
        description: "The expense has been deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setExpenseToDelete(null)
    }
  }

  if (loadingExpenses) {
    return <div>Loading expenses...</div>
  }

  // Update the table rendering to use ResponsiveTableWrapper
  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by category..."
          value={(table.getColumn("category")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("category")?.setFilterValue(event.target.value)}
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
                  No expenses found.
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

      {editingExpense && (
        <ExpenseDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) setEditingExpense(null)
          }}
          expense={editingExpense}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExpense} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
