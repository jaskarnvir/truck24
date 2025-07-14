"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useData } from "@/lib/data-context"
import { ScrollableDialogContent } from "@/components/scrollable-dialog-content"

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required",
  }),
  category: z.string({
    required_error: "Please select a category",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  truckId: z.string({
    required_error: "Please select a truck",
  }),
})

type ExpenseFormValues = z.infer<typeof formSchema>

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: {
    id: string
    date: string
    category: string
    amount: number
    description: string
    truckId?: string
  }
}

export function ExpenseDialog({ open, onOpenChange, expense }: ExpenseDialogProps) {
  const { toast } = useToast()
  const { trucks, addExpenseWithRefresh, updateExpenseWithRefresh } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<ExpenseFormValues> = {
    date: expense ? new Date(expense.date) : new Date(),
    category: expense?.category || "",
    amount: expense?.amount || 0,
    description: expense?.description || "",
    truckId: expense?.truckId || "",
  }

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: ExpenseFormValues) {
    setIsSubmitting(true)
    try {
      const expenseData = {
        date: format(values.date, "yyyy-MM-dd"),
        category: values.category,
        amount: values.amount,
        description: values.description,
        truckId: values.truckId,
      }

      if (expense) {
        await updateExpenseWithRefresh(expense.id, expenseData)
        toast({
          title: "Expense updated",
          description: "Your expense has been updated successfully",
        })
      } else {
        await addExpenseWithRefresh(expenseData)
        toast({
          title: "Expense added",
          description: "Your expense has been added successfully",
        })
      }

      onOpenChange(false)
      form.reset(defaultValues)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save expense",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            {expense ? "Update the details of your expense." : "Add a new expense to your tracker."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fuel">Fuel</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Tolls">Tolls</SelectItem>
                        <SelectItem value="Parking">Parking</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Lodging">Lodging</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter expense details" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="truckId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Truck</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a truck" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {trucks.length > 0 ? (
                        trucks.map((truck) => (
                          <SelectItem key={truck.id} value={truck.id}>
                            {truck.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-trucks">No trucks available</SelectItem>
                      )}
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
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Saving..." : expense ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  )
}
