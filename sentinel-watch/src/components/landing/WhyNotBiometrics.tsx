import { motion } from 'framer-motion';
import { XCircle, CheckCircle } from 'lucide-react';
import { GlassCard, GlassCardContent } from '@/components/ui/GlassCard';

const biometricIssues = [
  'Requires enrollment & storage of biometric data',
  'Privacy regulations (GDPR, BIPA) create liability',
  'Easily defeated by modern voice cloning AI',
  'High false reject rates frustrate legitimate users',
  'Static template cannot adapt to voice changes',
];

const sentinelAdvantages = [
  'Zero enrollment — works on first call',
  'No biometric storage — privacy compliant by design',
  'Detects cloning through behavioral analysis',
  'Adaptive risk scoring reduces false positives',
  'Real-time challenge injection defeats replays',
];

export const WhyNotBiometrics = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl tracking-wider mb-4">
            WHY NOT <span className="text-risk-high">VOICE BIOMETRICS?</span>
          </h2>
          <p className="text-muted-foreground font-mono max-w-xl mx-auto">
            Traditional voice biometrics are outdated and vulnerable
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Biometrics Problems */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="h-full border-risk-high/30">
              <GlassCardContent className="p-6">
                <h3 className="font-display text-2xl tracking-wider text-risk-high mb-6 flex items-center gap-2">
                  <XCircle className="w-6 h-6" />
                  VOICE BIOMETRICS
                </h3>
                <ul className="space-y-4">
                  {biometricIssues.map((issue, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 text-sm font-mono text-muted-foreground"
                    >
                      <XCircle className="w-4 h-4 text-risk-high mt-0.5 shrink-0" />
                      {issue}
                    </motion.li>
                  ))}
                </ul>
              </GlassCardContent>
            </GlassCard>
          </motion.div>

          {/* VoiceSentinel Advantages */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="h-full border-primary/30 glow-primary">
              <GlassCardContent className="p-6">
                <h3 className="font-display text-2xl tracking-wider text-primary mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  VOICESENTINEL
                </h3>
                <ul className="space-y-4">
                  {sentinelAdvantages.map((advantage, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 text-sm font-mono text-muted-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {advantage}
                    </motion.li>
                  ))}
                </ul>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
