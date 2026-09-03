import React from 'react';
import { BatchMetrics, RecoveryVector, RevenueRecord } from '../types/recovery';
import { TrendingUp, IndianRupee, ShieldCheck, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Cpu } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';

interface OverviewDashboardProps {
  metrics: BatchMetrics;
  records: RevenueRecord[];
  activeVector: RecoveryVector | 'ALL';
  onSelectVector: (v: RecoveryVector | 'ALL') => void;
  onOpenAudit: (rec: RevenueRecord) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  metrics,
  records,
  activeVector,
  onSelectVector,
  onOpenAudit
}) => {
  // Chart Data preparation
  const vectorChartData = [
    {
      name: 'Payment Failure',
      atRisk: metrics.vectorBreakdown.PAYMENT_DEGRADATION.atRisk,
      recovered: metrics.vectorBreakdown.PAYMENT_DEGRADATION.recovered
    },
    {
      name: 'Checkout Dropoff',
      atRisk: metrics.vectorBreakdown.CHECKOUT_ABANDONMENT.atRisk,
      recovered: metrics.vectorBreakdown.CHECKOUT_ABANDONMENT.recovered
    },
    {
      name: 'Failed Mandates',
      atRisk: metrics.vectorBreakdown.FAILED_SUBSCRIPTION.atRisk,
      recovered: metrics.vectorBreakdown.FAILED_SUBSCRIPTION.recovered
    },
    {
      name: 'B2B Receivables',
      atRisk: metrics.vectorBreakdown.B2B_RECEIVABLES.atRisk,
      recovered: metrics.vectorBreakdown.B2B_RECEIVABLES.recovered
    }
  ];

  const trendData = [
    { time: '09:00 AM', recovered: 12000, atRisk: 45000 },
    { time: '11:00 AM', recovered: 34000, atRisk: 82000 },
    { time: '01:00 PM', recovered: 78000, atRisk: 140000 },
    { time: '03:00 PM', recovered: 135000, atRisk: 210000 },
    { time: '05:00 PM', recovered: metrics.totalMoneyRecovered, atRisk: metrics.totalRevenueAtRisk }
  ];

  // Recent Agent Actions
  const recentRecovered = records
    .filter(r => r.status === 'RECOVERED' || r.status === 'PTP_REGISTERED' || r.interventionsCount > 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Benchmark KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Measured Money Recovered */}
        <div className="bg-rzp-card border border-rzp-blue/30 p-5 rounded-2xl relative overflow-hidden group hover:border-rzp-blue/60 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rzp-blue/10 rounded-full blur-2xl group-hover:bg-rzp-blue/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-rzp-textMuted uppercase tracking-wider">Measured Money Recovered</span>
            <div className="p-2 rounded-xl bg-rzp-blue/15 text-rzp-blue border border-rzp-blue/30">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            ₹{metrics.totalMoneyRecovered.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-rzp-emerald font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metrics.recoveryRatePercent}% Overall Recovery Rate</span>
          </div>
        </div>

        {/* Total Revenue At Risk */}
        <div className="bg-rzp-card border border-rzp-border p-5 rounded-2xl relative overflow-hidden hover:border-rzp-borderLight transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-rzp-textMuted uppercase tracking-wider">Total Revenue At Risk</span>
            <div className="p-2 rounded-xl bg-rzp-rose/15 text-rzp-rose border border-rzp-rose/30">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-100 tracking-tight">
            ₹{metrics.totalRevenueAtRisk.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-rzp-textMuted">
            Across {metrics.totalRecordsProcessed} detected failure events
          </div>
        </div>

        {/* Active Promise-to-Pay & Nudges */}
        <div className="bg-rzp-card border border-rzp-border p-5 rounded-2xl relative overflow-hidden hover:border-rzp-borderLight transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-rzp-textMuted uppercase tracking-wider">Active PTP & Nudges</span>
            <div className="p-2 rounded-xl bg-rzp-gold/15 text-rzp-gold border border-rzp-gold/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.activePtpCount} <span className="text-sm font-normal text-rzp-textMuted">PTPs</span>
          </div>
          <div className="mt-2 text-xs text-rzp-gold font-medium">
            {metrics.totalInterventionsSent} automated AI nudges sent
          </div>
        </div>

        {/* Compliance Guardrails & ROI */}
        <div className="bg-rzp-card border border-rzp-border p-5 rounded-2xl relative overflow-hidden hover:border-rzp-borderLight transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-rzp-textMuted uppercase tracking-wider">ROI & Guardrails</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rzp-emerald tracking-tight">
            {metrics.roiMultiplier}x <span className="text-sm font-normal text-slate-300">ROI</span>
          </div>
          <div className="mt-2 text-xs text-rzp-emerald font-medium">
            100% RBI & DPDPA compliant ({metrics.complianceHalts} auto-halts)
          </div>
        </div>

      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Money Recovered by Vector Bar Chart */}
        <div className="lg:col-span-2 bg-rzp-card border border-rzp-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Revenue Recovered by Leakage Vector</h3>
              <p className="text-xs text-rzp-textMuted">Before (At Risk) vs. After AI Recovery (₹ INR)</p>
            </div>
            
            {/* Vector filter pills */}
            <div className="flex items-center space-x-1.5 bg-[#0B0F19] p-1 rounded-xl border border-rzp-border text-xs">
              {(['ALL', 'PAYMENT_DEGRADATION', 'CHECKOUT_ABANDONMENT', 'FAILED_SUBSCRIPTION', 'B2B_RECEIVABLES'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => onSelectVector(v)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activeVector === v
                      ? 'bg-rzp-blue text-white shadow-md'
                      : 'text-rzp-textMuted hover:text-slate-200'
                  }`}
                >
                  {v === 'ALL' ? 'All' : v.split('_')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vectorChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121827', borderColor: '#1F293D', borderRadius: '12px', color: '#F8FAFC' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="atRisk" name="At Risk" fill="#334155" radius={[6, 6, 0, 0]} />
                <Bar dataKey="recovered" name="Money Recovered" fill="#3071FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live AI Agent Execution Feed */}
        <div className="bg-rzp-card border border-rzp-border p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-rzp-blue" />
              <h3 className="text-base font-bold text-white">Live Agent Interventions</h3>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rzp-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rzp-emerald"></span>
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[260px]">
            {recentRecovered.length === 0 ? (
              <div className="text-center py-10 text-xs text-rzp-textMuted">
                No active interventions yet. Click "Run Batch Recovery" to launch agent actions.
              </div>
            ) : (
              recentRecovered.map(record => (
                <div
                  key={record.id}
                  onClick={() => onOpenAudit(record)}
                  className="bg-[#0B0F19] hover:bg-rzp-cardHover border border-rzp-border hover:border-rzp-blue/40 p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between space-x-3"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200 truncate">{record.customerName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rzp-blue/10 text-rzp-blue border border-rzp-blue/20">
                        {record.vector.split('_')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-rzp-textMuted truncate">
                      {record.status === 'RECOVERED' ? `Recovered ₹${record.recoveredAmount.toLocaleString('en-IN')}` : record.auditTrail[record.auditTrail.length - 1]?.title}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-bold text-rzp-emerald">₹{record.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-rzp-blue flex items-center hover:underline">
                      Audit <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
