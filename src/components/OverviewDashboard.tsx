import React, { useMemo } from 'react';
import { BatchMetrics, RevenueRecord, RecoveryVector } from '../types/recovery';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CheckCircle2, XCircle, ArrowUpRight, OctagonX, TrendingUp } from 'lucide-react';
import { BatchProgress } from '../App';
import { RECOVERY_GUARDRAILS } from '../services/mockData';

interface OverviewDashboardProps {
  metrics: BatchMetrics;
  records: RevenueRecord[];
  batchProgress: BatchProgress;
  onOpenAudit: (rec: RevenueRecord) => void;
  onRunBatch: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  metrics, records, batchProgress, onOpenAudit, onRunBatch
}) => {
  const vectorChartData = [
    { name: 'Payment Fail', atRisk: metrics.vectorBreakdown.PAYMENT_DEGRADATION.atRisk, recovered: metrics.vectorBreakdown.PAYMENT_DEGRADATION.recovered },
    { name: 'Cart Dropoff', atRisk: metrics.vectorBreakdown.CHECKOUT_ABANDONMENT.atRisk, recovered: metrics.vectorBreakdown.CHECKOUT_ABANDONMENT.recovered },
    { name: 'Subscription', atRisk: metrics.vectorBreakdown.FAILED_SUBSCRIPTION.atRisk, recovered: metrics.vectorBreakdown.FAILED_SUBSCRIPTION.recovered },
    { name: 'Mandate', atRisk: metrics.vectorBreakdown.MANDATE_FAILURE.atRisk, recovered: metrics.vectorBreakdown.MANDATE_FAILURE.recovered },
    { name: 'B2B Invoice', atRisk: metrics.vectorBreakdown.B2B_RECEIVABLES.atRisk, recovered: metrics.vectorBreakdown.B2B_RECEIVABLES.recovered },
  ];

  const demoCases = useMemo(() => {
    const vectors: RecoveryVector[] = ['PAYMENT_DEGRADATION', 'CHECKOUT_ABANDONMENT', 'FAILED_SUBSCRIPTION', 'MANDATE_FAILURE', 'B2B_RECEIVABLES'];
    const picked: RevenueRecord[] = [];
    for (const v of vectors) {
      const r = records.find(rec => rec.vector === v);
      if (r) picked.push(r);
    }
    return picked.slice(0, 5);
  }, [records]);

  const vectorLabel: Record<RecoveryVector, string> = {
    PAYMENT_DEGRADATION: 'Payment failure',
    CHECKOUT_ABANDONMENT: 'Checkout drop-off',
    FAILED_SUBSCRIPTION: 'Failed subscription',
    MANDATE_FAILURE: 'Mandate failure',
    B2B_RECEIVABLES: 'B2B overdue invoice',
  };

  const vectorColor: Record<RecoveryVector, string> = {
    PAYMENT_DEGRADATION: 'border-dv-rose text-dv-rose bg-dv-rose/10',
    CHECKOUT_ABANDONMENT: 'border-dv-amber text-dv-amber bg-dv-amber/10',
    FAILED_SUBSCRIPTION: 'border-dv-cyan text-dv-cyan bg-dv-cyan/10',
    MANDATE_FAILURE: 'border-purple-400 text-purple-400 bg-purple-400/10',
    B2B_RECEIVABLES: 'border-dv-violet text-dv-violet bg-dv-violet/10',
  };

  const isProcessed = metrics.recoveredCount > 0 || metrics.failedCount > 0 || metrics.escalatedCount > 0 || metrics.stoppedCount > 0;

  const statusLabel = (s: RevenueRecord['status']): string => {
    if (s === 'RECOVERED') return 'recovered';
    if (s === 'ESCALATED_HUMAN_REVIEW') return 'escalated';
    if (s.startsWith('HALTED_')) return 'stopped';
    if (s === 'INTERVENTION_SENT') return 'failed';
    return 'open';
  };

  const statusColor = (s: RevenueRecord['status']): string => {
    if (s === 'RECOVERED') return 'text-dv-lime';
    if (s === 'ESCALATED_HUMAN_REVIEW') return 'text-dv-amber';
    if (s.startsWith('HALTED_')) return 'text-dv-rose';
    if (s === 'INTERVENTION_SENT') return 'text-dv-textMuted';
    return 'text-dv-cyan';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-dv-amber uppercase tracking-[0.15em] mb-1">Merchant Operations</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview</h1>
        </div>
        <p className="text-xs text-dv-textMuted max-w-xs text-right mt-4">
          DhanVapsi estimates recovery probability and ranks revenue opportunities by expected recoverable value.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-dv-card border border-dv-border rounded-xl p-4 hover:border-dv-borderLight transition-all">
          <p className="text-[11px] text-dv-textMuted font-medium mb-2">Revenue at risk</p>
          <p className="text-2xl font-extrabold text-white tracking-tight">₹{metrics.totalRevenueAtRisk.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-dv-textDim mt-1.5">{metrics.totalRecordsProcessed} transactions detected</p>
        </div>
        <div className="bg-dv-card border border-dv-border rounded-xl p-4 hover:border-dv-borderLight transition-all">
          <p className="text-[11px] text-dv-textMuted font-medium mb-2">Expected recoverable</p>
          <p className="text-2xl font-extrabold text-white tracking-tight">₹{records.reduce((s, r) => s + r.expectedRecoverable, 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-dv-textDim mt-1.5">Amount × P(recovery). Evaluation only.</p>
        </div>
        <div className="bg-dv-card border border-dv-border rounded-xl p-4 hover:border-dv-borderLight transition-all">
          <p className="text-[11px] text-dv-textMuted font-medium mb-2">Simulated recovered</p>
          <p className={`text-2xl font-extrabold tracking-tight ${metrics.totalMoneyRecovered > 0 ? 'text-dv-lime' : 'text-white'}`}>
            ₹{metrics.totalMoneyRecovered.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-dv-textDim mt-1.5">{metrics.recoveredCount} successful recoveries</p>
        </div>
        <div className="bg-dv-card border border-dv-border rounded-xl p-4 hover:border-dv-borderLight transition-all">
          <p className="text-[11px] text-dv-textMuted font-medium mb-2">Net recovered</p>
          <p className={`text-2xl font-extrabold tracking-tight ${metrics.totalNetRecovered > 0 ? 'text-dv-lime' : 'text-white'}`}>
            ₹{metrics.totalNetRecovered.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-dv-textDim mt-1.5">Recovery minus ₹{metrics.totalCost.toLocaleString('en-IN')} cost</p>
        </div>
        <div className="bg-dv-card border border-dv-border rounded-xl p-4 hover:border-dv-borderLight transition-all">
          <p className="text-[11px] text-dv-textMuted font-medium mb-2">Recovery rate</p>
          <p className={`text-2xl font-extrabold tracking-tight ${metrics.recoveryRatePercent > 0 ? 'text-dv-lime' : 'text-white'}`}>
            {metrics.recoveryRatePercent}%
          </p>
          <p className="text-[10px] text-dv-textDim mt-1.5">
            {metrics.recoveredCount} recovered · {metrics.escalatedCount} escalated · {metrics.stoppedCount} stopped
          </p>
        </div>
      </div>

      {/* Recovery Result Summary (after batch complete) */}
      {batchProgress.state === 'complete' && isProcessed && (
        <div className="bg-dv-lime/5 border border-dv-lime/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-dv-lime" />
            <h2 className="text-lg font-extrabold text-white">Recovery Simulation Complete</h2>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-dv-lime shrink-0" />
              <div>
                <p className="text-dv-lime font-bold">{metrics.recoveredCount} Recovered</p>
                <p className="text-[10px] text-dv-textDim">₹{metrics.totalMoneyRecovered.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <XCircle className="w-4 h-4 text-dv-textMuted shrink-0" />
              <div>
                <p className="text-dv-textMuted font-bold">{metrics.failedCount} Failed</p>
                <p className="text-[10px] text-dv-textDim">No payment captured</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ArrowUpRight className="w-4 h-4 text-dv-amber shrink-0" />
              <div>
                <p className="text-dv-amber font-bold">{metrics.escalatedCount} Escalated</p>
                <p className="text-[10px] text-dv-textDim">Sent to human review</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <OctagonX className="w-4 h-4 text-dv-rose shrink-0" />
              <div>
                <p className="text-dv-rose font-bold">{metrics.stoppedCount} Stopped</p>
                <p className="text-[10px] text-dv-textDim">Guardrail triggered</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-dv-textDim text-center py-1">
        All recovered-money figures come from a synthetic simulation on hidden probabilities. This is not observed merchant recovery.
      </p>

      {/* Recovery Guardrails */}
      <div className="bg-dv-card border border-dv-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Recovery Guardrails (Policy Limits)</h3>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <p className="text-dv-textMuted">Max payment retries</p>
            <p className="text-white font-bold">{RECOVERY_GUARDRAILS.maxPaymentRetries}</p>
          </div>
          <div className="space-y-1">
            <p className="text-dv-textMuted">Max recovery messages</p>
            <p className="text-white font-bold">{RECOVERY_GUARDRAILS.maxRecoveryMessages}</p>
          </div>
          <div className="space-y-1">
            <p className="text-dv-textMuted">Recovery window</p>
            <p className="text-white font-bold">{RECOVERY_GUARDRAILS.recoveryWindowHours} hours</p>
          </div>
          <div className="space-y-1">
            <p className="text-dv-textMuted">Auto-escalation</p>
            <p className="text-white font-bold">{RECOVERY_GUARDRAILS.autoEscalation ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-dv-textMuted">Customer opt-out</p>
            <p className="text-white font-bold">Always stops recovery</p>
          </div>
          <div className="space-y-1">
            <p className="text-dv-textMuted">Human review threshold</p>
            <p className="text-white font-bold">₹{RECOVERY_GUARDRAILS.humanReviewThreshold.toLocaleString('en-IN')}+</p>
          </div>
        </div>
      </div>

      {/* Demo Mix */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-white">Demo mix</h2>
          <p className="text-xs text-dv-textMuted">Five cases covering all leakage vectors. Click a card to open Forensics.</p>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {demoCases.map(rec => (
            <div
              key={rec.id}
              onClick={() => onOpenAudit(rec)}
              className={`bg-dv-card border rounded-xl p-4 cursor-pointer hover:bg-dv-cardHover transition-all space-y-3 ${vectorColor[rec.vector]}`}
            >
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vectorColor[rec.vector]}`}>
                {vectorLabel[rec.vector]}
              </span>
              <p className="text-2xl font-extrabold text-white">₹{rec.amount.toLocaleString('en-IN')}</p>
              <div className="space-y-0.5 text-[11px] text-dv-textMuted">
                <p>Est. recovery {(rec.recoveryProbability * 100).toFixed(1)}%</p>
                <p>Expected ₹{rec.expectedRecoverable.toLocaleString('en-IN')}</p>
                <p>Action {rec.selectedAction.replace(/_/g, ' ')}</p>
                <p className={`font-semibold ${statusColor(rec.status)}`}>{statusLabel(rec.status)}</p>
              </div>
              <p className="text-[10px] text-dv-textDim font-mono">{rec.id}</p>
              <p className="text-xs font-semibold text-dv-violet hover:underline">Open case →</p>
            </div>
          ))}
        </div>
      </div>

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
