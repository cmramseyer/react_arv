export type AdjuntoLote = {
  id: number | string
  filename: string
  url: string
}

export type Lote = {
  id: number
  nombre: string
  nombre_estancia?: string
  estancia_id: number | string
  lat: number | string | null
  long: number | string | null
  link_mapa: string | null
  hectareas: number
  adjuntos?: AdjuntoLote[]
}
