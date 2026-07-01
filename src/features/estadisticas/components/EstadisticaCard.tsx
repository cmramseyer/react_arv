import React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { Estadisticas } from '@/features/estadisticas/types'


const createChartConfig = (colorVar) => ({
  hectareas: {
    label: 'Hectáreas',
    color: `var(${colorVar})`,
  },
})

const formatAxisValue = (value) => {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return value
  return parsed.toLocaleString('es-AR')
}

type EstadisticaCardProps = {
  loading: boolean,
  title: string,
  data: Estadisticas[],
  dataKey: string,
  chart: null
}

export default function EstadisticaCard({
  loading,
  title,
  data,
  dataKey,
  chart 
}: EstadisticaCardProps) {

  if (loading) { return <div>Cargando...</div> }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={createChartConfig(`--chart-${chart}`)}
          className="h-[300px] w-full"
        >
          <BarChart data={data} layout="vertical" margin={{ left: 24, right: 16 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={140}
            />
            <XAxis
              dataKey="hectareas"
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatAxisValue}
            />
            <ChartTooltip content={<ChartTooltipContent/>} />
            <Bar dataKey={dataKey} fill="var(--color-hectareas)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )

}
