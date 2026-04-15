import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- In-Memory Data Store (Simulating a DB) ---
let stats = [
  { label: 'Total Orders', value: 12482, change: '+12.5%' },
  { label: 'Threats Blocked', value: 1204, change: '+5.2%' },
  { label: 'Avg. Confidence', value: 94.2, change: '+0.8%' },
  { label: 'System Uptime', value: '99.99%', change: 'Stable' },
];

let logs: any[] = [];
let firewallRules = [
  { id: '1', label: 'Neural Encryption', status: '2048-bit AES', active: true },
  { id: '2', label: 'Intrusion Detection', status: 'Active', active: true },
  { id: '3', label: 'Geo-Fencing', status: 'Global', active: true },
  { id: '4', label: 'Auto-Mitigation', status: 'Enabled', active: true },
];

let threats = [
  { id: 'T-102', source: '192.168.1.45', type: 'DDoS Attempt', severity: 'High', time: '2 mins ago' },
  { id: 'T-103', source: '84.22.11.9', type: 'SQL Injection', severity: 'Critical', time: '15 mins ago' },
  { id: 'T-104', source: 'Internal', type: 'Auth Bypass', severity: 'Medium', time: '1 hour ago' },
];

const addLog = (msg: string, type: 'info' | 'warn' | 'success') => {
  logs = [{ id: Math.random().toString(36).substring(7), msg, type }, ...logs].slice(0, 50);
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", system: "PDS" });
  });

  app.get("/api/data", (req, res) => {
    res.json({ stats, logs: logs.slice(0, 5), firewallRules, threats });
  });

  app.post("/api/simulate", (req, res) => {
    const { type } = req.body;
    const id = Math.random().toString(36).substring(7);
    addLog(`Initializing ${type.toUpperCase()} simulation...`, 'info');

    if (type === 'threat') {
      stats = stats.map(s => s.label === 'Threats Blocked' ? { ...s, value: (s.value as number) + 1 } : s);
      addLog('SPOOFED DEMAND DETECTED: Blocked in Industrial-X', 'warn');
    } else if (type === 'normal') {
      stats = stats.map(s => s.label === 'Total Orders' ? { ...s, value: (s.value as number) + 1 } : s);
      addLog('Order #ORD-8829 processed successfully', 'success');
    } else {
      addLog('Substitution Agent: Organic Milk → Almond Milk (OOS)', 'info');
    }

    res.json({ success: true, stats, logs: logs.slice(0, 5) });
  });

  app.post("/api/firewall/toggle", (req, res) => {
    const { id } = req.body;
    firewallRules = firewallRules.map(rule => 
      rule.id === id ? { ...rule, active: !rule.active } : rule
    );
    const rule = firewallRules.find(r => r.id === id);
    if (rule) {
      addLog(`Firewall Rule "${rule.label}" ${rule.active ? 'ENABLED' : 'DISABLED'}`, rule.active ? 'success' : 'warn');
    }
    res.json({ success: true, firewallRules, logs: logs.slice(0, 5) });
  });

  app.post("/api/firewall/add", (req, res) => {
    const { label } = req.body;
    const newRule = {
      id: Math.random().toString(36).substring(7),
      label: label || `Protocol-${Math.floor(Math.random() * 1000)}`,
      status: 'Custom Policy',
      active: true
    };
    firewallRules = [...firewallRules, newRule];
    addLog(`New Firewall Protocol "${newRule.label}" deployed`, 'info');
    res.json({ success: true, firewallRules, logs: logs.slice(0, 5) });
  });

  app.delete("/api/firewall/:id", (req, res) => {
    const { id } = req.params;
    const rule = firewallRules.find(r => r.id === id);
    firewallRules = firewallRules.filter(r => r.id !== id);
    if (rule) {
      addLog(`Firewall Protocol "${rule.label}" decommissioned`, 'warn');
    }
    res.json({ success: true, firewallRules, logs: logs.slice(0, 5) });
  });

  app.post("/api/threats/mitigate", (req, res) => {
    const { id } = req.body;
    const threat = threats.find(t => t.id === id);
    threats = threats.filter(t => t.id !== id);
    stats = stats.map(s => s.label === 'Threats Blocked' ? { ...s, value: (s.value as number) + 1 } : s);
    if (threat) {
      addLog(`THREAT MITIGATED: ${threat.type} from ${threat.source} neutralized`, 'success');
    }
    res.json({ success: true, threats, stats, logs: logs.slice(0, 5) });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PDS Server running on http://localhost:${PORT}`);
  });
}

startServer();
