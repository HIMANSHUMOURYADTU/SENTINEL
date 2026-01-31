import { motion } from 'framer-motion';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export const EmptyState = ({ 
  icon: Icon = Inbox, 
  title, 
  description,
  className 
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="relative mb-4">
        <Icon className="w-12 h-12 text-muted-foreground/50" />
        <motion.div
          className="absolute inset-0 bg-primary/10 rounded-full blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
      <h3 className="font-display text-lg tracking-wider text-muted-foreground mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs font-mono text-muted-foreground/70 max-w-xs">
          {description}
        </p>
      )}
    </motion.div>
  );
};
