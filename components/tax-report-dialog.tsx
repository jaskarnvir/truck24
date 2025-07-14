"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { format, startOfYear, endOfYear } from "date-fns"
import { useData } from "@/lib/data-context"
import { ScrollableDialogContent } from "@/components/scrollable-dialog-content"

const formSchema = z.object({
  reportType: z.enum(["monthly", "quarterly", "annual"], {
    required_error: "Please select a report type",
  }),
  year: z.string({
    required_error: "Please select a year",
  }),
  format: z.enum(["csv", "pdf"], {
    required_error: "Please select a format",
  }),
})

type TaxReportFormValues = z.infer<typeof formSchema>

interface TaxReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaxReportDialog({ open, onOpenChange }: TaxReportDialogProps) {
  const { toast } = useToast()
  const { expenses, payEntries, maintenanceLogs, trucksMap } = useData()
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate year options (current year and 2 previous years)
  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()]

  const defaultValues: Partial<TaxReportFormValues> = {
    reportType: "annual",
    year: currentYear.toString(),
    format: "csv",
  }

  const form = useForm<TaxReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: TaxReportFormValues) {
    setIsGenerating(true)
    try {
      const year = Number.parseInt(values.year)
      const startDate = format(startOfYear(new Date(year, 0, 1)), "yyyy-MM-dd")
      const endDate = format(endOfYear(new Date(year, 0, 1)), "yyyy-MM-dd")

      // Filter by date range
      const yearExpenses = expenses.filter((expense) => expense.date >= startDate && expense.date <= endDate)
      const yearPayEntries = payEntries.filter(
        (pay) =>
          (pay.startDate >= startDate && pay.startDate <= endDate) ||
          (pay.endDate >= startDate && pay.endDate <= endDate),
      )
      const yearMaintenanceLogs = maintenanceLogs.filter((log) => log.date >= startDate && log.date <= endDate)

      // Group data by month or quarter based on report type
      let reportData: any = {}

      if (values.reportType === "monthly") {
        // Initialize months
        for (let i = 0; i < 12; i++) {
          const monthName = format(new Date(year, i, 1), "MMMM")
          reportData[monthName] = {
            income: 0,
            expenses: 0,
            maintenance: 0,
            profit: 0,
            expensesByCategory: {},
            maintenanceByType: {},
          }
        }

        // Add expenses by month
        yearExpenses.forEach((expense) => {
          const date = new Date(expense.date)
          const monthName = format(date, "MMMM")

          reportData[monthName].expenses += expense.amount

          // Group by category
          if (!reportData[monthName].expensesByCategory[expense.category]) {
            reportData[monthName].expensesByCategory[expense.category] = 0
          }
          reportData[monthName].expensesByCategory[expense.category] += expense.amount
        })

        // Add maintenance by month
        yearMaintenanceLogs.forEach((log) => {
          const date = new Date(log.date)
          const monthName = format(date, "MMMM")

          reportData[monthName].maintenance += log.cost

          // Group by service type
          if (!reportData[monthName].maintenanceByType[log.serviceType]) {
            reportData[monthName].maintenanceByType[log.serviceType] = 0
          }
          reportData[monthName].maintenanceByType[log.serviceType] += log.cost
        })

        // Add income by month (simplified - using start date)
        yearPayEntries.forEach((pay) => {
          const date = new Date(pay.startDate)
          const monthName = format(date, "MMMM")

          reportData[monthName].income += pay.amount
        })

        // Calculate profit
        Object.keys(reportData).forEach((month) => {
          reportData[month].profit =
            reportData[month].income - reportData[month].expenses - reportData[month].maintenance
        })
      } else if (values.reportType === "quarterly") {
        // Initialize quarters
        reportData = {
          Q1: { income: 0, expenses: 0, maintenance: 0, profit: 0, expensesByCategory: {}, maintenanceByType: {} },
          Q2: { income: 0, expenses: 0, maintenance: 0, profit: 0, expensesByCategory: {}, maintenanceByType: {} },
          Q3: { income: 0, expenses: 0, maintenance: 0, profit: 0, expensesByCategory: {}, maintenanceByType: {} },
          Q4: { income: 0, expenses: 0, maintenance: 0, profit: 0, expensesByCategory: {}, maintenanceByType: {} },
        }

        // Add expenses by quarter
        yearExpenses.forEach((expense) => {
          const date = new Date(expense.date)
          const month = date.getMonth()
          const quarter = Math.floor(month / 3) + 1
          const quarterKey = `Q${quarter}`

          reportData[quarterKey].expenses += expense.amount

          // Group by category
          if (!reportData[quarterKey].expensesByCategory[expense.category]) {
            reportData[quarterKey].expensesByCategory[expense.category] = 0
          }
          reportData[quarterKey].expensesByCategory[expense.category] += expense.amount
        })

        // Add maintenance by quarter
        yearMaintenanceLogs.forEach((log) => {
          const date = new Date(log.date)
          const month = date.getMonth()
          const quarter = Math.floor(month / 3) + 1
          const quarterKey = `Q${quarter}`

          reportData[quarterKey].maintenance += log.cost

          // Group by service type
          if (!reportData[quarterKey].maintenanceByType[log.serviceType]) {
            reportData[quarterKey].maintenanceByType[log.serviceType] = 0
          }
          reportData[quarterKey].maintenanceByType[log.serviceType] += log.cost
        })

        // Add income by quarter
        yearPayEntries.forEach((pay) => {
          const date = new Date(pay.startDate)
          const month = date.getMonth()
          const quarter = Math.floor(month / 3) + 1
          const quarterKey = `Q${quarter}`

          reportData[quarterKey].income += pay.amount
        })

        // Calculate profit
        Object.keys(reportData).forEach((quarter) => {
          reportData[quarter].profit =
            reportData[quarter].income - reportData[quarter].expenses - reportData[quarter].maintenance
        })
      } else {
        // Annual report
        reportData = {
          [year]: {
            income: 0,
            expenses: 0,
            maintenance: 0,
            profit: 0,
            expensesByCategory: {},
            maintenanceByType: {},
          },
        }

        // Add all expenses
        yearExpenses.forEach((expense) => {
          reportData[year].expenses += expense.amount

          // Group by category
          if (!reportData[year].expensesByCategory[expense.category]) {
            reportData[year].expensesByCategory[expense.category] = 0
          }
          reportData[year].expensesByCategory[expense.category] += expense.amount
        })

        // Add all maintenance
        yearMaintenanceLogs.forEach((log) => {
          reportData[year].maintenance += log.cost

          // Group by service type
          if (!reportData[year].maintenanceByType[log.serviceType]) {
            reportData[year].maintenanceByType[log.serviceType] = 0
          }
          reportData[year].maintenanceByType[log.serviceType] += log.cost
        })

        // Add all income
        yearPayEntries.forEach((pay) => {
          reportData[year].income += pay.amount
        })

        // Calculate profit
        reportData[year].profit = reportData[year].income - reportData[year].expenses - reportData[year].maintenance
      }

      // Generate CSV or prepare data for PDF
      if (values.format === "csv") {
        let csvContent = `TAX REPORT - ${values.reportType.toUpperCase()} - ${values.year}\n\n`

        Object.entries(reportData).forEach(([period, data]: [string, any]) => {
          csvContent += `${period}\n`
          csvContent += `Income,${data.income}\n`
          csvContent += `Expenses,${data.expenses}\n`
          csvContent += `Maintenance,${data.maintenance}\n`
          csvContent += `Profit,${data.profit}\n\n`

          csvContent += "Expenses by Category\n"
          Object.entries(data.expensesByCategory).forEach(([category, amount]: [string, any]) => {
            csvContent += `${category},${amount}\n`
          })

          csvContent += "\nMaintenance by Type\n"
          Object.entries(data.maintenanceByType).forEach(([type, amount]: [string, any]) => {
            csvContent += `${type},${amount}\n`
          })

          csvContent += "\n\n"
        })

        // Create a download link for the CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `tax-report-${values.year}-${values.reportType}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For PDF, we'll use a simpler approach with direct HTML-to-PDF conversion
        // Create a simple HTML table for the data
        let htmlContent = `
          <html>
          <head>
            <title>Tax Report - ${values.reportType.charAt(0).toUpperCase() + values.reportType.slice(1)} - ${values.year}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { font-size: 18px; margin-bottom: 10px; }
              h2 { font-size: 16px; margin-top: 20px; margin-bottom: 10px; }
              h3 { font-size: 14px; margin-top: 15px; margin-bottom: 5px; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary { margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <h1>Tax Report - ${values.reportType.charAt(0).toUpperCase() + values.reportType.slice(1)} - ${values.year}</h1>
        `

        Object.entries(reportData).forEach(([period, data]: [string, any]) => {
          htmlContent += `
            <div class="summary">
              <h2>${period}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Income</td>
                    <td>$${data.income.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Expenses</td>
                    <td>$${data.expenses.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Maintenance</td>
                    <td>$${data.maintenance.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td><strong>Profit</strong></td>
                    <td><strong>$${data.profit.toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
              
              <h3>Expenses by Category</h3>
          `

          if (Object.keys(data.expensesByCategory).length > 0) {
            htmlContent += `
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
            `

            Object.entries(data.expensesByCategory).forEach(([category, amount]: [string, any]) => {
              htmlContent += `
                <tr>
                  <td>${category}</td>
                  <td>$${Number(amount).toFixed(2)}</td>
                </tr>
              `
            })

            htmlContent += `
                </tbody>
              </table>
            `
          } else {
            htmlContent += `<p>No expense data available</p>`
          }

          htmlContent += `<h3>Maintenance by Type</h3>`

          if (Object.keys(data.maintenanceByType).length > 0) {
            htmlContent += `
              <table>
                <thead>
                  <tr>
                    <th>Service Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
            `

            Object.entries(data.maintenanceByType).forEach(([type, amount]: [string, any]) => {
              htmlContent += `
                <tr>
                  <td>${type}</td>
                  <td>$${Number(amount).toFixed(2)}</td>
                </tr>
              `
            })

            htmlContent += `
                </tbody>
              </table>
            `
          } else {
            htmlContent += `<p>No maintenance data available</p>`
          }

          htmlContent += `</div>`
        })

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
        title: "Report generated",
        description:
          values.format === "pdf"
            ? "Your tax report has been prepared for PDF. Please use your browser's print function to save as PDF."
            : `Your ${values.reportType} tax report for ${values.year} has been generated.`,
      })

      onOpenChange(false)
    } catch (error: any) {
      console.error("Error generating report:", error)
      toast({
        title: "Report generation failed",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Tax Report</DialogTitle>
          <DialogDescription>Create a tax report with income and expense totals.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
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
            <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isGenerating} className="w-full sm:w-auto">
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  )
}
