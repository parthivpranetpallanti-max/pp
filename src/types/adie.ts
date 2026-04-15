
export type DemandStatus = 'Real' | 'Suspicious' | 'Fake';
export type ZoneStatus = 'Healthy' | 'Risky' | 'Blackhole';

export interface Order {
  id: string;
  product: string;
  quantity: number;
  customer: string;
  zone: string;
  timestamp: string;
  isOOS?: boolean;
}

export interface DemandAnalysis {
  confidenceScore: number;
  status: DemandStatus;
  reason: string;
}

export interface ZoneIntelligence {
  status: ZoneStatus;
  suggestion: string;
  metrics: {
    deliveryTime: number;
    driverAvailability: number;
    disruptionFlag: boolean;
  };
}

export interface Substitution {
  originalProduct: string;
  suggestedProduct: string;
  reason: string;
  matchScore: number;
}

export interface AgentLog {
  id: string;
  agent: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface OrchestrationResult {
  orderId: string;
  decision: 'Accept' | 'Reject' | 'Reroute' | 'Substitute';
  finalAction: string;
  steps: {
    demand: DemandAnalysis;
    zone: ZoneIntelligence;
    substitution?: Substitution;
  };
}
