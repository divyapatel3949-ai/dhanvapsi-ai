import React, { useState } from 'react';
import { RevenueRecord } from '../types/recovery';

interface RecoveryQueueProps {
  records: RevenueRecord[];
  onSelectCase: (rec: RevenueRecord) => void;
}

type SortKey = 'amount' | 'probability' | 'expected' | 'netExpected';

export const RecoveryQueue: React.FC<RecoveryQueueProps> = ({ records, onSelectCase }) => {
  const [sortBy, setSortBy] = useState<SortKey>('netExpected');

  const sorted = [...records].sort((a, b) => {
    switch (sortBy) {
      case 'amount': return b.amount - a.amount;
      case 'probability': return b.recoveryProbability - a.recoveryProbability;
      case 'expected': return b.expectedRecoverable - a.expectedRecoverable;
      case 'netExpected': return b.netExpectedValue - a.netExpectedValue;
    }
  });

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: 'netExpected', label: 'Sort by net expected' },
    { key: 'expected', label: 'Sort by expected recoverable' },
    { key: 'probability', label: 'Sort by probability' },
    { key: 'amount', label: 'Sort by amount' },
  ];

  const statusBadge = (rec: RevenueRecord) => {
    if (rec.status === 'RECOVERED') return { text: 'recovered', cls: 'text-dv-lime border-dv-lime/30 bg-dv-lime/10' };
    if (rec.status === 'ESCALATED_HUMAN_REVIEW') return { text: 'escalated', cls: 'text-dv-amber border-dv-amber/30 bg-dv-amber/10' };
    if (rec.status.startsWith('HALTED_')) return { text: 'stopped', cls: 'text-dv-rose border-dv-rose/30 bg-dv-rose/10' };
    if (rec.status === 'INTERVENTION_SENT') return { text: 'failed', cls: 'text-dv-textMuted border-dv-border bg-dv-bg' };
    return { text: 'open', cls: 'text-dv-cyan border-dv-cyan/30 bg-dv-cyan/10' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-dv-amber uppercase tracking-[0.15em] mb-1">Merchant Operations</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Recovery Queue</h1>
        </div>
        <p className="text-xs text-dv-textMuted max-w-xs text-right mt-4">
          Ranked by expected net recoverable value. Click a row to inspect forensics.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        {sortButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => setSortBy(btn.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              sortBy === btn.key
                ? 'bg-white text-dv-bg border-white'
                : 'bg-transparent text-dv-textMuted border-dv-border hover:border-dv-borderLight hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-dv-textDim">Sorted by predicted values. Click a row to open Forensics.</p>

      <div className="bg-dv-card border border-dv-border rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[900px]">
          <thead className="border-b border-dv-border">
            <tr className="text-dv-textDim uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Failure</th>
              <th className="py-3 px-4">Est. P</th>
              <th className="py-3 px-4">Expected recoverable</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Action P</th>
              <th className="py-3 px-4">Cost</th>
              <th className="py-3 px-4">Net EV</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dv-border/50">
            {sorted.map(rec => {
              const badge = statusBadge(rec);
              return (
                <tr
                  key={rec.id}
                  onClick={() => onSelectCase(rec)}
                  className="hover:bg-dv-cardHover cursor-pointer transition-colors text-slate-300"
                >
                  <td className="py-3 px-4 font-mono text-xs text-slate-200">{rec.id}</td>
                  <td className="py-3 px-4 font-semibold text-white">₹{rec.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-dv-textMuted max-w-[160px] truncate">
                    {rec.errorReason || rec.checkoutItem || (rec.overdueDays ? `${rec.overdueDays}d overdue` : 'unknown')}
                  </td>
                  <td className="py-3 px-4 text-white">{(rec.recoveryProbability * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-white font-semibold">₹{rec.expectedRecoverable.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-dv-textMuted">{rec.selectedAction.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 text-white">{(rec.actionProbability * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-dv-textMuted">₹{rec.actionCost}</td>
                  <td className="py-3 px-4 font-bold text-dv-lime">₹{rec.netExpectedValue.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.cls}`}>
                      {badge.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
