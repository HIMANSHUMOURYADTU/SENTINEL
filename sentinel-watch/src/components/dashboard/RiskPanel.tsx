import { motion } from 'framer-motion';
import { AlertTriangle, Info, Zap, ShieldCheck, AlertCircle, ShieldOff } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { RiskMeter } from '@/components/ui/RiskMeter';
import { SignalBar } from '@/components/ui/SignalBar';
import { Waveform } from '@/components/ui/Waveform';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { RiskData, RecommendationType } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface RiskPanelProps {
  data?: RiskData | null;
  isLoading?: boolean;
}

const recommendationConfig: Record<RecommendationType, { 
  icon: typeof Zap; 
  label: string; 
  color: string; 
  bg: string; 
  border: string;
}> = {
  FAST_LANE: { icon: Zap, label: 'FAST LANE', color: 'text-success', bg: 'bg-success/20', border: 'border-success/50' },
  COGNITIVE_TEST: { icon: AlertTriangle, label: 'COGNITIVE TEST', color: 'text-warning', bg: 'bg-warning/20', border: 'border-warning/50' },
  STEP_UP: { icon: ShieldCheck, label: 'STEP-UP VERIFICATION', color: 'text-risk-high', bg: 'bg-risk-high/20', border: 'border-risk-high/50' },
  BLOCK: { icon: AlertCircle, label: 'BLOCK CALL', color: 'text-risk-critical', bg: 'bg-risk-critical/20', border: 'border-risk-critical/50' },
};

export const RiskPanel = ({ data, isLoading = false }: RiskPanelProps) => {
  const rec = data ? recommendationConfig[data.recommendation] : null;
  const RecIcon = rec?.icon || ShieldOff;

  return (
    <GlassCard 
      variant="elevated" 
      glow={data ? (data.overallScore > 70 ? 'destructive' : data.overallScore > 40 ? 'warning' : 'none') : 'none'}
      className="h-full"
    >
      <GlassCardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span className="font-mono text-xs tracking-wider text-muted-foreground">RISK ANALYSIS</span>
        </div>
        {data && (
          <span className="font-mono text-xs text-muted-foreground">
            CONFIDENCE: <span className="text-foreground">{(data.confidence * 100).toFixed(0)}%</span>
          </span>
        )}
      </GlassCardHeader>
      <GlassCardContent>
        {isLoading ? (
          <LoadingState message="ANALYZING CALL..." />
        ) : !data ? (
          <EmptyState 
            icon={ShieldOff}
            title="NO RISK DATA"
            description="Risk analysis will appear when a call is being processed"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Risk Meter */}
            <div className="flex justify-center">
              <RiskMeter value={data.overallScore} size="lg" />
            </div>

            {/* Waveform */}
            <div className="py-2">
              <Waveform 
                bars={28} 
                color={data.overallScore > 70 ? 'destructive' : data.overallScore > 40 ? 'warning' : 'primary'} 
              />
            </div>

            {/* Signal Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono tracking-wider text-muted-foreground mb-3">SIGNAL BREAKDOWN</h4>
              <SignalBar label="Cognitive Load" value={data.signals.cognitiveLoad} delay={0.1} />
              <SignalBar label="Behavioral Match" value={data.signals.behavioralMatch} delay={0.2} />
              <SignalBar label="Environment" value={data.signals.environmentalConsistency} delay={0.3} />
              <SignalBar label="Liveness" value={data.signals.livenessScore} delay={0.4} />
            </div>

            {/* Flags */}
            {data.flags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono tracking-wider text-muted-foreground">DETECTION FLAGS</h4>
                {data.flags.map((flag, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded text-xs font-mono',
                      flag.type === 'warning' ? 'bg-warning/10 text-warning' : 
                      flag.type === 'error' ? 'bg-destructive/10 text-destructive' :
                      'bg-primary/10 text-primary'
                    )}
                  >
                    {flag.type === 'warning' ? <AlertTriangle className="w-3 h-3" /> : 
                     flag.type === 'error' ? <AlertCircle className="w-3 h-3" /> :
                     <Info className="w-3 h-3" />}
                    {flag.message}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recommendation */}
            {rec && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className={cn(
                  'p-4 rounded-lg border-2 text-center',
                  rec.bg,
                  rec.border
                )}
              >
                <RecIcon className={cn('w-8 h-8 mx-auto mb-2', rec.color)} />
                <div className={cn('font-display text-xl tracking-wider', rec.color)}>
                  {rec.label}
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  RECOMMENDED ACTION
                </p>
              </motion.div>
            )}

            {/* Challenge */}
            {data.challenge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-4 rounded-lg border border-primary/30 bg-primary/5"
              >
                <p className="text-xs font-mono text-muted-foreground mb-2">🔒 SECURITY CHALLENGE</p>
                <p className="text-sm font-mono text-foreground italic">"{data.challenge}"</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
