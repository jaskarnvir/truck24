"use client"

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  fetchExpenses,
  fetchPayEntries,
  fetchTrucks,
  fetchMaintenanceLogs,
  addExpense,
  updateExpense,
  deleteExpense,
  addPayEntry,
  updatePayEntry,
  deletePayEntry,
  addTruck,
  updateTruck,
  deleteTruck,
  addMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
} from "@/lib/firebase-service"

type DataContextType = {
  expenses: any[]
  payEntries: any[]
  trucks: any[]
  maintenanceLogs: any[]
  trucksMap: Record<string, string>
  loadingExpenses: boolean
  loadingPayEntries: boolean
  loadingTrucks: boolean
  loadingMaintenanceLogs: boolean
  refreshExpenses: () => Promise<void>
  refreshPayEntries: () => Promise<void>
  refreshTrucks: () => Promise<void>
  refreshMaintenanceLogs: () => Promise<void>
  refreshAll: () => Promise<void>
  // CRUD operations with automatic refresh
  addExpenseWithRefresh: (expenseData: any) => Promise<any>
  updateExpenseWithRefresh: (expenseId: string, expenseData: any) => Promise<any>
  deleteExpenseWithRefresh: (expenseId: string) => Promise<void>
  addPayEntryWithRefresh: (payData: any) => Promise<any>
  updatePayEntryWithRefresh: (payId: string, payData: any) => Promise<any>
  deletePayEntryWithRefresh: (payId: string) => Promise<void>
  addTruckWithRefresh: (truckData: any) => Promise<any>
  updateTruckWithRefresh: (truckId: string, truckData: any) => Promise<any>
  deleteTruckWithRefresh: (truckId: string) => Promise<void>
  addMaintenanceLogWithRefresh: (logData: any) => Promise<any>
  updateMaintenanceLogWithRefresh: (logId: string, logData: any) => Promise<any>
  deleteMaintenanceLogWithRefresh: (logId: string) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<any[]>([])
  const [payEntries, setPayEntries] = useState<any[]>([])
  const [trucks, setTrucks] = useState<any[]>([])
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([])
  const [trucksMap, setTrucksMap] = useState<Record<string, string>>({})
  const [loadingExpenses, setLoadingExpenses] = useState(true)
  const [loadingPayEntries, setLoadingPayEntries] = useState(true)
  const [loadingTrucks, setLoadingTrucks] = useState(true)
  const [loadingMaintenanceLogs, setLoadingMaintenanceLogs] = useState(true)

  const refreshExpenses = useCallback(async () => {
    if (!user) return

    try {
      setLoadingExpenses(true)
      const expensesData = await fetchExpenses(user.uid)
      setExpenses(expensesData)
    } catch (error) {
      console.error("Error loading expenses:", error)
    } finally {
      setLoadingExpenses(false)
    }
  }, [user])

  const refreshPayEntries = useCallback(async () => {
    if (!user) return

    try {
      setLoadingPayEntries(true)
      const payData = await fetchPayEntries(user.uid)
      setPayEntries(payData)
    } catch (error) {
      console.error("Error loading pay entries:", error)
    } finally {
      setLoadingPayEntries(false)
    }
  }, [user])

  const refreshTrucks = useCallback(async () => {
    if (!user) return

    try {
      setLoadingTrucks(true)
      const trucksData = await fetchTrucks(user.uid)
      setTrucks(trucksData)

      // Create a map of truck IDs to truck names
      const trucksMapData: Record<string, string> = {}
      trucksData.forEach((truck) => {
        trucksMapData[truck.id] = truck.name
      })
      setTrucksMap(trucksMapData)
    } catch (error) {
      console.error("Error loading trucks:", error)
    } finally {
      setLoadingTrucks(false)
    }
  }, [user])

  const refreshMaintenanceLogs = useCallback(async () => {
    if (!user) return

    try {
      setLoadingMaintenanceLogs(true)
      const logsData = await fetchMaintenanceLogs(user.uid)
      setMaintenanceLogs(logsData)
    } catch (error) {
      console.error("Error loading maintenance logs:", error)
    } finally {
      setLoadingMaintenanceLogs(false)
    }
  }, [user])

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshExpenses(), refreshPayEntries(), refreshTrucks(), refreshMaintenanceLogs()])
  }, [refreshExpenses, refreshPayEntries, refreshTrucks, refreshMaintenanceLogs])

  // CRUD operations with automatic refresh
  const addExpenseWithRefresh = useCallback(
    async (expenseData: any) => {
      if (!user) throw new Error("User not authenticated")

      const result = await addExpense(user.uid, expenseData)
      await refreshExpenses()
      return result
    },
    [user, refreshExpenses],
  )

  const updateExpenseWithRefresh = useCallback(
    async (expenseId: string, expenseData: any) => {
      if (!user) throw new Error("User not authenticated")

      const result = await updateExpense(user.uid, expenseId, expenseData)
      await refreshExpenses()
      return result
    },
    [user, refreshExpenses],
  )

  const deleteExpenseWithRefresh = useCallback(
    async (expenseId: string) => {
      if (!user) throw new Error("User not authenticated")

      await deleteExpense(user.uid, expenseId)
      await refreshExpenses()
    },
    [user, refreshExpenses],
  )

  const addPayEntryWithRefresh = useCallback(
    async (payData: any) => {
      if (!user) throw new Error("User not authenticated")

      const result = await addPayEntry(user.uid, payData)
      await refreshPayEntries()
      return result
    },
    [user, refreshPayEntries],
  )

  const updatePayEntryWithRefresh = useCallback(
    async (payId: string, payData: any) => {
      if (!user) throw new Error("User not authenticated")

      const result = await updatePayEntry(user.uid, payId, payData)
      await refreshPayEntries()
      return result
    },
    [user, refreshPayEntries],
  )

  const deletePayEntryWithRefresh = useCallback(
    async (payId: string) => {
      if (!user) throw new Error("User not authenticated")

      await deletePayEntry(user.uid, payId)
      await refreshPayEntries()
    },
    [user, refreshPayEntries],
  )

  const addTruckWithRefresh = useCallback(
    async (truckData: any) => {
      if (!user) throw new Error("User not authenticated")

      const result = await addTruck(user.uid, truckData)
      await refreshTrucks()
      return result
    },
    [user, refreshTrucks],
  )

  const updateTruckWithRefresh = useCallback(
    async (truckId: string, truckData: any) => {
      if (!user) throw new Error("User not authenticated")

      const result = await updateTruck(user.uid, truckId, truckData)
      await refreshTrucks()
      return result
    },
    [user, refreshTrucks],
  )

  const deleteTruckWithRefresh = useCallback(
    async (truckId: string) => {
      if (!user) throw new Error("User not authenticated")

      await deleteTruck(user.uid, truckId)
      await refreshTrucks()
    },
    [user, refreshTrucks],
  )

  const addMaintenanceLogWithRefresh = useCallback(
    async (logData: any) => {
      if (!user) throw new Error("User not authenticated")

      const result = await addMaintenanceLog(user.uid, logData)
      await refreshMaintenanceLogs()
      return result
    },
    [user, refreshMaintenanceLogs],
  )

  const updateMaintenanceLogWithRefresh = useCallback(
    async (logId: string, logData: any) => {
      if (!user) throw new Error("User not authenticated")

      const result = await updateMaintenanceLog(user.uid, logId, logData)
      await refreshMaintenanceLogs()
      return result
    },
    [user, refreshMaintenanceLogs],
  )

  const deleteMaintenanceLogWithRefresh = useCallback(
    async (logId: string) => {
      if (!user) throw new Error("User not authenticated")

      await deleteMaintenanceLog(user.uid, logId)
      await refreshMaintenanceLogs()
    },
    [user, refreshMaintenanceLogs],
  )

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      refreshAll()
    }
  }, [user, refreshAll])

  return (
    <DataContext.Provider
      value={{
        expenses,
        payEntries,
        trucks,
        maintenanceLogs,
        trucksMap,
        loadingExpenses,
        loadingPayEntries,
        loadingTrucks,
        loadingMaintenanceLogs,
        refreshExpenses,
        refreshPayEntries,
        refreshTrucks,
        refreshMaintenanceLogs,
        refreshAll,
        addExpenseWithRefresh,
        updateExpenseWithRefresh,
        deleteExpenseWithRefresh,
        addPayEntryWithRefresh,
        updatePayEntryWithRefresh,
        deletePayEntryWithRefresh,
        addTruckWithRefresh,
        updateTruckWithRefresh,
        deleteTruckWithRefresh,
        addMaintenanceLogWithRefresh,
        updateMaintenanceLogWithRefresh,
        deleteMaintenanceLogWithRefresh,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
