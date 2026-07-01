import React from 'react'
import { Calendar, CalendarCheck, File, ReceiptText, Sprout, Tractor } from 'lucide-react'
import { Badge, badgeVariants } from '@/components/ui/badge'
import type { VariantProps } from 'class-variance-authority'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const iconMap = {
  Calendar,
  CalendarCheck,
  File,
  ReceiptText,
  Sprout,
  Tractor,
}



type IconLabelBadgeProps = {
  iconName: string,
  value: string,
  tooltip: string,
  variant: VariantProps<typeof badgeVariants>['variant'],
  className?: string
}

export default function IconLabelBadge({
  iconName,
  value,
  tooltip,
  variant = 'outline',
  className,
}: IconLabelBadgeProps) {
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
