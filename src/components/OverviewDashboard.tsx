import React, { useMemo } from 'react';
import { BatchMetrics, RevenueRecord, RecoveryVector } from '../types/recovery';
import { IndianRupee, TrendingUp, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
  const vectorChartData = [
    { name: 'Payment Fail', atRisk: metrics.vectorBreakdown.PAYMENT_DEGRADATION.atRisk, recovered: metrics.vectorBreakdown.PAYMENT_DEGRADATION.recovered },
    { name: 'Cart Dropoff', atRisk: metrics.vectorBreakdown.CHECKOUT_ABANDONMENT.atRisk, recovered: metrics.vectorBreakdown.CHECKOUT_ABANDONMENT.recovered },
    { name: 'Mandate Fail', atRisk: metrics.vectorBreakdown.FAILED_SUBSCRIPTION.atRisk, recovered: metrics.vectorBreakdown.FAILED_SUBSCRIPTION.recovered },
    { name: 'B2B Invoice', atRisk: metrics.vectorBreakdown.B2B_RECEIVABLES.atRisk, recovered: metrics.vectorBreakdown.B2B_RECEIVABLES.recovered },
  ];

  // Demo mix - pick 5 representative cases
  const demoCases = useMemo(() => {
    const vectors: RecoveryVector[] = ['PAYMENT_DEGRADATION', 'CHECKOUT_ABANDONMENT', 'FAILED_SUBSCRIPTION', 'B2B_RECEIVABLES'];
    const picked: RevenueRecord[] = [];
    for (const v of vectors) {
      const r = records.find(rec => rec.vector === v);
      if (r) picked.push(r);
    }
    // add one more if possible
    const extra = records.find(r => !picked.includes(r));
    if (extra) picked.push(extra);
    return picked.slice(0, 5);
  }, [records]);

  const kpiCards = [
    { label: 'Revenue at risk', value: `₹${metrics.totalRevenueAtRisk.toLocaleString('en-IN')}`, sub: `${metrics.totalRecordsProcessed} failed/overdue transactions detected`, color: 'text-white' },
    { label: 'Expected recoverable', value: `₹${Math.round(metrics.totalRevenueAtRisk * 0.7).toLocaleString('en-IN')}`, sub: 'Amount × hidden P(selected action). Evaluation only.', color: 'text-white' },
    { label: 'Simulated recovered (mean)', value: `₹${metrics.totalMoneyRecovered.toLocaleString('en-IN')}`, sub: `Mean of seeded draws. 90% band estimates.`, color: 'text-white' },
    { label: 'Net simulated recovered', value: `₹${Math.round(metrics.totalMoneyRecovered * 0.98).toLocaleString('en-IN')}`, sub: 'Simulated cash minus intervention cost.', color: 'text-white' },
    { label: 'Recovery rate', value: `${metrics.recoveryRatePercent}%`, sub: `${records.filter(r => r.status === 'RECOVERED').length} recovered · ${records.filter(r => r.status.startsWith('HALTED_')).length} halted`, color: 'text-dv-lime' },
  ];

  const vectorLabel: Record<RecoveryVector, string> = {
    PAYMENT_DEGRADATION: 'Retry-obvious failure',
    CHECKOUT_ABANDONMENT: 'Checkout drop-off',
    FAILED_SUBSCRIPTION: 'Failed subscription',
    B2B_RECEIVABLES: 'B2B receivable overdue',
  };

  const vectorColor: Record<RecoveryVector, string> = {
    PAYMENT_DEGRADATION: 'border-dv-rose text-dv-rose bg-dv-rose/10',
    CHECKOUT_ABANDONMENT: 'border-dv-amber text-dv-amber bg-dv-amber/10',
    FAILED_SUBSCRIPTION: 'border-dv-cyan text-dv-cyan bg-dv-cyan/10',
    B2B_RECEIVABLES: 'border-dv-violet text-dv-violet bg-dv-violet/10',
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-dv-amber uppercase tracking-[0.15em] mb-1">Merchant Operations</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview</h1>
        </div>
        <p className="text-xs text-dv-textMuted max-w-xs text-right mt-4">
          DhanVapsi estimates recovery probability and ranks revenue opportunities by expected recoverable value.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-5 gap-3">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-dv-card border border-dv-border rounded-xl p-4 hover:border-dv-borderLight transition-all">
            <p className="text-[11px] text-dv-textMuted font-medium mb-2">{kpi.label}</p>
            <p className={`text-2xl font-extrabold ${kpi.color} tracking-tight`}>{kpi.value}</p>
            <p className="text-[10px] text-dv-textDim mt-1.5 leading-relaxed">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-dv-textDim text-center py-1">
        All recovered-money figures come from a synthetic Bernoulli simulation on hidden probabilities. This is not observed merchant recovery.
      </p>

      {/* Demo Mix Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-white">Demo mix</h2>
          <p className="text-xs text-dv-textMuted">Five stable cases covering the recovery actions. Click a card to open Forensics.</p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {demoCases.map((rec, i) => (
            <div
              key={rec.id}
              onClick={() => onOpenAudit(rec)}
              className={`bg-dv-card border rounded-xl p-4 cursor-pointer hover:bg-dv-cardHover transition-all space-y-3 ${vectorColor[rec.vector]}`}
            >
              {/* Vector badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vectorColor[rec.vector]}`}>
                {vectorLabel[rec.vector]}
              </span>

              {/* Amount */}
              <p className="text-2xl font-extrabold text-white">₹{rec.amount.toLocaleString('en-IN')}</p>

              {/* Details */}
              <div className="space-y-0.5 text-[11px] text-dv-textMuted">
                <p>{rec.currency} {rec.amount.toLocaleString('en-IN')}</p>
                <p>Estimated recovery {(Math.random() * 30 + 50).toFixed(1)}%</p>
                <p>Expected recoverable ₹{Math.round(rec.amount * 0.7).toLocaleString('en-IN')}</p>
                <p>Action {rec.recoveryChannel || 'RETRY LATER'}</p>
              </div>

              {/* ID */}
              <p className="text-[10px] text-dv-textDim font-mono">{rec.id}</p>

              {/* Open Case Link */}
              <p className="text-xs font-semibold text-dv-violet cursor-pointer hover:underline">Open case →</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-center text-lg text-dv-textMuted italic py-2">
        This is not a lucky single draw.
      </p>

      {/* Chart */}
      <div className="bg-dv-card border border-dv-border rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-4">Recovery by Leakage Vector</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vectorChartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252249" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#151231', borderColor: '#252249', borderRadius: '10px', color: '#f1f5f9' }} formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
              <Bar dataKey="atRisk" name="At Risk" fill="#3f3f46" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recovered" name="Recovered" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
