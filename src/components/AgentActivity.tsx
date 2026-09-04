import React, { useMemo } from 'react';
import { RevenueRecord } from '../types/recovery';

interface AgentActivityProps {
  records: RevenueRecord[];
  onSelectCase: (rec: RevenueRecord) => void;
}

interface ActivityRow {
  time: string;
  paymentId: string;
  action: string;
  policy: string;
  mode: string;
  result: string;
  recovered: string;
  record: RevenueRecord;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({ records, onSelectCase }) => {
  const activityRows: ActivityRow[] = useMemo(() => {
    const rows: ActivityRow[] = [];

    records.forEach(rec => {
      // Only show records that have been processed (more than just DETECTION)
      if (rec.auditTrail.length <= 1) return;

      // Create one summary row per record from the final audit step
      const lastStep = rec.auditTrail[rec.auditTrail.length - 1];
      const actionLabel = rec.selectedAction.replace(/_/g, ' ');
      
      let result: string;
      let recovered: string;
      let action = actionLabel;
      let policy = 'allowed';

      if (rec.status === 'RECOVERED') {
        result = 'success';
        recovered = `₹${rec.recoveredAmount.toLocaleString('en-IN')}`;
      } else if (rec.status === 'ESCALATED_HUMAN_REVIEW') {
        result = 'escalated';
        recovered = '₹0';
        action = 'HUMAN REVIEW';
      } else if (rec.status === 'HALTED_OPT_OUT') {
        result = 'stopped';
        recovered = '₹0';
        action = 'STOP';
        policy = 'overridden';
      } else if (rec.status === 'HALTED_DISPUTE') {
        result = 'stopped';
        recovered = '₹0';
        action = 'STOP';
        policy = 'overridden';
      } else if (rec.status === 'HALTED_MAX_ATTEMPTS') {
        result = 'stopped';
        recovered = '₹0';
        action = 'STOP';
        policy = 'overridden';
      } else if (rec.status === 'INTERVENTION_SENT') {
        result = 'failed';
        recovered = '₹0';
      } else if (rec.status === 'PTP_REGISTERED') {
        result = 'ptp';
        recovered = '₹0';
      } else {
        return; // Skip unprocessed
      }

      rows.push({
        time: new Date(lastStep.timestamp).toLocaleString('en-IN', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        paymentId: rec.id,
        action,
        policy,
        mode: 'simulated',
        result,
        recovered,
        record: rec,
      });
    });

    // Sort newest first
    return rows.sort((a, b) => {
      // Sort by result priority for demo: success first, then failed, escalated, stopped
      const order: Record<string, number> = { success: 0, failed: 1, escalated: 2, ptp: 3, stopped: 4 };
      return (order[a.result] ?? 5) - (order[b.result] ?? 5);
    });
  }, [records]);

  const resultColor = (r: string) => {
    if (r === 'success') return 'text-dv-lime';
    if (r === 'escalated') return 'text-dv-amber';
    if (r === 'stopped') return 'text-dv-rose';
    if (r === 'ptp') return 'text-dv-cyan';
    return 'text-dv-textMuted';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-dv-amber uppercase tracking-[0.15em] mb-1">Merchant Operations</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Agent Activity</h1>
        </div>
        <p className="text-xs text-dv-textMuted max-w-xs text-right mt-4">
          Every recovery action is logged. Click a payment to reopen Forensics.
        </p>
      </div>

      <p className="text-xs text-dv-textDim">
        Every row is labelled <span className="text-dv-violet font-semibold">simulated</span>. Grouped by outcome. Click a payment to view case forensics.
      </p>

      <div className="bg-dv-card border border-dv-border rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[800px]">
          <thead className="border-b border-dv-border">
            <tr className="text-dv-textDim uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Policy</th>
              <th className="py-3 px-4">Mode</th>
              <th className="py-3 px-4">Result</th>
              <th className="py-3 px-4">Recovered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dv-border/50">
            {activityRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-dv-textMuted">
                  No agent activity yet. Click "Run Batch Recovery" to execute the simulation.
                </td>
              </tr>
            ) : (
              activityRows.map((row, i) => (
                <tr
                  key={`${row.paymentId}-${i}`}
                  onClick={() => onSelectCase(row.record)}
                  className="hover:bg-dv-cardHover cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-dv-textMuted font-mono text-[11px]">{row.time}</td>
                  <td className="py-3 px-4 text-slate-200 font-mono">{row.paymentId}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      row.action === 'STOP' ? 'text-dv-rose bg-dv-rose/10 px-2 py-0.5 rounded border border-dv-rose/30' :
                      row.action === 'HUMAN REVIEW' ? 'text-dv-amber' :
                      'text-slate-300'
                    }`}>
                      {row.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-dv-textMuted">{row.policy}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dv-violet/15 border border-dv-violet/30 text-dv-violet">
                      {row.mode}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${resultColor(row.result)}`}>{row.result}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{row.recovered}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
