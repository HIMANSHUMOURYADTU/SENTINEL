import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RiskMeterProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const getRiskLevel = (value: number) => {
  if (value <= 25) return { label: 'LOW', color: 'text-risk-low', bg: 'bg-risk-low' };
  if (value <= 50) return { label: 'MEDIUM', color: 'text-risk-medium', bg: 'bg-risk-medium' };
  if (value <= 75) return { label: 'HIGH', color: 'text-risk-high', bg: 'bg-risk-high' };
  return { label: 'CRITICAL', color: 'text-risk-critical', bg: 'bg-risk-critical' };
};

const sizeConfig = {
  sm: { width: 120, strokeWidth: 8, fontSize: 'text-xl' },
  md: { width: 180, strokeWidth: 12, fontSize: 'text-3xl' },
  lg: { width: 240, strokeWidth: 16, fontSize: 'text-5xl' },
};

export const RiskMeter = ({ value, size = 'md', showLabel = true, className }: RiskMeterProps) => {
  const config = sizeConfig[size];
  const risk = getRiskLevel(value);
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const progress = (value / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: config.width, height: config.width / 2 + 20 }}>
        <svg
          width={config.width}
          height={config.width / 2 + 20}
          viewBox={`0 0 ${config.width} ${config.width / 2 + 20}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <motion.path
            d={`M ${config.strokeWidth / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
            fill="none"
            stroke={`hsl(var(--risk-${risk.label.toLowerCase()}))`}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * 180 - 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = config.width / 2 + (radius - config.strokeWidth) * Math.cos(rad);
            const y1 = config.width / 2 + (radius - config.strokeWidth) * Math.sin(rad);
            const x2 = config.width / 2 + (radius + 5) * Math.cos(rad);
            const y2 = config.width / 2 + (radius + 5) * Math.sin(rad);
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                opacity={0.5}
              />
            );
          })}
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.span
            className={cn('font-display', config.fontSize, risk.color)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {value}
          </motion.span>
        </div>
      </div>

      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={cn(
            'px-3 py-1 rounded text-xs font-mono font-semibold tracking-wider',
            risk.bg,
            'text-background'
          )}
        >
          {risk.label} RISK
        </motion.div>
      )}
    </div>
  );
};
