"use client"

import { DialogFooter } from "@/components/ui/dialog"
import { ScrollableDialogContent } from "@/components/scrollable-dialog-content"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useData } from "@/lib/data-context"

const formSchema = z
  .object({
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    amount: z.coerce.number().positive({
      message: "Amount must be a positive number",
    }),
    client: z.string().min(1, {
      message: "Client name is required",
    }),
    notes: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })

type PayFormValues = z.infer<typeof formSchema>

interface PayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payEntry?: {
    id: string
    startDate: string
    endDate: string
    amount: number
    client: string
    notes?: string
  }
}

// Helper function to safely parse dates
const safeParseDate = (dateString: string): Date => {
  try {
    // First try to parse as ISO string
    const date = parseISO(dateString)
    if (isValid(date)) {
      return date
    }

    // If that fails, try creating a new Date object
    const fallbackDate = new Date(dateString)
    if (isValid(fallbackDate)) {
      return fallbackDate
    }

    // If all parsing fails, return current date
    console.warn("Invalid date detected, using current date instead:", dateString)
    return new Date()
  } catch (error) {
    console.error("Error parsing date:", dateString, error)
    return new Date()
  }
}

export function PayDialog({ open, onOpenChange, payEntry }: PayDialogProps) {
  const { toast } = useToast()
  const { addPayEntryWithRefresh, updatePayEntryWithRefresh } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<PayFormValues> = {
    startDate: payEntry ? safeParseDate(payEntry.startDate) : new Date(),
    endDate: payEntry ? safeParseDate(payEntry.endDate) : new Date(),
    amount: payEntry?.amount || 0,
    client: payEntry?.client || "",
    notes: payEntry?.notes || "",
  }

  const form = useForm<PayFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Reset form when payEntry changes
  useEffect(() => {
    if (open) {
      form.reset({
        startDate: payEntry ? safeParseDate(payEntry.startDate) : new Date(),
        endDate: payEntry ? safeParseDate(payEntry.endDate) : new Date(),
        amount: payEntry?.amount || 0,
        client: payEntry?.client || "",
        notes: payEntry?.notes || "",
      })
    }
  }, [form, open, payEntry])

  async function onSubmit(values: PayFormValues) {
    setIsSubmitting(true)
    try {
      const payData = {
        startDate: format(values.startDate, "yyyy-MM-dd"),
        endDate: format(values.endDate, "yyyy-MM-dd"),
        amount: values.amount,
        client: values.client,
        notes: values.notes,
      }

      if (payEntry) {
        await updatePayEntryWithRefresh(payEntry.id, payData)
        toast({
          title: "Pay entry updated",
          description: "Your pay entry has been updated successfully",
        })
      } else {
        await addPayEntryWithRefresh(payData)
        toast({
          title: "Pay entry added",
          description: "Your pay entry has been added successfully",
        })
      }

      onOpenChange(false)
      form.reset(defaultValues)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save pay entry",
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
          <DialogTitle>{payEntry ? "Edit Pay Entry" : "Add Pay Entry"}</DialogTitle>
          <DialogDescription>
            {payEntry ? "Update the details of your pay entry." : "Add a new pay entry to your tracker."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Input placeholder="Client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Saving..." : payEntry ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  )
}
