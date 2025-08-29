// src/components/ui/stat-card.tsx
'use client'

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Variant = 'default' | 'success' | 'warning' | 'info' | 'danger'

type Props = {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  variant?: Variant
  className?: string
}

const skin: Record<
  Variant,
  {
    ring: string
    icon: string
    chip: string
    glow: string
  }
> = {
  default: {
    ring: 'ring-gray-200 dark:ring-white/10',
    icon: 'text-gray-500 dark:text-gray-300',
    chip: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-white/10 dark:text-white/80 dark:ring-white/15',
    glow: 'from-gray-200/40 to-transparent dark:from-white/10',
  },
  success: {
    ring: 'ring-emerald-200/70 dark:ring-emerald-400/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
    glow: 'from-emerald-300/40 to-transparent dark:from-emerald-400/15',
  },
  warning: {
    ring: 'ring-amber-200/70 dark:ring-amber-400/20',
    icon: 'text-amber-600 dark:text-amber-400',
    chip: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
    glow: 'from-amber-300/40 to-transparent dark:from-amber-400/15',
  },
  info: {
    ring: 'ring-sky-200/70 dark:ring-sky-400/20',
    icon: 'text-sky-600 dark:text-sky-400',
    chip: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
    glow: 'from-sky-300/40 to-transparent dark:from-sky-400/15',
  },
  danger: {
    ring: 'ring-rose-200/70 dark:ring-rose-400/20',
    icon: 'text-rose-600 dark:text-rose-400',
    chip: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
    glow: 'from-rose-300/40 to-transparent dark:from-rose-400/15',
  },
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
  className,
}: Props) {
  const theme = skin[variant] ?? skin.default

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm ring-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-neutral-950/60',
        theme.ring,
        className
      )}
    >
      {/* glow */}
      <div
        className={cn(
          'pointer-events-none absolute -inset-px opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100',
          `bg-gradient-to-br ${theme.glow}`
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {value}
          </div>
          {description && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl ring-1',
              theme.chip
            )}
            aria-hidden
          >
            <Icon className={cn('h-5 w-5', theme.icon)} />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
