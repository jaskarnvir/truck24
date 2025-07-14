"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useData } from "@/lib/data-context"
import { ScrollableDialogContent } from "@/components/scrollable-dialog-content"
import { LoadingButton } from "@/components/ui/loading-button"
import { motion } from "framer-motion"

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required",
  }),
  truckId: z.string({
    required_error: "Please select a truck",
  }),
  serviceType: z.string({
    required_error: "Please select a service type",
  }),
  mileage: z.coerce.number().positive({
    message: "Mileage must be a positive number",
  }),
  cost: z.coerce.number().positive({
    message: "Cost must be a positive number",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
})

type MaintenanceFormValues = z.infer<typeof formSchema>

interface MaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  maintenanceLog?: {
    id: string
    date: string
    truckId: string
    serviceType: string
    mileage: number
    cost: number
    description: string
  }
}

export function MaintenanceDialog({ open, onOpenChange, maintenanceLog }: MaintenanceDialogProps) {
  const { toast } = useToast()
  const { trucks, addMaintenanceLogWithRefresh, updateMaintenanceLogWithRefresh } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<MaintenanceFormValues> = {
    date: maintenanceLog ? new Date(maintenanceLog.date) : new Date(),
    truckId: maintenanceLog?.truckId || "",
    serviceType: maintenanceLog?.serviceType || "",
    mileage: maintenanceLog?.mileage || 0,
    cost: maintenanceLog?.cost || 0,
    description: maintenanceLog?.description || "",
  }

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: MaintenanceFormValues) {
    setIsSubmitting(true)
    try {
      const maintenanceData = {
        date: format(values.date, "yyyy-MM-dd"),
        truckId: values.truckId,
        serviceType: values.serviceType,
        mileage: values.mileage,
        cost: values.cost,
        description: values.description,
      }

      if (maintenanceLog) {
        await updateMaintenanceLogWithRefresh(maintenanceLog.id, maintenanceData)
        toast({
          title: "Maintenance log updated",
          description: "Your maintenance log has been updated successfully",
        })
      } else {
        await addMaintenanceLogWithRefresh(maintenanceData)
        toast({
          title: "Maintenance log added",
          description: "Your maintenance log has been added successfully",
        })
      }

      onOpenChange(false)
      form.reset(defaultValues)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save maintenance log",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent>
        <DialogHeader>
          <DialogTitle>{maintenanceLog ? "Edit Maintenance Log" : "Add Maintenance Log"}</DialogTitle>
          <DialogDescription>
            {maintenanceLog
              ? "Update the details of your maintenance log."
              : "Add a new maintenance log to your tracker."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={formVariants}
          >
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Service Date</FormLabel>
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
                        <Calendar mode="single" selected={field.value as Date} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
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
                          <SelectItem value="default">Add trucks in settings</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Oil Change">Oil Change</SelectItem>
                        <SelectItem value="Tire Replacement">Tire Replacement</SelectItem>
                        <SelectItem value="Brake Service">Brake Service</SelectItem>
                        <SelectItem value="Engine Repair">Engine Repair</SelectItem>
                        <SelectItem value="Transmission">Transmission</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Inspection">Inspection</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Mileage</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter service details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                loadingText={maintenanceLog ? "Updating..." : "Adding..."}
                className="w-full sm:w-auto"
              >
                {maintenanceLog ? "Update" : "Add"}
              </LoadingButton>
            </motion.div>
          </motion.form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  )
}
