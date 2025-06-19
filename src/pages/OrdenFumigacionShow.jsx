import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrdenFumigacion, deleteOrdenFumigacion, imprimirOrdenFumigacion } from '../services/ordenesFumigacionService'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"


export default function OrdenFumigacionShow() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [orden, setOrden] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [fechaPdf, setFechaPdf] = useState(null)
  const [nombreLote, setNombreLote] = useState(null)
  const [hectareasLote, setHectareasLote] = useState(null)

  useEffect(()=> {
    getOrdenFumigacion(id).then((data) => {
      setOrden(data)
      setPdfUrl(data.orden_url)
      setPdfUrl(data.orden_pdf_fecha_creacion)
      console.log("data data")
      console.log(data)
      const lotePresent = (data.lotes_ids && data.lotes_ids.length > 0) === true
      console.log(lotePresent)
      const nombreLote = lotePresent ? data.nombre_lote : data.temp_lotes
      const hectareasLote = lotePresent ? data.hectareas : data.temp_hectareas 
      setNombreLote(nombreLote)
      setHectareasLote(hectareasLote)
    })
  }, [id])

  

  const handleEditar = () => {
    navigate(`/ordenes_fumigacion/${id}/editar`)
  }

  const handleTerminar = () => {
    navigate(`/ordenes_fumigacion/${id}/terminar`)
  }

  const handleBorrar = async () => {
    if (confirm('¿Seguro quieres borrar esta orden?')) {
      await deleteOrdenFumigacion(id)
      navigate('/ordenes_fumigacion')
    }
  }

  const handleGenerarPdf = async () => {
    imprimirOrdenFumigacion(id).then((data) => {
      setPdfUrl(data.orden_url)
      setFechaPdf(data.orden_pdf_fecha_creacion)
    })
  }

  const handleVerPdf = async () => {
    window.open(pdfUrl, '_blank');
  }

  const labelGenerarPdf = !!pdfUrl ? "Regenerar PDF" : "Generar PDF"

  const botonVerPdf = !!pdfUrl && (
    <Button onClick={handleVerPdf} variant="default">
      Ver Pdf
    </Button>
  )

  if (!orden) {
    return <div className="p-4">Cargando...</div>
  }

  return (

    <Card className="w-full">
      <CardHeader>
        <CardTitle>#{orden.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Estancia: {orden.nombre_estancia}</div>
        <div>Lote: {nombreLote}</div>
        <div>Estado: {orden.estado_orden}</div>
        <div>Hectareas: {hectareasLote}</div>
        <div>Creado por: {orden.creado_por}</div>
        <div className="hidden md:block">Fecha trabajo: {orden.fecha_trabajo || 'Pendiente'}</div>
        <p><strong>Fecha de Creación:</strong> {new Date(orden.created_at).toLocaleString()}</p>
        <p><strong>Maquinista:</strong> {orden.maquinista}</p>
        <p><strong>Info Trabajo:</strong> {orden.info_trabajo}</p>
        <p><strong>Datos Clima:</strong> {orden.datos_clima}</p>
        <p><strong>PDF creado:</strong> {fechaPdf || orden.orden_pdf_fecha_creacion}</p>
        <h3 className="font-semibold mt-4">Dosis</h3>
        <ul className="list-disc list-inside">
          {orden.dosis.map((dosis, idx) => (
            <li key={idx}>{dosis.producto} - {dosis.cantidad} - {dosis.unidad_medida}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleEditar} variant="default">Editar</Button>
        <Button onClick={handleTerminar} variant="default">Terminar</Button>
        <Button onClick={handleBorrar} variant="default">Borrar</Button>
        <Button onClick={handleGenerarPdf} variant="default">
          {labelGenerarPdf}
        </Button>
        {botonVerPdf}
      </CardFooter>
    </Card>

  )
}
