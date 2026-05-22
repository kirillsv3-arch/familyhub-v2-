'use client';

import { WishlistPriority } from '@/types';
import { Sparkles, Hourglass, Gift, AlertCircle, LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export const PRIORITY_CONFIG: Record<WishlistPriority, { label: string, icon: LucideIcon, color: string, bg: string, text: string }> = {
  idea: {
    label: 'Идея',
    icon: Sparkles,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400'
  },
  someday: {
    label: 'Когда-нибудь',
    icon: Hourglass,
    color: 'text-zinc-500',
    bg: 'bg-zinc-50 dark:bg-zinc-500/10',
    text: 'text-zinc-700 dark:text-zinc-400'
  },
  want: {
    label: 'Хочется',
    icon: Gift,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    text: 'text-purple-700 dark:text-purple-400'
  },
  urgent: {
    label: 'Нужно срочно',
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400'
  },
};

interface PriorityBadgeProps {
  priority: WishlistPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;

  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      config.bg,
      config.text,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
