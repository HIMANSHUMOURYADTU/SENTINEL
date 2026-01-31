import { motion } from 'framer-motion';
import { Brain, Fingerprint, Radio, Mic, ShieldAlert, Bot, RotateCcw, Users } from 'lucide-react';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/GlassCard';

const modules = [
  {
    icon: Brain,
    title: 'COGNITIVE LOAD',
    description: 'Measures response latency, hesitation patterns, and mental processing under verification challenges.',
    metrics: ['Response Time', 'Pause Patterns', 'Stress Indicators'],
  },
  {
    icon: Fingerprint,
    title: 'BEHAVIORAL FINGERPRINT',
    description: 'Creates dynamic voice profile based on speech patterns, vocabulary, and conversational style.',
    metrics: ['Speech Cadence', 'Vocabulary Match', 'Emotional Tone'],
  },
  {
    icon: Radio,
    title: 'ENVIRONMENTAL CHECK',
    description: 'Analyzes background audio for anomalies, synthetic artifacts, and location consistency.',
    metrics: ['Noise Profile', 'Echo Detection', 'Compression Artifacts'],
  },
  {
    icon: Mic,
    title: 'LIVENESS TEST',
    description: 'Injects dynamic challenges to verify human presence and real-time voice production.',
    metrics: ['Challenge Response', 'Replay Detection', 'TTS Markers'],
  },
];

const threatTypes = [
  { icon: Bot, label: 'Synthetic Voice', color: 'text-risk-critical' },
  { icon: Users, label: 'Voice Cloning', color: 'text-risk-high' },
  { icon: RotateCcw, label: 'Replay Attacks', color: 'text-risk-medium' },
  { icon: ShieldAlert, label: 'Social Engineering', color: 'text-warning' },
];

export const CoreModules = () => {
  return (
    <section className="py-24 relative bg-muted/30">
      <div className="absolute inset-0 bg-grid-subtle opacity-20" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl tracking-wider mb-4">
            DETECTION <span className="text-primary">MODULES</span>
          </h2>
          <p className="text-muted-foreground font-mono max-w-xl mx-auto">
            Four specialized analysis engines working in parallel
          </p>
        </motion.div>

        {/* Threat Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {threatTypes.map((threat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card/50 ${threat.color}`}
            >
              <threat.icon className="w-4 h-4" />
              <span className="text-xs font-mono tracking-wider">{threat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlassCard variant="elevated" className="h-full hover:border-primary/30 transition-colors">
                <GlassCardHeader className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10 text-primary">
                    <module.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl tracking-wider">{module.title}</h3>
                </GlassCardHeader>
                <GlassCardContent>
                  <p className="text-sm font-mono text-muted-foreground mb-4">{module.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {module.metrics.map((metric, j) => (
                      <span
                        key={j}
                        className="px-2 py-1 text-xs font-mono bg-muted rounded text-muted-foreground"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
