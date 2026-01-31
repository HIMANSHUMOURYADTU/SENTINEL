import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/landing/Hero';
import { FlowDiagram } from '@/components/landing/FlowDiagram';
import { CoreModules } from '@/components/landing/CoreModules';
import { WhyNotBiometrics } from '@/components/landing/WhyNotBiometrics';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FlowDiagram />
      <CoreModules />
      <WhyNotBiometrics />
      
      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto text-center px-4"
        >
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="font-display text-4xl sm:text-5xl tracking-wider mb-4">
            READY TO <span className="text-primary">SECURE</span> YOUR CALLS?
          </h2>
          <p className="text-muted-foreground font-mono mb-8">
            Deploy enterprise-grade voice fraud detection in minutes
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="font-mono text-sm tracking-wider gap-2 glow-primary">
              VIEW LIVE DASHBOARD
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-display text-sm tracking-wider">VOICESENTINEL</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              © 2024 VoiceSentinel. Enterprise Voice Security.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
