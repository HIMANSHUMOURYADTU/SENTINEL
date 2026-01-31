import { motion } from 'framer-motion';
import { Phone, Activity, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { GlassCard, GlassCardContent } from '@/components/ui/GlassCard';

const steps = [
  {
    icon: Phone,
    title: 'INCOMING CALL',
    description: 'Voice stream captured in real-time',
    color: 'text-primary',
  },
  {
    icon: Activity,
    title: 'MULTI-SIGNAL ANALYSIS',
    description: 'Cognitive, behavioral, environmental checks',
    color: 'text-warning',
  },
  {
    icon: AlertTriangle,
    title: 'RISK SCORING',
    description: 'ML-powered fraud probability (0-100)',
    color: 'text-risk-high',
  },
  {
    icon: CheckCircle,
    title: 'RECOMMENDED ACTION',
    description: 'Fast lane, challenge, or step-up verification',
    color: 'text-success',
  },
];

export const FlowDiagram = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-grid-subtle opacity-30" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl tracking-wider mb-4">
            HOW IT <span className="text-primary">WORKS</span>
          </h2>
          <p className="text-muted-foreground font-mono max-w-xl mx-auto">
            From call initiation to fraud decision in under 50ms
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Connection Lines (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 z-0">
            <motion.div
              className="h-0.5 bg-gradient-to-r from-primary via-warning to-success"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <GlassCard className="relative h-full">
                <GlassCardContent className="text-center py-8">
                  {/* Step Number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-mono text-primary">
                    {i + 1}
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-lg bg-muted mb-4 ${step.color}`}>
                    <step.icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-lg tracking-wider mb-2">{step.title}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{step.description}</p>
                </GlassCardContent>

                {/* Arrow (Mobile) */}
                {i < steps.length - 1 && (
                  <div className="md:hidden flex justify-center py-2 text-muted-foreground">
                    <ArrowRight className="w-5 h-5 rotate-90" />
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
