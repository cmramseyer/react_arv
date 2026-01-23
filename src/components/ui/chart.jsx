import * as React from "react"
import { Legend, ResponsiveContainer, Tooltip } from "recharts"

import { cn } from "@/lib/utils"

const ChartContext = React.createContext(null)

const useChart = () => {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

const ChartStyle = ({ id, config }) => {
  const entries = Object.entries(config ?? {}).filter(([, value]) => value?.color)

  if (entries.length === 0) return null

  const css = entries
    .map(([key, value]) => `--color-${key}: ${value.color};`)
    .join("\n")

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=\"${id}\"] {${css}}`,
      }}
    />
  )
}

const ChartContainer = React.forwardRef(function ChartContainer(
  { id, className, config, children, ...props },
  ref
) {
  const chartId = id ?? React.useId()

  return (
    <ChartContext.Provider value={{ config }}>
      <div ref={ref} data-chart={chartId} className={cn("flex w-full", className)} {...props}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
      <ChartStyle id={chartId} config={config} />
    </ChartContext.Provider>
  )
})

ChartContainer.displayName = "ChartContainer"

const ChartTooltip = Tooltip
const ChartLegend = Legend

const ChartTooltipContent = React.forwardRef(function ChartTooltipContent(
  {
    active,
    payload,
    label,
    className,
    hideLabel = false,
    hideIndicator = false,
    indicator = "dot",
    valueFormatter,
  },
  ref
) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        "border-border/50 bg-background grid min-w-[180px] gap-2 rounded-md border px-3 py-2 text-xs shadow-xl",
        className
      )}
    >
      {!hideLabel && label ? (
        <div className="text-muted-foreground text-xs font-medium">{label}</div>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const key = item.dataKey
          const itemConfig = config?.[key] ?? {}
          const indicatorStyle = indicator === "line" ? "w-2.5 h-0.5" : "h-2.5 w-2.5 rounded-full"
          const displayValue = valueFormatter ? valueFormatter(item.value) : item.value

          return (
            <div key={`${key}-${item.value}`} className="flex items-center gap-2">
              {!hideIndicator && (
                <span
                  className={cn("bg-foreground shrink-0", indicatorStyle)}
                  style={{ backgroundColor: itemConfig.color }}
                />
              )}
              <span className="text-muted-foreground">{itemConfig.label ?? item.name}</span>
              <span className="ml-auto font-medium text-foreground">{displayValue}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})

ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegendContent = React.forwardRef(function ChartLegendContent(
  { className, payload, hideIndicator = false, indicator = "dot" },
  ref
) {
  const { config } = useChart()

  if (!payload?.length) return null

  return (
    <div ref={ref} className={cn("flex flex-wrap gap-4", className)}>
      {payload.map((item) => {
        const key = item.dataKey
        const itemConfig = config?.[key] ?? {}
        const indicatorStyle = indicator === "line" ? "w-2.5 h-0.5" : "h-2.5 w-2.5 rounded-full"

        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            {!hideIndicator && (
              <span
                className={cn("bg-foreground shrink-0", indicatorStyle)}
                style={{ backgroundColor: itemConfig.color }}
              />
            )}
            <span className="text-muted-foreground">{itemConfig.label ?? item.value}</span>
          </div>
        )}
      )}
    </div>
  )
})

ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
