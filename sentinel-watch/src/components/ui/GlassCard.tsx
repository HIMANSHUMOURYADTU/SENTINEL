import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'bordered';
  glow?: 'none' | 'primary' | 'warning' | 'destructive';
  children: React.ReactNode;
}

const glowStyles = {
  none: '',
  primary: 'shadow-[0_0_30px_hsl(var(--primary)/0.15)]',
  warning: 'shadow-[0_0_30px_hsl(var(--warning)/0.15)]',
  destructive: 'shadow-[0_0_30px_hsl(var(--destructive)/0.15)]',
};

const variantStyles = {
  default: 'bg-card/70 backdrop-blur-md border border-border/50',
  elevated: 'bg-card/80 backdrop-blur-lg border border-border/60 shadow-xl',
  bordered: 'bg-card/60 backdrop-blur-sm border-2 border-primary/30',
};

export const GlassCard = ({
  variant = 'default',
  glow = 'none',
  children,
  className,
  ...props
}: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        'rounded-lg overflow-hidden',
        variantStyles[variant],
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const GlassCardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('px-4 py-3 border-b border-border/50', className)}>
    {children}
  </div>
);

export const GlassCardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-4', className)}>
    {children}
  </div>
);
