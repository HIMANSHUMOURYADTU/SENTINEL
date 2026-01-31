import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/GlassCard';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  AdminThresholds,
  AdminWeights,
  AdminSettings,
} from '@/types/dashboard';
import {
  Settings,
  Sliders,
  AlertTriangle,
  Mic,
  Volume2,
  Save,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/auth/useAuth';

// Default values (fallback)
const defaultThresholds: AdminThresholds = {
  lowRisk: 25,
  mediumRisk: 50,
  highRisk: 75,
};

const defaultWeights: AdminWeights = {
  cognitive: 25,
  behavioral: 30,
  environmental: 20,
  liveness: 25,
};

const defaultSettings: AdminSettings = {
  autoEscalate: true,
  challengeInjection: true,
  replayDetection: true,
  ttsDetection: true,
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [thresholds, setThresholds] = useState(defaultThresholds);
  const [weights, setWeights] = useState(defaultWeights);
  const [settings, setSettings] = useState(defaultSettings);

  // 🔐 Auth + role protection
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [user, role, loading, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with backend API
      // await fetch('/api/admin/config', { method: 'POST', body: JSON.stringify(...) })

      toast({
        title: 'CONFIGURATION SAVED',
        description: 'System settings have been updated successfully.',
      });
    } catch {
      toast({
        title: 'SAVE FAILED',
        description: 'Failed to save configuration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4">
          <LoadingState message="VERIFYING ACCESS..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="font-display text-3xl tracking-wider">ADMIN PANEL</h1>
              <p className="text-sm font-mono text-muted-foreground mt-1">
                SYSTEM CONFIGURATION
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="font-mono text-xs gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
            </Button>
          </motion.div>

          <div className="space-y-6">
            {/* Thresholds */}
            <GlassCard variant="elevated">
              <GlassCardHeader className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="font-mono text-xs tracking-wider text-muted-foreground">
                  RISK THRESHOLDS
                </span>
              </GlassCardHeader>
              <GlassCardContent className="space-y-6">
                {Object.entries(thresholds).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <Label className="text-xs font-mono uppercase">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </Label>
                      <span className="font-mono text-sm text-primary">{value}</span>
                    </div>
                    <Slider
                      value={[value]}
                      max={100}
                      step={1}
                      onValueChange={([v]) =>
                        setThresholds({ ...thresholds, [key]: v })
                      }
                    />
                  </div>
                ))}
              </GlassCardContent>
            </GlassCard>

            {/* Weights */}
            <GlassCard variant="elevated">
              <GlassCardHeader className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs tracking-wider text-muted-foreground">
                  SIGNAL WEIGHTS
                </span>
              </GlassCardHeader>
              <GlassCardContent className="space-y-6">
                {Object.entries(weights).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <Label className="text-xs font-mono uppercase">
                        {key} LOAD
                      </Label>
                      <span className="font-mono text-sm text-primary">
                        {value}%
                      </span>
                    </div>
                    <Slider
                      value={[value]}
                      max={100}
                      step={1}
                      onValueChange={([v]) =>
                        setWeights({ ...weights, [key]: v })
                      }
                    />
                  </div>
                ))}
              </GlassCardContent>
            </GlassCard>

            {/* Toggles */}
            <GlassCard variant="elevated">
              <GlassCardHeader className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs tracking-wider text-muted-foreground">
                  DETECTION FEATURES
                </span>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                {Object.entries(settings).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <Label className="font-mono text-sm uppercase">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </Label>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, [key]: checked })
                      }
                    />
                  </div>
                ))}
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
