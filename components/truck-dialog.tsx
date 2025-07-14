"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useData } from "@/lib/data-context"
import { ScrollableDialogContent } from "@/components/scrollable-dialog-content"
import { Spinner } from "@/components/ui/spinner"
import { motion } from "framer-motion"

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Truck name is required",
  }),
  identifier: z.string().min(1, {
    message: "Truck identifier is required",
  }),
  make: z.string().min(1, {
    message: "Make is required",
  }),
  model: z.string().min(1, {
    message: "Model is required",
  }),
  year: z.coerce.number().int().positive({
    message: "Year must be a positive number",
  }),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  notes: z.string().optional(),
})

type TruckFormValues = z.infer<typeof formSchema>

interface TruckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  truck?: {
    id: string
    name: string
    identifier: string
    make: string
    model: string
    year: number
    vin?: string
    licensePlate?: string
    notes?: string
  }
}

export function TruckDialog({ open, onOpenChange, truck }: TruckDialogProps) {
  const { toast } = useToast()
  const { addTruckWithRefresh, updateTruckWithRefresh } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<TruckFormValues> = {
    name: truck?.name || "",
    identifier: truck?.identifier || "",
    make: truck?.make || "",
    model: truck?.model || "",
    year: truck?.year || new Date().getFullYear(),
    vin: truck?.vin || "",
    licensePlate: truck?.licensePlate || "",
    notes: truck?.notes || "",
  }

  const form = useForm<TruckFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: TruckFormValues) {
    setIsSubmitting(true)
    try {
      const truckData = {
        name: values.name,
        identifier: values.identifier,
        make: values.make,
        model: values.model,
        year: values.year,
        vin: values.vin || "",
        licensePlate: values.licensePlate || "",
        notes: values.notes || "",
      }

      if (truck) {
        await updateTruckWithRefresh(truck.id, truckData)
        toast({
          title: "Truck updated",
          description: "Your truck has been updated successfully",
        })
      } else {
        await addTruckWithRefresh(truckData)
        toast({
          title: "Truck added",
          description: "Your truck has been added successfully",
        })
      }

      onOpenChange(false)
      form.reset(defaultValues)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save truck",
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
          <DialogTitle>{truck ? "Edit Truck" : "Add Truck"}</DialogTitle>
          <DialogDescription>
            {truck ? "Update the details of your truck." : "Add a new truck to your fleet."}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Truck Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Truck" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identifier</FormLabel>
                    <FormControl>
                      <Input placeholder="TRK-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="Peterbilt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="579" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={new Date().getFullYear().toString()}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? new Date().getFullYear() : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIN (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Vehicle Identification Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="License Plate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes about this truck" {...field} />
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
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : truck ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </Button>
            </motion.div>
          </motion.form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  )
}
