import { 
  Order, 
  DemandAnalysis, 
  ZoneIntelligence, 
  Substitution, 
  AgentLog, 
  OrchestrationResult 
} from '@/types/adie';
import { analyzeDemand, analyzeZone, suggestSubstitution } from './gemini';

export class ADIEAgents {
  private logs: AgentLog[] = [];

  private addLog(agent: string, message: string, type: AgentLog['type'] = 'info') {
    const log: AgentLog = {
      id: Math.random().toString(36).substr(2, 9),
      agent,
      message,
      timestamp: new Date().toLocaleTimeString(),
      type
    };
    this.logs.push(log);
    console.log(`[${agent}] ${message}`);
    return log;
  }

  public getLogs() {
    return [...this.logs].reverse();
  }

  // 1. Demand Analyzer Agent
  async runDemandAnalyzer(order: Order, history: Order[]): Promise<DemandAnalysis> {
    this.addLog('Demand Analyzer', `Analyzing demand for order ${order.id}...`);
    try {
      const result = await analyzeDemand(order, history);
      this.addLog('Demand Analyzer', `Confidence: ${result.confidenceScore}%, Status: ${result.status}`, result.status === 'Real' ? 'success' : 'warning');
      
      // Simulate n8n trigger for fake demand
      if (result.status === 'Fake' || result.status === 'Suspicious') {
        this.triggerN8N('fake_demand_detected', { order, analysis: result });
      }
      
      return result;
    } catch (error) {
      this.addLog('Demand Analyzer', 'Analysis failed', 'error');
      throw error;
    }
  }

  // 2. Zone Intelligence Agent
  async runZoneIntelligence(zone: string): Promise<ZoneIntelligence> {
    this.addLog('Zone Intelligence', `Checking health for zone: ${zone}...`);
    // Mock zone metrics
    const zoneData = {
      name: zone,
      deliveryTime: Math.floor(Math.random() * 60),
      driverAvailability: Math.floor(Math.random() * 10),
      disruptionFlag: Math.random() > 0.8
    };

    try {
      const result = await analyzeZone(zoneData);
      this.addLog('Zone Intelligence', `Status: ${result.status}. ${result.suggestion}`, result.status === 'Healthy' ? 'success' : 'warning');
      
      if (result.status === 'Blackhole') {
        this.triggerN8N('blackhole_zone_detected', { zone, metrics: zoneData });
      }
      
      return { ...result, metrics: zoneData };
    } catch (error) {
      this.addLog('Zone Intelligence', 'Zone check failed', 'error');
      throw error;
    }
  }

  // 3. Substitution Agent
  async runSubstitutionAgent(product: string): Promise<Substitution> {
    this.addLog('Substitution Agent', `Finding replacement for OOS item: ${product}...`);
    const preferences = { budget: 'mid', brand: 'premium', health: 'high' };
    
    try {
      const result = await suggestSubstitution(product, preferences);
      this.addLog('Substitution Agent', `Suggested: ${result.suggestedProduct} (Score: ${result.matchScore})`, 'info');
      return result;
    } catch (error) {
      this.addLog('Substitution Agent', 'Substitution failed', 'error');
      throw error;
    }
  }

  // 4. Orchestrator Agent
  async orchestrate(order: Order, history: Order[]): Promise<OrchestrationResult> {
    this.addLog('Orchestrator', `Starting workflow for Order ${order.id}...`);
    
    // Step 1: Demand Analysis
    const demand = await this.runDemandAnalyzer(order, history);
    if (demand.status === 'Fake') {
      this.addLog('Orchestrator', 'Order REJECTED due to fake demand.', 'error');
      return {
        orderId: order.id,
        decision: 'Reject',
        finalAction: 'Order cancelled automatically.',
        steps: { demand, zone: { status: 'Healthy', suggestion: 'N/A', metrics: { deliveryTime: 0, driverAvailability: 0, disruptionFlag: false } } }
      };
    }

    // Step 2: Zone Check
    const zone = await this.runZoneIntelligence(order.zone);
    
    // Step 3: Substitution (if OOS)
    let substitution: Substitution | undefined;
    if (order.isOOS) {
      substitution = await this.runSubstitutionAgent(order.product);
    }

    // Final Decision
    let decision: OrchestrationResult['decision'] = 'Accept';
    let finalAction = 'Order accepted and sent to kitchen.';

    if (zone.status === 'Blackhole') {
      decision = 'Reroute';
      finalAction = 'Order rerouted to secondary hub.';
    } else if (order.isOOS && substitution) {
      decision = 'Substitute';
      finalAction = `Substituted ${order.product} with ${substitution.suggestedProduct}.`;
    }

    this.addLog('Orchestrator', `Final Decision: ${decision}. ${finalAction}`, 'success');

    return {
      orderId: order.id,
      decision,
      finalAction,
      steps: { demand, zone, substitution }
    };
  }

  // n8n Simulation
  private triggerN8N(event: string, payload: any) {
    this.addLog('n8n Automation', `Triggering workflow: ${event}`, 'info');
    // In a real app, this would be a fetch call to an n8n webhook
    // Example: fetch('https://n8n.your-domain.com/webhook/adie-alert', { method: 'POST', body: JSON.stringify({ event, ...payload }) });
    console.log(`[n8n Webhook Simulation] Event: ${event}`, payload);
  }
}
