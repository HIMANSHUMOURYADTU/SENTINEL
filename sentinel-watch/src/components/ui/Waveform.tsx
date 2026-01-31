import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WaveformProps {
  bars?: number;
  active?: boolean;
  color?: 'primary' | 'warning' | 'destructive' | 'success';
  className?: string;
}

const colorMap = {
  primary: 'bg-primary',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  success: 'bg-success',
};

export const Waveform = ({ bars = 24, active = true, color = 'primary', className }: WaveformProps) => {
  return (
    <div className={cn('flex items-end justify-center gap-[2px] h-16', className)}>
      {Array.from({ length: bars }).map((_, i) => {
        const delay = i * 0.05;
        const baseHeight = Math.sin((i / bars) * Math.PI) * 0.7 + 0.3;
        
        return (
          <motion.div
            key={i}
            className={cn('w-1 rounded-full', colorMap[color])}
            initial={{ height: '20%' }}
            animate={
              active
                ? {
                    height: ['20%', `${baseHeight * 100}%`, '20%'],
                    opacity: [0.5, 1, 0.5],
                  }
                : { height: '20%', opacity: 0.3 }
            }
            transition={
              active
                ? {
                    duration: 0.8 + Math.random() * 0.4,
                    repeat: Infinity,
                    delay,
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          />
        );
      })}
    </div>
  );
};
