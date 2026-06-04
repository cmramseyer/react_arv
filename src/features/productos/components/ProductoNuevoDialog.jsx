import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ProductoForm from '@/features/productos/components/ProductoForm'
import { Button } from '@/components/ui/button'

export default function ProductoNuevoDialog({ isNuevoProductoOpen, onCreate, onProductoOpen }) {

  return (
    <Dialog open={isNuevoProductoOpen} onOpenChange={(open) => onProductoOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Producto</DialogTitle>
          <DialogDescription className="sr-only">
            Formulario para crear un nuevo producto sin salir de la orden.
          </DialogDescription>
        </DialogHeader>

        <ProductoForm
          onSubmit={onCreate}
          submitLabel="Crear"
          onSuccess={() => onProductoOpen(false)}
          actions={(
            <Button type="button" variant="secondary" onClick={() => onProductoOpen(false)}>
              Cancelar
            </Button>
          )}
        />
      </DialogContent>
    </Dialog>
  )
}
