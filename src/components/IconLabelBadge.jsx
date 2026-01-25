import React from 'react'
import { Tractor } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const iconMap = {
  Tractor,
}

export default function IconLabelBadge({
  iconName,
  value,
  tooltip,
  variant = 'outline',
  className,
}) {
  const Icon = iconMap[iconName]
  const badge = (
    <Badge variant={variant} className={cn('inline-flex items-center gap-1.5', className)}>
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {value}
    </Badge>
  )

  if (!tooltip) return badge

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
