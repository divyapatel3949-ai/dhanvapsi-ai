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
      rec.auditTrail.forEach(step => {
        let action = 'RETRY LATER';
        if (step.stage === 'STOPPING_RULE') action = 'STOP';
        else if (rec.vector === 'CHECKOUT_ABANDONMENT') action = 'SEND RECOVERY MESSAGE';
        else if (rec.vector === 'FAILED_SUBSCRIPTION') action = 'REQUEST PAYMENT UPDATE';
        else if (rec.vector === 'B2B_RECEIVABLES') action = rec.amount > 50000 ? 'HUMAN REVIEW' : 'SEND RECOVERY MESSAGE';

        const policy = step.stage === 'STOPPING_RULE' ? 'overridden' : 'allowed';
        const result = rec.status === 'RECOVERED' && step.stage === 'OUTCOME' ? 'success' :
                       step.stage === 'STOPPING_RULE' ? 'stopped' : 'failed';
        const recovered = rec.status === 'RECOVERED' && step.stage === 'OUTCOME'
          ? `₹${rec.recoveredAmount.toLocaleString('en-IN')}`
          : '₹0';

        rows.push({
          time: new Date(step.timestamp).toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          paymentId: rec.id,
          action,
          policy,
          mode: 'simulated',
          result,
          recovered,
          record: rec,
        });
      });
    });

    // Sort newest first
    return rows.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 30);
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-dv-amber uppercase tracking-[0.15em] mb-1">Merchant Operations</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Agent Activity</h1>
        </div>
        <p className="text-xs text-dv-textMuted max-w-xs text-right mt-4">
          DhanVapsi estimates recovery probability and ranks revenue opportunities by expected recoverable value.
        </p>
      </div>

      <p className="text-xs text-dv-textDim">Newest first. Every row is labelled simulated. Click a payment to reopen Forensics.</p>

      {/* Activity Table */}
      <div className="bg-dv-card border border-dv-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
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
                  No agent activity yet. Run batch recovery from the Overview to populate this log.
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
                    <span className={`font-semibold ${row.action === 'STOP' ? 'text-dv-rose bg-dv-rose/10 px-2 py-0.5 rounded border border-dv-rose/30' : 'text-slate-300'}`}>
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
                    <span className={`font-semibold ${
                      row.result === 'success' ? 'text-dv-lime' :
                      row.result === 'stopped' ? 'text-dv-rose' :
                      'text-dv-textMuted'
                    }`}>
                      {row.result}
                    </span>
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
