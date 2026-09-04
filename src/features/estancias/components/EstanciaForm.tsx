import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { AsyncButton } from '@/components/ui/async-button'
import { Input } from '@/components/ui/input'
import { estanciaSchema } from '@/features/estancias/schemas/estanciaSchema'
import type { EstanciaFormValues } from '@/features/estancias/schemas/estanciaSchema'

type EstanciaFormProps = {
  defaultValues?: EstanciaFormValues
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: EstanciaFormValues) => Promise<void>
  submitError?: string
  submitLabel: string
}

export default function EstanciaForm({
  defaultValues,
  isSubmitting,
  onCancel,
  onSubmit,
  submitError,
  submitLabel,
}: EstanciaFormProps) {
  const form = useForm<EstanciaFormValues>({
    resolver: zodResolver(estanciaSchema),
    defaultValues: {
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
    },
  })

  const { handleSubmit, control, reset } = form

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
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

          <FormField
            control={control}
            name="contacto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contacto</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="flex flex-wrap items-center gap-2">
          <AsyncButton type="submit" isLoading={isSubmitting}>
            {submitLabel}
          </AsyncButton>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Volver
          </Button>
        </div>
        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
      </form>
    </Form>
  )
}
