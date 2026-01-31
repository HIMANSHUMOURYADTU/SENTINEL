import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = ({ 
  message = 'LOADING DATA...', 
  className 
}: LoadingStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4",
        className
      )}
    >
      <div className="relative">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <motion.div
          className="absolute inset-0 bg-primary/20 rounded-full blur-lg"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <p className="mt-4 text-xs font-mono tracking-wider text-muted-foreground">
        {message}
      </p>
    </motion.div>
  );
};
