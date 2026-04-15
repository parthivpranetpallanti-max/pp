import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Activity, Shield, Zap, TrendingUp, 
  LayoutDashboard, Settings, Bell, User,
  ArrowUpRight, AlertTriangle, CheckCircle2,
  Lock, Server, Database, Truck, Plus, Trash2, ShieldCheck
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Mock Data ---
const demandData = [
  { name: 'Real Demand', value: 78, color: '#00FFFF' },
  { name: 'Fake Demand', value: 22, color: 'rgba(0, 255, 255, 0.1)' },
];

const riskData = [
  { name: 'Downtown', risk: 12 },
  { name: 'Westside', risk: 45 },
  { name: 'Industrial', risk: 85 },
  { name: 'Uptown', risk: 30 },
  { name: 'Suburbs', risk: 15 },
];

const substitutionData = [
  { label: 'Organic Milk', match: 94 },
  { label: 'Whole Wheat', match: 88 },
  { label: 'Avocado XL', match: 72 },
];

const substitutionEvents = [
  { from: 'Organic Whole Milk', to: 'Almond Milk', match: 94, time: '12:45' },
  { from: 'Whole Wheat Bread', to: 'Multigrain Sourdough', match: 88, time: '12:42' },
  { from: 'Hass Avocado XL', to: 'Organic Avocado', match: 72, time: '12:38' },
];

const trendData = [
  { time: '00:00', demand: 400, threats: 24 },
  { time: '04:00', demand: 300, threats: 18 },
  { time: '08:00', demand: 900, threats: 45 },
  { time: '12:00', demand: 1200, threats: 32 },
  { time: '16:00', demand: 1500, threats: 56 },
  { time: '20:00', demand: 1100, threats: 28 },
  { time: '23:59', demand: 600, threats: 12 },
];

const fleetUnits = [
  { id: 'UNIT-01', type: 'Drone', status: 'Active', health: 98, location: 'Zone A' },
  { id: 'UNIT-02', type: 'Rover', status: 'Charging', health: 85, location: 'Dock 4' },
  { id: 'UNIT-03', type: 'Drone', status: 'Maintenance', health: 42, location: 'Hangar' },
  { id: 'UNIT-04', type: 'Carrier', status: 'Active', health: 95, location: 'Zone C' },
  { id: 'UNIT-05', type: 'Drone', status: 'Active', health: 100, location: 'Zone B' },
];

// --- Components ---

const Card = ({ children, className, title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any, key?: React.Key }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={cn("glass-card p-6 flex flex-col gap-4", className)}
  >
    {title && (
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold tracking-wider text-[var(--text-secondary)] uppercase flex items-center gap-2">
          {Icon && <Icon size={16} className="text-[var(--accent-cyan)]" />}
          {title}
        </h3>
        <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_#00FFFF]" />
      </div>
    )}
    {children}
  </motion.div>
);

