import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getCultivos } from '@/features/cultivos/api/cultivosService'
import { getEstancias } from '@/features/estancias/api/estanciasService'
import { getLotesPorEstancia } from '@/features/lotes/api/lotesService'
import { getMaquinistas } from '@/features/maquinistas/api/maquinistasService'
import { getOrdenesFumigacion } from '../services/ordenesFumigacionService'
import OrdenFumigacionCard from '../components/OrdenFumigacionCard'

const formatApiDate = (date) => format(date, 'yyyy-MM-dd')
const formatDisplayDate = (date) => format(date, 'dd/MM/yyyy')

export default function BuscarOrden() {
  const navigate = useNavigate()
  const [estancias, setEstancias] = useState([])
  const [lotes, setLotes] = useState([])
  const [cultivos, setCultivos] = useState([])
  const [maquinistas, setMaquinistas] = useState([])
  const [estanciaId, setEstanciaId] = useState('')
  const [loteId, setLoteId] = useState('')
  const [cultivoId, setCultivoId] = useState('')
  const [maquinistaId, setMaquinistaId] = useState('')
  const [nroOrdenCliente, setNroOrdenCliente] = useState('')
  const [nroFactura, setNroFactura] = useState('')
  const [range, setRange] = useState()
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    getEstancias().then(setEstancias)
    getCultivos().then(setCultivos)
    getMaquinistas().then(setMaquinistas)
  }, [])

  useEffect(() => {
    if (estanciaId) {
      getLotesPorEstancia(estanciaId).then(setLotes)
    } else {
      setLotes([])
    }
    setLoteId('')
  }, [estanciaId])

  const rangeLabel = useMemo(() => {
    if (!range?.from) return 'Seleccionar rango'
    if (!range?.to) return formatDisplayDate(range.from)
    return `${formatDisplayDate(range.from)} - ${formatDisplayDate(range.to)}`
  }, [range])

  const handleBuscar = async () => {
    const filters = {}
    if (estanciaId) filters.estancia_id = estanciaId
    if (loteId) filters.lote_id = loteId
    if (cultivoId) filters.cultivo_id = cultivoId
    if (maquinistaId) filters.maquinista_id = maquinistaId
    if (nroOrdenCliente) filters.nro_orden_cliente = nroOrdenCliente
    if (nroFactura) filters.nro_factura = nroFactura
    if (range?.from) filters.fecha_desde = formatApiDate(range.from)
    if (range?.to) filters.fecha_hasta = formatApiDate(range.to)

    setHasSearched(true)
    setLoading(true)
    try {
      const data = await getOrdenesFumigacion(filters)
      setOrdenes(Array.isArray(data) ? data : [])
    } catch {
      setOrdenes([])
    } finally {
      setLoading(false)
    }
  }

  const handleResetFiltros = () => {
    setEstanciaId('')
    setLoteId('')
    setCultivoId('')
    setMaquinistaId('')
    setNroOrdenCliente('')
    setNroFactura('')
    setRange()
    setOrdenes([])
    setHasSearched(false)
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Buscar órdenes</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <span className="text-sm font-medium">Estancia</span>
              <Select value={estanciaId} onValueChange={setEstanciaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {estancias.map((estancia) => (
                    <SelectItem key={String(estancia.id)} value={String(estancia.id)}>
                      {estancia.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Lote</span>
              <Select
                value={loteId}
                onValueChange={setLoteId}
                disabled={!estanciaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={estanciaId ? 'Seleccionar...' : 'Seleccionar estancia'} />
                </SelectTrigger>
                <SelectContent>
                  {lotes.map((lote) => (
                    <SelectItem key={String(lote.id)} value={String(lote.id)}>
                      {lote.nombre_lote || lote.nombre || 'Sin nombre'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Cultivo</span>
              <Select value={cultivoId} onValueChange={setCultivoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {cultivos.map((cultivo) => (
                    <SelectItem key={String(cultivo.id)} value={String(cultivo.id)}>
                      {cultivo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Maquinista</span>
              <Select value={maquinistaId} onValueChange={setMaquinistaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {maquinistas.map((maquinista) => (
                    <SelectItem key={String(maquinista.id)} value={String(maquinista.id)}>
                      {maquinista.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Nro. Orden Cliente</span>
              <Input
                value={nroOrdenCliente}
                onChange={(event) => setNroOrdenCliente(event.target.value)}
                placeholder="Ingresar..."
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Nro. Factura</span>
              <Input
                value={nroFactura}
                onChange={(event) => setNroFactura(event.target.value)}
                placeholder="Ingresar..."
              />
            </div>

            <div className="space-y-2 md:col-span-2 xl:col-span-1">
              <span className="text-sm font-medium">Rango de fechas</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !range?.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rangeLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    numberOfMonths={2}
                    defaultMonth={range?.from}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleBuscar} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleResetFiltros}
              disabled={loading}
            >
              Borrar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {!loading && hasSearched && ordenes.length === 0 && (
          <div className="text-sm text-muted-foreground">Sin resultados.</div>
        )}
        {ordenes.map((orden) => (
          <OrdenFumigacionCard
            key={orden.id}
            orden={orden}
            onVerOrden={(id) => navigate(`/ordenes_fumigacion/${id}`)}
          />
        ))}
      </div>
    </div>
  )
}
