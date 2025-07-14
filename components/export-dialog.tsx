"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useData } from "@/lib/data-context"
import { ScrollableDialogContent } from "@/components/scrollable-dialog-content"

const formSchema = z.object({
  dataType: z.enum(["expenses", "pay", "maintenance", "all"], {
    required_error: "Please select a data type",
  }),
  format: z.enum(["csv", "pdf"], {
    required_error: "Please select a format",
  }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
})

type ExportFormValues = z.infer<typeof formSchema>

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { toast } = useToast()
  const { expenses, payEntries, maintenanceLogs, trucksMap } = useData()
  const [isExporting, setIsExporting] = useState(false)

  const defaultValues: Partial<ExportFormValues> = {
    dataType: "all",
    format: "csv",
    startDate: new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
    endDate: new Date(),
  }

  const form = useForm<ExportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: ExportFormValues) {
    setIsExporting(true)
    try {
      // Filter the data based on the selected type and date range
      const startDateStr = format(values.startDate, "yyyy-MM-dd")
      const endDateStr = format(values.endDate, "yyyy-MM-dd")

      let filteredExpenses: any[] = []
      let filteredPayEntries: any[] = []
      let filteredMaintenanceLogs: any[] = []

      if (values.dataType === "expenses" || values.dataType === "all") {
        filteredExpenses = expenses.filter((expense) => expense.date >= startDateStr && expense.date <= endDateStr)
      }

      if (values.dataType === "pay" || values.dataType === "all") {
        filteredPayEntries = payEntries.filter(
          (pay) =>
            (pay.startDate >= startDateStr && pay.startDate <= endDateStr) ||
            (pay.endDate >= startDateStr && pay.endDate <= endDateStr),
        )
      }

      if (values.dataType === "maintenance" || values.dataType === "all") {
        filteredMaintenanceLogs = maintenanceLogs.filter((log) => log.date >= startDateStr && log.date <= endDateStr)
      }

      // Generate CSV or prepare data for PDF
      if (values.format === "csv") {
        let csvContent = ""

        if (filteredExpenses.length > 0) {
          csvContent += "EXPENSES\n"
          csvContent += "Date,Category,Amount,Description,Truck ID\n"

          filteredExpenses.forEach((expense) => {
            csvContent += `${expense.date},${expense.category},${expense.amount},${expense.description},${expense.truckId || ""}\n`
          })

          csvContent += "\n"
        }

        if (filteredPayEntries.length > 0) {
          csvContent += "PAY ENTRIES\n"
          csvContent += "Start Date,End Date,Amount,Client,Notes\n"

          filteredPayEntries.forEach((pay) => {
            csvContent += `${pay.startDate},${pay.endDate},${pay.amount},${pay.client},${pay.notes || ""}\n`
          })

          csvContent += "\n"
        }

        if (filteredMaintenanceLogs.length > 0) {
          csvContent += "MAINTENANCE LOGS\n"
          csvContent += "Date,Truck ID,Service Type,Mileage,Cost,Description,Next Service Date,Next Service Mileage\n"

          filteredMaintenanceLogs.forEach((log) => {
            csvContent += `${log.date},${log.truckId || ""},${log.serviceType},${log.mileage},${log.cost},${log.description},${log.nextServiceDate || ""},${log.nextServiceMileage || ""}\n`
          })
        }

        // Create a download link for the CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `trucking-data-${format(new Date(), "yyyy-MM-dd")}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For PDF, we'll use a simpler approach with direct HTML-to-PDF conversion
        // This avoids the issues with jsPDF and autotable

        // Create a simple HTML table for the data
        let htmlContent = `
          <html>
          <head>
            <title>Trucking Expense Tracker Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { font-size: 18px; margin-bottom: 10px; }
              h2 { font-size: 16px; margin-top: 20px; margin-bottom: 10px; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Trucking Expense Tracker Report</h1>
            <p>Date Range: ${format(values.startDate, "MMM d, yyyy")} - ${format(values.endDate, "MMM d, yyyy")}</p>
        `

        // Add expenses table
        if (filteredExpenses.length > 0) {
          htmlContent += `
            <h2>Expenses</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Truck</th>
                </tr>
              </thead>
              <tbody>
          `

          filteredExpenses.forEach((expense) => {
            htmlContent += `
              <tr>
                <td>${format(new Date(expense.date), "MMM d, yyyy")}</td>
                <td>${expense.category}</td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>${expense.description}</td>
                <td>${expense.truckId ? trucksMap[expense.truckId] || expense.truckId : ""}</td>
              </tr>
            `
          })

          htmlContent += `
              </tbody>
            </table>
          `
        }

        // Add pay entries table
        if (filteredPayEntries.length > 0) {
          htmlContent += `
            <h2>Pay Entries</h2>
            <table>
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Amount</th>
                  <th>Client</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
          `

          filteredPayEntries.forEach((pay) => {
            htmlContent += `
              <tr>
                <td>${format(new Date(pay.startDate), "MMM d, yyyy")}</td>
                <td>${format(new Date(pay.endDate), "MMM d, yyyy")}</td>
                <td>$${pay.amount.toFixed(2)}</td>
                <td>${pay.client}</td>
                <td>${pay.notes || ""}</td>
              </tr>
            `
          })

          htmlContent += `
              </tbody>
            </table>
          `
        }

        // Add maintenance logs table
        if (filteredMaintenanceLogs.length > 0) {
          htmlContent += `
            <h2>Maintenance Logs</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Truck</th>
                  <th>Service Type</th>
                  <th>Mileage</th>
                  <th>Cost</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
          `

          filteredMaintenanceLogs.forEach((log) => {
            htmlContent += `
              <tr>
                <td>${format(new Date(log.date), "MMM d, yyyy")}</td>
                <td>${log.truckId ? trucksMap[log.truckId] || log.truckId : ""}</td>
                <td>${log.serviceType}</td>
                <td>${log.mileage.toLocaleString()}</td>
                <td>$${log.cost.toFixed(2)}</td>
                <td>${log.description}</td>
              </tr>
            `
          })

          htmlContent += `
              </tbody>
            </table>
          `
        }

        htmlContent += `
          </body>
          </html>
        `

        // Create a blob from the HTML content
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)

        // Open the HTML in a new window for printing to PDF
        const printWindow = window.open(url, "_blank")
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print()
          }
        } else {
          throw new Error("Please allow pop-ups to generate PDF reports")
        }
      }

      toast({
        title: "Export successful",
        description:
          values.format === "pdf"
            ? "Your data has been prepared for PDF. Please use your browser's print function to save as PDF."
            : "Your data has been exported as CSV",
      })

      onOpenChange(false)
    } catch (error: any) {
      console.error("Error generating export:", error)
      toast({
        title: "Export failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>Export your trucking data for record keeping or analysis.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dataType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expenses">Expenses Only</SelectItem>
                      <SelectItem value="pay">Pay Only</SelectItem>
                      <SelectItem value="maintenance">Maintenance Only</SelectItem>
                      <SelectItem value="all">All Data</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF (Print to PDF)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isExporting} className="w-full sm:w-auto">
                {isExporting ? (
                  "Exporting..."
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  )
}
