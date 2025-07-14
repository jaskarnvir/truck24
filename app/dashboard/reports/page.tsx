"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Download } from "lucide-react"
import { ExportDialog } from "@/components/export-dialog"
import { TaxReportDialog } from "@/components/tax-report-dialog"
import { ReportsHeader } from "@/components/reports-header"

export default function ReportsPage() {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [taxReportDialogOpen, setTaxReportDialogOpen] = useState(false)

  return (
    <div className="space-y-6 w-full">
      <ReportsHeader />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Download className="mr-2 h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Export your data to CSV or PDF format</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Export your expense and pay data for record keeping or sharing.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center sm:justify-start pt-0">
            <Button onClick={() => setExportDialogOpen(true)} className="w-full sm:w-auto text-xs sm:text-sm">
              Export Data
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Calculator className="mr-2 h-5 w-5" />
              Tax Reports
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Generate tax-time reports with monthly/yearly totals
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Generate reports suitable for tax filing purposes.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center sm:justify-start pt-0">
            <Button onClick={() => setTaxReportDialogOpen(true)} className="w-full sm:w-auto text-xs sm:text-sm">
              Generate Tax Report
            </Button>
          </CardFooter>
        </Card>
      </div>

      {exportDialogOpen && <ExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />}
      {taxReportDialogOpen && <TaxReportDialog open={taxReportDialogOpen} onOpenChange={setTaxReportDialogOpen} />}
    </div>
  )
}
