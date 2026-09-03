import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ProductoForm from '@/features/productos/components/ProductoForm'

type ProductoNuevoDialogProps = {
  isNuevoProductoOpen: boolean,
  onProductoOpen: (open: boolean) => void
}

export default function ProductoNuevoDialog({ isNuevoProductoOpen, onProductoOpen }: ProductoNuevoDialogProps) {

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
          formAction='create'
          onSuccess={() => onProductoOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
