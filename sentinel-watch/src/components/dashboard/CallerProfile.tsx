import { motion } from 'framer-motion';
import { User, Phone, Calendar, Clock, Target, UserX } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { CallerData } from '@/types/dashboard';

interface CallerProfileProps {
  caller?: CallerData | null;
  isLoading?: boolean;
}

const getRiskHistoryStatus = (history: string) => {
  switch (history.toLowerCase()) {
    case 'low': return 'low';
    case 'medium': return 'medium';
    case 'high': return 'high';
    case 'critical': return 'critical';
    default: return 'low';
  }
};

export const CallerProfile = ({ caller, isLoading = false }: CallerProfileProps) => {
  return (
    <GlassCard variant="elevated" className="h-full">
      <GlassCardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs tracking-wider text-muted-foreground">CALLER PROFILE</span>
        </div>
        {caller && <StatusBadge status="info" label="ACTIVE" pulse />}
      </GlassCardHeader>
      <GlassCardContent>
        {isLoading ? (
          <LoadingState message="LOADING CALLER DATA..." />
        ) : !caller ? (
          <EmptyState 
            icon={UserX}
            title="NO ACTIVE CALL"
            description="Caller information will appear when a call is connected"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Caller Name & ID */}
            <div>
              <h3 className="font-display text-xl tracking-wider">{caller.name}</h3>
              <p className="text-xs font-mono text-muted-foreground">ID: {caller.id}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs">{caller.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs">{caller.intent}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs">{caller.lastVerified}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs">{caller.callDuration}</span>
              </div>
            </div>

            {/* Account Info */}
            <div className="pt-3 border-t border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-muted-foreground">ACCOUNT</span>
                <span className="font-mono text-sm">{caller.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-mono text-muted-foreground">CALLS THIS MONTH</span>
                <span className="font-mono text-sm">{caller.callsThisMonth}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-mono text-muted-foreground">RISK HISTORY</span>
                <StatusBadge status={getRiskHistoryStatus(caller.riskHistory)} label={caller.riskHistory.toUpperCase()} />
              </div>
            </div>
          </motion.div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
