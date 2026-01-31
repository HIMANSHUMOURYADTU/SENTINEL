import { motion } from 'framer-motion';
import { Phone, ArrowRight, PhoneOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { CallRecord } from '@/types/dashboard';

interface RecentCallsProps {
  calls?: CallRecord[];
  isLoading?: boolean;
  onCallClick?: (callId: string) => void;
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'flagged': return 'warning';
    case 'escalated': return 'critical';
    case 'in_progress': return 'info';
    default: return 'info';
  }
};

const getRiskStatus = (risk: number) => {
  if (risk <= 25) return 'low';
  if (risk <= 50) return 'medium';
  if (risk <= 75) return 'high';
  return 'critical';
};

export const RecentCalls = ({ calls = [], isLoading = false, onCallClick }: RecentCallsProps) => {
  return (
    <GlassCard variant="elevated">
      <GlassCardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs tracking-wider text-muted-foreground">RECENT CALLS</span>
        </div>
        <Link to="/calls" className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
          VIEW ALL <ArrowRight className="w-3 h-3" />
        </Link>
      </GlassCardHeader>
      <GlassCardContent className="p-0">
        {isLoading ? (
          <div className="p-4">
            <LoadingState message="LOADING CALLS..." />
          </div>
        ) : calls.length === 0 ? (
          <EmptyState 
            icon={PhoneOff}
            title="NO RECENT CALLS"
            description="Call history will appear here as calls are processed"
          />
        ) : (
          <div className="divide-y divide-border/50">
            {calls.map((call, i) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onCallClick?.(call.id)}
                className="px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{call.id}</span>
                      <StatusBadge status={getStatusType(call.status) as any} label={call.status.toUpperCase()} />
                    </div>
                    <p className="text-sm font-medium mt-1">{call.caller}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs font-mono text-muted-foreground">RISK</span>
                      <StatusBadge status={getRiskStatus(call.risk)} label={`${call.risk}`} />
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-1">{call.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