const GaugeChart = ({ value }: { value: number }) => {
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center h-48">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          stroke="rgba(0, 255, 255, 0.05)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Circle */}
        <motion.circle
          stroke={value < 40 ? "#FF0033" : "#00FFFF"}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl font-bold glow-text"
        >
          {value}%
        </motion.span>
        <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mt-1">Confidence</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, index }: { label: string, value: number, index: number, key?: React.Key }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="text-[var(--accent-cyan)] font-mono">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
        className="h-full cyan-gradient-bg shadow-[0_0_10px_#00FFFF]"
      />
    </div>
  </div>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'analytics' | 'fleet' | 'security'>('dashboard');
  const [isSimulating, setIsSimulating] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [logs, setLogs] = useState<{id: string, msg: string, type: 'info' | 'warn' | 'success'}[]>([]);
  const [firewallRules, setFirewallRules] = useState<any[]>([]);
  const [threats, setThreats] = useState<any[]>([]);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setStats(data.stats.map((s: any) => ({
        ...s,
        icon: s.label === 'Total Orders' ? Activity :
              s.label === 'Threats Blocked' ? Shield :
              s.label === 'Avg. Confidence' ? TrendingUp : Zap
      })));
      setLogs(data.logs);
      setFirewallRules(data.firewallRules);
      setThreats(data.threats);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const toggleFirewallRule = async (id: string) => {
    try {
      const res = await fetch('/api/firewall/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setFirewallRules(data.firewallRules);
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to toggle rule:", err);
    }
  };

  const addFirewallRule = async () => {
    if (!newRuleName.trim()) return;
    try {
      const res = await fetch('/api/firewall/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newRuleName })
      });
      const data = await res.json();
      if (data.success) {
        setFirewallRules(data.firewallRules);
        setLogs(data.logs);
        setNewRuleName('');
        setIsAddingRule(false);
      }
    } catch (err) {
      console.error("Failed to add rule:", err);
    }
  };

  const mitigateThreat = async (id: string) => {
    try {
      const res = await fetch('/api/threats/mitigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setThreats(data.threats);
        setLogs(data.logs);
        setStats(prev => prev.map(s => {
          const updated = data.stats.find((us: any) => us.label === s.label);
          return updated ? { ...s, value: updated.value } : s;
        }));
      }
    } catch (err) {
      console.error("Failed to mitigate threat:", err);
    }
  };

  const removeFirewallRule = async (id: string) => {
    try {
      const res = await fetch(`/api/firewall/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFirewallRules(data.firewallRules);
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to remove rule:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const runSimulation = async (type: 'normal' | 'threat' | 'oos') => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.success) {
        setStats(prev => prev.map(s => {
          const updated = data.stats.find((us: any) => us.label === s.label);
          return updated ? { ...s, value: updated.value } : s;
        }));
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to run simulation:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-6">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 border-t-2 border-r-2 border-[var(--accent-cyan)] rounded-full shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-[var(--accent-cyan)] font-mono tracking-[0.3em] uppercase text-sm animate-pulse"
        >
          Initializing ADIE Kernel
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[var(--accent-cyan)] selection:text-black">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent-cyan)] opacity-[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent-cyan)] opacity-[0.03] blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 cyan-gradient-bg rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.4)]">
            <Zap size={20} className="text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight">ADIE</span>
            <span className="text-[10px] text-[var(--text-secondary)] tracking-widest uppercase">Autonomous Intelligence</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={cn("transition-colors hover:text-white", activeView === 'dashboard' && "text-[var(--accent-cyan)] glow-text")}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveView('analytics')}
            className={cn("transition-colors hover:text-white", activeView === 'analytics' && "text-[var(--accent-cyan)] glow-text")}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveView('fleet')}
            className={cn("transition-colors hover:text-white", activeView === 'fleet' && "text-[var(--accent-cyan)] glow-text")}
          >
            Fleet
          </button>
          <button 
            onClick={() => setActiveView('security')}
            className={cn("transition-colors hover:text-white", activeView === 'security' && "text-[var(--accent-cyan)] glow-text")}
          >
            Security
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
            <Bell size={20} />
            {logs.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0A0A0A]" />}
          </button>
          <div className="h-8 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold">Admin Kernel</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Root Access</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 p-0.5">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden">
                <User size={20} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Header Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <stat.icon size={18} className="text-[var(--accent-cyan)]" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        stat.change.startsWith('+') ? "bg-green-500/10 text-green-400" : 
                        stat.change === 'Stable' ? "bg-cyan-500/10 text-cyan-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {stat.change}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-bold font-mono">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        {stat.label === 'Avg. Confidence' && '%'}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Simulation & Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Simulation Control" icon={Zap} className="lg:col-span-1">
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => runSimulation('normal')}
                      disabled={isSimulating}
                      className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSimulating ? <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={14} className="text-green-400" />}
                      Process Normal Order
                    </button>
                    <button 
                      onClick={() => runSimulation('threat')}
                      disabled={isSimulating}
                      className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSimulating ? <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <Shield size={14} className="text-red-400" />}
                      Simulate Threat
                    </button>
                    <button 
                      onClick={() => runSimulation('oos')}
                      disabled={isSimulating}
                      className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSimulating ? <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <AlertTriangle size={14} className="text-yellow-400" />}
                      OOS Substitution
                    </button>
                  </div>
                </Card>

                <Card title="Kernel Logs" icon={Activity} className="lg:col-span-2">
                  <div className="h-40 overflow-y-auto space-y-2 pr-2 font-mono text-[10px]">
                    <AnimatePresence initial={false}>
                      {logs.map((log) => (
                        <motion.div 
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "p-2 rounded border border-white/5",
                            log.type === 'info' ? "text-cyan-400 bg-cyan-400/5" :
                            log.type === 'warn' ? "text-red-400 bg-red-400/5" : "text-green-400 bg-green-400/5"
                          )}
                        >
                          <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                          {log.msg}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {logs.length === 0 && (
                      <div className="h-full flex items-center justify-center text-[var(--text-secondary)] italic">
                        Waiting for system events...
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pie Chart Card */}
                <Card title="Demand Integrity" icon={Shield} className="lg:col-span-1">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={demandData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {demandData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#121212', 
                            border: '1px solid rgba(0,255,255,0.2)',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-around mt-2">
                    {demandData.map((d, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-lg font-bold font-mono">{d.value}%</span>
                        <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Bar Chart Card */}
                <Card title="Regional Risk Analysis" icon={Activity} className="lg:col-span-2">
                  <div className="h-80 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskData}>
                        <defs>
                          <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00FFFF" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#00FFFF" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#A0A0A0', fontSize: 10 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#A0A0A0', fontSize: 10 }}
                        />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(0,255,255,0.05)' }}
                          contentStyle={{ 
                            backgroundColor: '#121212', 
                            border: '1px solid rgba(0,255,255,0.2)',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        />
                        <Bar 
                          dataKey="risk" 
                          fill="url(#cyanGradient)" 
                          radius={[6, 6, 0, 0]}
                          animationDuration={2000}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gauge Chart Card */}
                <Card title="Demand Confidence" icon={Zap}>
                  <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
                    <GaugeChart value={92} />
                    <div className="space-y-6 flex-1 max-w-xs">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle2 size={16} className="text-green-400" />
                          <span className="text-xs font-bold">Anomaly Detection Active</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                          AI models are currently processing 450+ signals per second with high precision.
                        </p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle size={16} className="text-yellow-400" />
                          <span className="text-xs font-bold">Sub-optimal Zone Detected</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                          Industrial-X showing increased latency in delivery fulfillment.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Substitution Intelligence Card */}
                <Card title="Substitution Intelligence" icon={TrendingUp}>
                  <div className="space-y-4 py-2">
                    {substitutionEvents.map((event, i) => (
                      <div key={i} className="group p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[var(--accent-cyan)]/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-widest font-mono">{event.time}</span>
                          <span className="text-[10px] font-bold text-[var(--accent-cyan)] font-mono">{event.match}% Match</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="text-[10px] text-red-400/70 uppercase tracking-tighter mb-0.5">Out of Stock</div>
                            <div className="text-xs font-medium truncate">{event.from}</div>
                          </div>
                          <div className="flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight size={14} className="text-[var(--accent-cyan)] rotate-45" />
                          </div>
                          <div className="flex-1 text-right">
                            <div className="text-[10px] text-green-400/70 uppercase tracking-tighter mb-0.5">Substituted</div>
                            <div className="text-xs font-medium truncate">{event.to}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                        <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Agent Active</span>
                      </div>
                      <span className="text-[10px] text-[var(--accent-cyan)] font-mono">84.7% Global Accuracy</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeView === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">System Analytics</h2>
                <p className="text-[var(--text-secondary)] text-sm">Deep neural insights into global demand patterns.</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <Card title="Demand vs Threats Trend" icon={TrendingUp}>
                  <div className="h-80 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="demandArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00FFFF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#A0A0A0', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0A0A0', fontSize: 10 }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(0,255,255,0.2)', borderRadius: '12px' }}
                        />
                        <Area type="monotone" dataKey="demand" stroke="#00FFFF" fillOpacity={1} fill="url(#demandArea)" />
                        <Line type="monotone" dataKey="threats" stroke="#FF0033" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeView === 'fleet' && (
            <motion.div 
              key="fleet"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Fleet Operations</h2>
                <p className="text-[var(--text-secondary)] text-sm">Real-time tracking of autonomous fulfillment units.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card title="Unit Status Matrix" icon={Truck}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">
                          <th className="pb-4 font-medium">Unit ID</th>
                          <th className="pb-4 font-medium">Type</th>
                          <th className="pb-4 font-medium">Location</th>
                          <th className="pb-4 font-medium">Health</th>
                          <th className="pb-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {fleetUnits.map((unit, i) => (
                          <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                            <td className="py-4 font-mono text-[var(--accent-cyan)]">{unit.id}</td>
                            <td className="py-4">{unit.type}</td>
                            <td className="py-4 text-[var(--text-secondary)]">{unit.location}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-400" style={{ width: `${unit.health}%` }} />
                                </div>
                                <span className="text-[10px] font-mono">{unit.health}%</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-bold",
                                unit.status === 'Active' ? "bg-green-500/10 text-green-400" :
                                unit.status === 'Charging' ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"
                              )}>
                                {unit.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeView === 'security' && (
            <motion.div 
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Security Protocol</h2>
                <p className="text-[var(--text-secondary)] text-sm">Active firewall and threat mitigation status.</p>
              </div>
 
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Active Threat Log" icon={Shield}>
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {threats.length > 0 ? (
                        threats.map((threat) => (
                          <motion.div 
                            key={threat.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2 rounded-lg",
                                threat.severity === 'Critical' ? "bg-red-500/20 text-red-400" :
                                threat.severity === 'High' ? "bg-orange-500/20 text-orange-400" : "bg-yellow-500/20 text-yellow-400"
                              )}>
                                <AlertTriangle size={18} />
                              </div>
                              <div>
                                <div className="text-sm font-bold">{threat.type}</div>
                                <div className="text-[10px] text-[var(--text-secondary)] font-mono">Source: {threat.source}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className={cn(
                                  "text-[10px] font-bold uppercase tracking-widest",
                                  threat.severity === 'Critical' ? "text-red-400" : "text-orange-400"
                                )}>{threat.severity}</div>
                                <div className="text-[10px] text-[var(--text-secondary)]">{threat.time}</div>
                              </div>
                              <button 
                                onClick={() => mitigateThreat(threat.id)}
                                className="opacity-0 group-hover:opacity-100 px-3 py-1 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20 hover:bg-green-500/20 transition-all"
                              >
                                Mitigate
                              </button>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-green-400">System Secure</div>
                            <div className="text-[10px] text-[var(--text-secondary)]">No active threats detected in the neural network.</div>
                          </div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
 
                <Card 
                  title="Firewall Configuration" 
                  icon={Lock}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Active Protocols</span>
                      <button 
                        onClick={() => setIsAddingRule(true)}
                        className="p-1.5 rounded-lg bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/20 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {isAddingRule && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 bg-[var(--accent-cyan)]/5 rounded-xl border border-[var(--accent-cyan)]/20 flex flex-col gap-3"
                        >
                          <input 
                            autoFocus
                            type="text"
                            placeholder="Protocol Name..."
                            value={newRuleName}
                            onChange={(e) => setNewRuleName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addFirewallRule()}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[var(--accent-cyan)]/50 outline-none transition-all"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={addFirewallRule}
                              className="flex-1 py-2 bg-[var(--accent-cyan)] text-black text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-cyan-300 transition-colors"
                            >
                              Deploy Protocol
                            </button>
                            <button 
                              onClick={() => { setIsAddingRule(false); setNewRuleName(''); }}
                              className="px-4 py-2 bg-white/5 text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-white/10 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <AnimatePresence mode="popLayout">
                        {firewallRules.map((rule) => (
                          <motion.div 
                            layout
                            key={rule.id} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[var(--accent-cyan)]/20 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                rule.active ? "bg-cyan-500/10 text-cyan-400" : "bg-white/5 text-[var(--text-secondary)]"
                              )}>
                                <ShieldCheck size={18} />
                              </div>
                              <div>
                                <div className="text-xs font-bold">{rule.label}</div>
                                <div className="text-[10px] text-[var(--text-secondary)]">{rule.status}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => removeFirewallRule(rule.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                              <button 
                                onClick={() => toggleFirewallRule(rule.id)}
                                className={cn(
                                  "w-10 h-5 rounded-full relative transition-colors duration-300",
                                  rule.active ? "bg-cyan-400/20" : "bg-white/10"
                                )}
                              >
                                <motion.div 
                                  animate={{ x: rule.active ? 20 : 4 }}
                                  className={cn(
                                    "w-3 h-3 rounded-full absolute top-1 transition-colors",
                                    rule.active ? "bg-cyan-400 shadow-[0_0_8px_#00FFFF]" : "bg-gray-500"
                                  )}
                                />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-white/5 text-center">
        <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.4em]">
          ADIE Neural Dashboard &copy; 2026
        </div>
      </footer>
    </div>
  );
}
