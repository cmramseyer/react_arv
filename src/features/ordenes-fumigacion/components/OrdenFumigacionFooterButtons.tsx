import React from "react";
import { Button } from '@/components/ui/button'

export default function OrdenFumigacionFooterButtons({}) {
  return (
    <>
      <Button onClick={onEditar} variant="default">
        Editar
      </Button>
      {!isTerminada ? (
        <Button onClick={onTerminar} variant="default">
          Terminar
        </Button>
      ) : null}
      <Button onClick={onBorrar} variant="default">
        Borrar
      </Button>
      <Button onClick={onGenerarPdf} variant="default">
        {labelGenerarPdf}
      </Button>
      {botonVerPdf}
      <Button
        variant="secondary"
        onClick={() => navigate("/ordenes_fumigacion")}
      >
        Volver
      </Button>
    </>
  );
}
