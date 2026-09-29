'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = 'vs mês anterior',
  icon,
  iconColor,
  bgColor,
  trend = 'neutral',
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600 dark:text-green-400' :
                     trend === 'down' ? 'text-red-600 dark:text-red-400' :
                     'text-gray-500 dark:text-gray-400';

  return (
    <Card variant="default">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                <TrendIcon className={clsx('h-4 w-4', trendColor)} />
                <span className={clsx('text-sm font-medium', trendColor)}>
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className={clsx('p-3 rounded-xl', bgColor)}>
            <div className={clsx('h-6 w-6', iconColor)}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}