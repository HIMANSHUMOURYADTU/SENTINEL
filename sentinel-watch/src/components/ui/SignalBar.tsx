import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SignalBarProps {
  label: string;
  value: number;
  maxValue?: number;
  status?: 'low' | 'medium' | 'high' | 'critical';
  delay?: number;
  className?: string;
}

const statusColors = {
  low: 'bg-risk-low',
  medium: 'bg-risk-medium',
  high: 'bg-risk-high',
  critical: 'bg-risk-critical',
};

export const SignalBar = ({
  label,
  value,
  maxValue = 100,
  status,
  delay = 0,
  className,
}: SignalBarProps) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  // Auto-determine status if not provided
  const autoStatus = status || (
    percentage <= 25 ? 'low' :
    percentage <= 50 ? 'medium' :
    percentage <= 75 ? 'high' : 'critical'
  );

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={cn(
          'font-semibold',
          autoStatus === 'low' && 'text-risk-low',
          autoStatus === 'medium' && 'text-risk-medium',
          autoStatus === 'high' && 'text-risk-high',
          autoStatus === 'critical' && 'text-risk-critical'
        )}>
          {value.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', statusColors[autoStatus])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
