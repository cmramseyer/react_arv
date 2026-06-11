export const ordenToForm = (data) => {
  console.log("ordenToForm", data.cultivo)
  return { 
    id: String(data.id) ?? '',
    estancia_id: String(data.estancia_id) ?? '',
    cultivo_id: String(data.cultivo.id) ?? '',
    sensible: data.sensible ?? false,
    comentarios: data.comentarios ?? '',
    datos_clima: data.datos_clima ?? '',
    info_trabajo: data.info_trabajo ?? '',
    creator: data.creator ?? '',
    fecha_trabajo: data.fecha_trabajo ?? '',
    maquinista_id: String(data.maquinista?.id) ?? '',
    lotes: data.lotes.map((e) => {
      return {
        orden_lote_id: e.id,
        lote_id: String(e.lote_id),
        hectareas_reales: e.hectareas_reales,
        dosis: e.dosis.map((d) => { 
          return {
            orden_lote_dosis_id: d.id,
            producto_id: String(d.producto_id),
            cantidad: d.cantidad 
          }
        })
      }
    })

  }
}
