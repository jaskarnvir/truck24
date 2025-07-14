"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Wrench, Receipt, DollarSign, BarChart3 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="space-y-6">
      <motion.p
        className="text-sm sm:text-base text-muted-foreground"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Welcome to your trucking expense tracker dashboard.
      </motion.p>

      <motion.div
        className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Link href="/dashboard/trucks">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Trucks</CardTitle>
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs sm:text-sm">Manage your fleet of trucks</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/dashboard/maintenance">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Maintenance</CardTitle>
                <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs sm:text-sm">Track maintenance and repairs</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/dashboard/expenses">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Expenses</CardTitle>
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs sm:text-sm">Record and categorize expenses</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/dashboard/pay">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Pay</CardTitle>
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs sm:text-sm">Track income and payments</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/dashboard/reports">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Reports</CardTitle>
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs sm:text-sm">Generate financial reports</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
