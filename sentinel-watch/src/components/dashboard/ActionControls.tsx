import { motion } from 'framer-motion';
import { Send, FileText, RefreshCw, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { useToast } from '@/hooks/use-toast';

interface ActionControlsProps {
  disabled?: boolean;
  onSendOtp?: () => void;
  onRequestDocument?: () => void;
  onOverride?: () => void;
  onInjectChallenge?: () => void;
}

const actions = [
  { id: 'otp', icon: Send, label: 'SEND OTP', description: 'SMS verification code', variant: 'default' as const },
  { id: 'document', icon: FileText, label: 'REQUEST DOCUMENT', description: 'ID verification', variant: 'secondary' as const },
  { id: 'override', icon: RefreshCw, label: 'OVERRIDE', description: 'Manual approval', variant: 'outline' as const },
  { id: 'challenge', icon: Mic, label: 'INJECT CHALLENGE', description: 'Voice liveness test', variant: 'destructive' as const },
];

export const ActionControls = ({ 
  disabled = false,
  onSendOtp,
  onRequestDocument,
  onOverride,
  onInjectChallenge
}: ActionControlsProps) => {
  const { toast } = useToast();

  const handleAction = (actionId: string, label: string) => {
    if (disabled) {
      toast({
        title: 'NO ACTIVE CALL',
        description: 'Wait for a call connection before taking action.',
        variant: 'destructive',
      });
      return;
    }

    // Call the appropriate handler
    switch (actionId) {
      case 'otp':
        onSendOtp?.();
        break;
      case 'document':
        onRequestDocument?.();
        break;
      case 'override':
        onOverride?.();
        break;
      case 'challenge':
        onInjectChallenge?.();
        break;
    }

    toast({
      title: `${label} INITIATED`,
      description: 'Action has been triggered successfully.',
    });
  };

  return (
    <GlassCard variant="elevated" className="h-full">
      <GlassCardHeader>
        <span className="font-mono text-xs tracking-wider text-muted-foreground">AGENT CONTROLS</span>
      </GlassCardHeader>
      <GlassCardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-3"
        >
          {actions.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Button
                variant={action.variant}
                disabled={disabled}
                className="w-full h-auto flex flex-col items-center gap-2 py-4 font-mono disabled:opacity-50"
                onClick={() => handleAction(action.id, action.label)}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-xs tracking-wider">{action.label}</span>
                <span className="text-[10px] opacity-70">{action.description}</span>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </GlassCardContent>
    </GlassCard>
  );
};
