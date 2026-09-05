import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { AsyncButton } from '@/components/ui/async-button'
import { Input } from '@/components/ui/input'
import { cultivoSchema } from '@/features/cultivos/schemas/cultivoSchema'
import type { CultivoFormValues } from '@/features/cultivos/schemas/cultivoSchema'

type CultivoFormProps = {
  defaultValues?: CultivoFormValues
  isSubmitting: boolean
  onSubmit: (values: CultivoFormValues) => Promise<void>
  submitLabel: string
}

export default function CultivoForm({ defaultValues, isSubmitting, onSubmit, submitLabel }: CultivoFormProps) {
  const form = useForm<CultivoFormValues>({
    resolver: zodResolver(cultivoSchema),
    defaultValues: {
      nombre: '',
    }
  })

  const { handleSubmit, control, reset } = form

  useEffect(() => {
    if (defaultValues) { reset(defaultValues) }
  }, [defaultValues, reset])

  return (
    <Form {...form}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center gap-2">
          <AsyncButton type="submit" isLoading={isSubmitting}>{submitLabel}</AsyncButton>
        </div>
      </form>
    </Form>
  )
}
