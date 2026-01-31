// Types for live data integration

export interface CallerData {
  id: string;
  name: string;
  phone: string;
  accountNumber: string;
  lastVerified: string;
  callsThisMonth: number;
  riskHistory: 'Low' | 'Medium' | 'High' | 'Critical';
  intent: string;
  callDuration: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface RiskFlag {
  type: 'warning' | 'info' | 'error';
  message: string;
}

export interface RiskSignals {
  cognitiveLoad: number;
  behavioralMatch: number;
  environmentalConsistency: number;
  livenessScore: number;
}

export type RecommendationType = 'FAST_LANE' | 'COGNITIVE_TEST' | 'STEP_UP' | 'BLOCK';

export interface RiskData {
  overallScore: number;
  confidence: number;
  signals: RiskSignals;
  recommendation: RecommendationType;
  flags: RiskFlag[];
  transcript?: string;
  challenge?: string;
  challengeType?: string;
}

export interface CallRecord {
  id: string;
  caller: string;
  risk: number;
  status: 'completed' | 'flagged' | 'escalated' | 'in_progress';
  time: string;
  date?: string;
  agentId?: string;
}

export interface SystemMetrics {
  callsToday: number;
  avgRiskScore: number;
  fraudCaught: number;
  falsePositives: number;
  systemLatency: number;
  asrLatency: number;
  mlInferenceTime: number;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  gpu: number;
}

export interface RiskDistribution {
  range: string;
  count: number;
}

export interface AdminThresholds {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
}

export interface AdminWeights {
  cognitive: number;
  behavioral: number;
  environmental: number;
  liveness: number;
}

export interface AdminSettings {
  autoEscalate: boolean;
  challengeInjection: boolean;
  replayDetection: boolean;
  ttsDetection: boolean;
}

export interface AdminConfig {
  thresholds: AdminThresholds;
  weights: AdminWeights;
  settings: AdminSettings;
}

export interface AuditLogEntry {
  id: string;
  callId: string;
  agentId: string;
  risk: number;
  action: string;
  override: boolean;
  justification?: string;
  time: string;
}
