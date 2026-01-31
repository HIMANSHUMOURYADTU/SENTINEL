import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type StatusType = 'low' | 'medium' | 'high' | 'critical' | 'success' | 'warning' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  pulse?: boolean;
  className?: string;
}

const statusStyles: Record<StatusType, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-risk-low/20', text: 'text-risk-low', border: 'border-risk-low/50' },
  medium: { bg: 'bg-risk-medium/20', text: 'text-risk-medium', border: 'border-risk-medium/50' },
  high: { bg: 'bg-risk-high/20', text: 'text-risk-high', border: 'border-risk-high/50' },
  critical: { bg: 'bg-risk-critical/20', text: 'text-risk-critical', border: 'border-risk-critical/50' },
  success: { bg: 'bg-success/20', text: 'text-success', border: 'border-success/50' },
  warning: { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning/50' },
  info: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/50' },
};

const statusLabels: Record<StatusType, string> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  critical: 'CRITICAL',
  success: 'SUCCESS',
  warning: 'WARNING',
  info: 'INFO',
};

export const StatusBadge = ({ status, label, pulse = false, className }: StatusBadgeProps) => {
  const styles = statusStyles[status];
  const displayLabel = label || statusLabels[status];

  return (
    <div className={cn('relative inline-flex', className)}>
      {pulse && (
        <motion.span
          className={cn('absolute inset-0 rounded', styles.bg)}
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      <span
        className={cn(
          'relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-mono font-medium tracking-wider',
          styles.bg,
          styles.text,
          styles.border
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', styles.text.replace('text-', 'bg-'))} />
        {displayLabel}
      </span>
    </div>
  );
};
