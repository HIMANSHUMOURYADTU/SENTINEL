import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CallerProfile } from '@/components/dashboard/CallerProfile';
import { RiskPanel } from '@/components/dashboard/RiskPanel';
import { ActionControls } from '@/components/dashboard/ActionControls';
import { RecentCalls } from '@/components/dashboard/RecentCalls';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Headphones,
  Radio,
  PhoneOff,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { CallerData, RiskData, CallRecord } from '@/types/dashboard';
import { GlassCard, GlassCardContent } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentCaller, setCurrentCaller] = useState<CallerData | null>({
    id: 'CALLER-2024001',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    accountNumber: 'ACC-9876543210',
    lastVerified: '2024-02-01 14:30',
    callsThisMonth: 5,
    riskHistory: 'Low',
    intent: 'Account Inquiry',
    callDuration: '03:45',
    status: 'active',
  });
  
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([
    {
      id: 'CALL-001',
      caller: 'Sarah Johnson',
      risk: 15,
      status: 'completed',
      time: '14:23',
      date: '2024-02-01',
      agentId: 'AGENT-001',
    },
    {
      id: 'CALL-002',
      caller: 'Mike Davis',
      risk: 67,
      status: 'flagged',
      time: '13:45',
      date: '2024-02-01',
      agentId: 'AGENT-001',
    },
    {
      id: 'CALL-003',
      caller: 'Emma Wilson',
      risk: 42,
      status: 'escalated',
      time: '12:15',
      date: '2024-02-01',
      agentId: 'AGENT-001',
    },
    {
      id: 'CALL-004',
      caller: 'James Brown',
      risk: 8,
      status: 'completed',
      time: '11:30',
      date: '2024-02-01',
      agentId: 'AGENT-001',
    },
  ]);
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 🔐 Auth + role guard
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect admins to admin panel
    if (role === 'admin') {
      navigate('/admin');
    }
  }, [user, role, loading, navigate]);

  const handleCallClick = (callId: string) => {
    console.log('Call clicked:', callId);
  };

  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/$/, '');

  const handleFileSelect = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    console.log('File selected:', file.name);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const analyzeAudio = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setRiskData(null);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);

      const analyzeUrl = `${API_URL}/analyze`;
      console.log('Uploading to:', analyzeUrl);

      const resp = await fetch(analyzeUrl, {
        method: 'POST',
        body: fd,
        credentials: 'include'
      });

      if (resp.status === 401) {
        // not authenticated
        alert('Session expired. Please login again.');
        setIsLoading(false);
        return;
      }

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        const errorMsg = errorData.message || `HTTP ${resp.status}`;
        throw new Error(`Analysis failed: ${errorMsg}`);
      }

      const data = await resp.json();
      console.log('Backend response:', data);

      // Map backend response to RiskData
      const mapped: RiskData = {
        overallScore: data.analysis_results?.final_risk_score ?? 0,
        confidence: (data.analysis_results?.detection_confidence ?? 0) / 100,
        signals: {
          cognitiveLoad: data.risk_breakdown?.cognitive_intelligence?.score ?? 0,
          behavioralMatch: data.risk_breakdown?.behavioral_biometrics?.score ?? 0,
          environmentalConsistency: data.risk_breakdown?.environmental_forensics?.score ?? 0,
          livenessScore: data.risk_breakdown?.liveness_detection?.score ?? 0,
        },
        recommendation: (() => {
          const v = data.analysis_results?.verdict || data.analysis_results?.action || '';
          if (v === 'FAST_LANE') return 'FAST_LANE';
          if (v === 'COGNITIVE_TEST') return 'COGNITIVE_TEST';
          if (v === 'BLOCK_IMMEDIATE' || v === 'BLOCK') return 'BLOCK';
          return 'STEP_UP';
        })(),
        transcript: data.transcript || 'No transcript available',
        challenge: data.security_measures?.active_challenge || '',
        challengeType: data.security_measures?.challenge_type || '',
        flags: [
          ...(data.security_measures?.active_challenge ? [{ type: 'info' as const, message: `Challenge: ${data.security_measures.active_challenge}` }] : []),
          ...(data.risk_monitoring?.is_alert ? [{ type: 'warning' as const, message: `ALERT: ${data.risk_monitoring?.severity || 'HIGH'}` }] : []),
        ]
      };

      setRiskData(mapped);
      setIsCallActive(true);
      
      console.log('Mapped risk data:', mapped);
      
      // Add to recent calls
      const newCall: CallRecord = {
        id: `CALL-${Date.now()}`,
        caller: currentCaller?.name || 'Unknown',
        risk: Math.round(mapped.overallScore),
        status: mapped.overallScore > 70 ? 'flagged' : 'completed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        agentId: user?.uid || 'AGENT-001',
      };
      setRecentCalls([newCall, ...recentCalls.slice(0, 3)]);
    } catch (err) {
      console.error('Analyze error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert(`Analysis error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const agentStats = [
    { label: 'CALLS TODAY', value: String(recentCalls.length), icon: Headphones, color: 'text-primary' },
    { label: 'FLAGGED', value: String(recentCalls.filter(c => c.status === 'flagged' || c.status === 'escalated').length), icon: AlertTriangle, color: 'text-warning' },
    { label: 'VERIFIED', value: String(recentCalls.filter(c => c.status === 'completed').length), icon: CheckCircle, color: 'text-success' },
    { label: 'AVG DURATION', value: '02:15', icon: Clock, color: 'text-muted-foreground' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4">
          <div className="text-center font-mono text-muted-foreground">
            VERIFYING SESSION…
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider">
                AGENT DASHBOARD
              </h1>
              <p className="text-sm font-mono text-muted-foreground mt-1">
                LIVE CALL MONITORING & FRAUD DETECTION
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-success animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">
                  SYSTEM ONLINE
                </span>
              </div>
              {isCallActive ? (
                <StatusBadge status="info" label="CALL IN PROGRESS" pulse />
              ) : (
                <StatusBadge status="medium" label="AWAITING CALL" />
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {agentStats.map((stat) => (
              <GlassCard key={stat.label}>
                <GlassCardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <p className="font-display text-2xl tracking-wider">
                      {stat.value}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>

          {/* Main Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <CallerProfile caller={currentCaller} isLoading={isLoading} />
              <ActionControls disabled={!isCallActive} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <RiskPanel data={riskData} isLoading={isLoading} />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  {isCallActive ? (
                    <Headphones className="w-8 h-8 text-primary" />
                  ) : (
                    <PhoneOff className="w-8 h-8 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-display text-lg tracking-wider">
                      {isCallActive ? 'CALL ACTIVE' : 'NO ACTIVE CALL'}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {isCallActive
                        ? `${callDuration} ELAPSED`
                        : 'WAITING FOR CONNECTION'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Audio Card */}
              <GlassCard>
                <GlassCardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm">Upload Audio</p>
                      <p className="text-xs font-mono text-muted-foreground">Upload a call recording for analysis</p>
                    </div>
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex flex-col gap-3">
                    <input
                      ref={fileInputRef}
                      id="audio-file-input-dashboard"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files?.[0] ?? undefined)}
                    />
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleChooseFile}
                    >
                      Choose File
                    </Button>

                    <div className="text-xs font-mono text-muted-foreground text-center py-2 px-3 bg-muted rounded">
                      {selectedFile ? `📄 ${selectedFile.name}` : 'No file selected'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={analyzeAudio} 
                      disabled={!selectedFile || isLoading} 
                      className="flex-1"
                    >
                      {isLoading ? 'Analyzing...' : 'Analyze Audio'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }} 
                      disabled={isLoading}
                    >
                      Clear
                    </Button>
                  </div>
                </GlassCardContent>
              </GlassCard>

              <RecentCalls
                calls={recentCalls}
                isLoading={isLoading}
                onCallClick={handleCallClick}
              />
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;
