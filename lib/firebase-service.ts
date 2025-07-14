import { ref, set, push, get, remove, update } from "firebase/database"
import { database } from "@/lib/firebase"

// Expense functions
export async function addExpense(userId: string, expenseData: any) {
  const expensesRef = ref(database, `users/${userId}/expenses`)
  const newExpenseRef = push(expensesRef)
  await set(newExpenseRef, expenseData)
  return { id: newExpenseRef.key, ...expenseData }
}

export async function updateExpense(userId: string, expenseId: string, expenseData: any) {
  const expenseRef = ref(database, `users/${userId}/expenses/${expenseId}`)
  await update(expenseRef, expenseData)
  return { id: expenseId, ...expenseData }
}

export async function deleteExpense(userId: string, expenseId: string) {
  const expenseRef = ref(database, `users/${userId}/expenses/${expenseId}`)
  await remove(expenseRef)
  return expenseId
}

export async function fetchExpenses(userId: string) {
  const expensesRef = ref(database, `users/${userId}/expenses`)
  const snapshot = await get(expensesRef)

  if (!snapshot.exists()) {
    return []
  }

  const expenses: any[] = []
  snapshot.forEach((childSnapshot) => {
    expenses.push({
      id: childSnapshot.key,
      ...childSnapshot.val(),
    })
  })

  return expenses
}

// Pay entry functions
export async function addPayEntry(userId: string, payData: any) {
  const payRef = ref(database, `users/${userId}/pay`)
  const newPayRef = push(payRef)
  await set(newPayRef, payData)
  return { id: newPayRef.key, ...payData }
}

export async function updatePayEntry(userId: string, payId: string, payData: any) {
  const payRef = ref(database, `users/${userId}/pay/${payId}`)
  await update(payRef, payData)
  return { id: payId, ...payData }
}

export async function deletePayEntry(userId: string, payId: string) {
  const payRef = ref(database, `users/${userId}/pay/${payId}`)
  await remove(payRef)
  return payId
}

export async function fetchPayEntries(userId: string) {
  const payRef = ref(database, `users/${userId}/pay`)
  const snapshot = await get(payRef)

  if (!snapshot.exists()) {
    return []
  }

  const payEntries: any[] = []
  snapshot.forEach((childSnapshot) => {
    payEntries.push({
      id: childSnapshot.key,
      ...childSnapshot.val(),
    })
  })

  return payEntries
}

// Truck functions
export async function addTruck(userId: string, truckData: any) {
  const trucksRef = ref(database, `users/${userId}/trucks`)
  const newTruckRef = push(trucksRef)
  await set(newTruckRef, truckData)
  return { id: newTruckRef.key, ...truckData }
}

export async function updateTruck(userId: string, truckId: string, truckData: any) {
  const truckRef = ref(database, `users/${userId}/trucks/${truckId}`)
  await update(truckRef, truckData)
  return { id: truckId, ...truckData }
}

export async function deleteTruck(userId: string, truckId: string) {
  const truckRef = ref(database, `users/${userId}/trucks/${truckId}`)
  await remove(truckRef)
  return truckId
}

export async function fetchTrucks(userId: string) {
  const trucksRef = ref(database, `users/${userId}/trucks`)
  const snapshot = await get(trucksRef)

  if (!snapshot.exists()) {
    return []
  }

  const trucks: any[] = []
  snapshot.forEach((childSnapshot) => {
    trucks.push({
      id: childSnapshot.key,
      ...childSnapshot.val(),
    })
  })

  return trucks
}

// Maintenance log functions
export async function addMaintenanceLog(userId: string, logData: any) {
  const logsRef = ref(database, `users/${userId}/maintenance`)
  const newLogRef = push(logsRef)

  // Clean up undefined values
  const cleanedData = Object.fromEntries(Object.entries(logData).filter(([_, v]) => v !== undefined))

  await set(newLogRef, cleanedData)
  return { id: newLogRef.key, ...cleanedData }
}

export async function updateMaintenanceLog(userId: string, logId: string, logData: any) {
  const logRef = ref(database, `users/${userId}/maintenance/${logId}`)

  // Clean up undefined values
  const cleanedData = Object.fromEntries(Object.entries(logData).filter(([_, v]) => v !== undefined))

  await update(logRef, cleanedData)
  return { id: logId, ...cleanedData }
}

export async function deleteMaintenanceLog(userId: string, logId: string) {
  const logRef = ref(database, `users/${userId}/maintenance/${logId}`)
  await remove(logRef)
  return logId
}

export async function fetchMaintenanceLogs(userId: string) {
  const logsRef = ref(database, `users/${userId}/maintenance`)
  const snapshot = await get(logsRef)

  if (!snapshot.exists()) {
    return []
  }

  const logs: any[] = []
  snapshot.forEach((childSnapshot) => {
    logs.push({
      id: childSnapshot.key,
      ...childSnapshot.val(),
    })
  })

  return logs
}
