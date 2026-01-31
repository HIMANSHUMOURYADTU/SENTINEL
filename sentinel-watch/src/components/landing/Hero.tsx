import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Activity } from 'lucide-react';
import { Waveform } from '@/components/ui/Waveform';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />

      {/* Scan Line Effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8"
        >
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-primary tracking-wider">REAL-TIME FRAUD DETECTION</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider mb-6"
        >
          <span className="text-foreground">RISK-BASED</span>
          <br />
          <span className="text-gradient-primary">VOICE LIVENESS</span>
          <br />
          <span className="text-foreground">& FRAUD DETECTION</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground font-mono max-w-2xl mx-auto mb-8"
        >
          Detect synthetic voices, cloning attacks, and social engineering in real-time. 
          Protect your call center with enterprise-grade voice security.
        </motion.p>

        {/* Waveform Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-10"
        >
          <Waveform bars={32} className="h-20" />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/dashboard">
            <Button size="lg" className="font-mono text-sm tracking-wider gap-2 glow-primary">
              <Shield className="w-4 h-4" />
              VIEW LIVE DASHBOARD
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="font-mono text-sm tracking-wider">
              AGENT LOGIN
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
        >
          {[
            { value: '<50ms', label: 'LATENCY' },
            { value: '99.7%', label: 'ACCURACY' },
            { value: '24/7', label: 'MONITORING' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-3xl sm:text-4xl text-primary">{stat.value}</div>
              <div className="text-xs font-mono text-muted-foreground tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
