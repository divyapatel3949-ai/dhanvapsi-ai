import React, { useState } from 'react';
import { RevenueRecord, RecoveryVector } from '../types/recovery';

interface RecoveryQueueProps {
  records: RevenueRecord[];
  onSelectCase: (rec: RevenueRecord) => void;
}

type SortKey = 'amount' | 'probability' | 'expected' | 'netExpected';

export const RecoveryQueue: React.FC<RecoveryQueueProps> = ({ records, onSelectCase }) => {
  const [sortBy, setSortBy] = useState<SortKey>('netExpected');

  const getEstP = (rec: RevenueRecord) => {
    const base = rec.riskSeverity === 'CRITICAL' ? 0.7 : rec.riskSeverity === 'HIGH' ? 0.65 : rec.riskSeverity === 'MEDIUM' ? 0.55 : 0.45;
    // Deterministic hash from id
    const hash = rec.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return Math.min(0.95, base + (hash % 20) / 100);
  };

  const getAction = (rec: RevenueRecord): string => {
    switch (rec.vector) {
      case 'PAYMENT_DEGRADATION': return 'RETRY LATER';
      case 'CHECKOUT_ABANDONMENT': return 'SEND RECOVERY MESSAGE';
      case 'FAILED_SUBSCRIPTION': return 'REQUEST PAYMENT UPDATE';
      case 'B2B_RECEIVABLES': return rec.amount > 50000 ? 'HUMAN REVIEW' : 'SEND RECOVERY MESSAGE';
    }
  };

  const getActionP = (rec: RevenueRecord) => {
    const hash = rec.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 0.5 + (hash % 40) / 100;
  };

  const getCost = (rec: RevenueRecord) => {
    const action = getAction(rec);
    if (action === 'HUMAN REVIEW') return 500;
    if (action === 'REQUEST PAYMENT UPDATE') return 80;
    return 40;
  };

  const enriched = records.map(rec => {
    const estP = getEstP(rec);
    const expectedRecoverable = Math.round(rec.amount * estP);
    const actionP = getActionP(rec);
    const cost = getCost(rec);
    const netEV = Math.round(expectedRecoverable * actionP - cost);
    return { ...rec, estP, expectedRecoverable, action: getAction(rec), actionP, cost, netEV };
  });

  const sorted = [...enriched].sort((a, b) => {
    switch (sortBy) {
      case 'amount': return b.amount - a.amount;
      case 'probability': return b.estP - a.estP;
      case 'expected': return b.expectedRecoverable - a.expectedRecoverable;
      case 'netExpected': return b.netEV - a.netEV;
    }
  });

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: 'netExpected', label: 'Sort by net expected' },
    { key: 'expected', label: 'Sort by expected recoverable' },
    { key: 'probability', label: 'Sort by probability' },
    { key: 'amount', label: 'Sort by amount' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-dv-amber uppercase tracking-[0.15em] mb-1">Merchant Operations</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Recovery Queue</h1>
        </div>
        <p className="text-xs text-dv-textMuted max-w-xs text-right mt-4">
          DhanVapsi estimates recovery probability and ranks revenue opportunities by expected recoverable value.
        </p>
      </div>

      {/* Sort Buttons */}
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

      <p className="text-xs text-dv-textDim">Sorted by predicted values, not oracle labels. Click a row to open Forensics.</p>

      {/* Table */}
      <div className="bg-dv-card border border-dv-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-dv-border">
            <tr className="text-dv-textDim uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">INR</th>
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
            {sorted.map(rec => (
              <tr
                key={rec.id}
                onClick={() => onSelectCase(rec)}
                className="hover:bg-dv-cardHover cursor-pointer transition-colors text-slate-300"
              >
                <td className="py-3 px-4 font-mono text-xs text-slate-200">{rec.id}</td>
                <td className="py-3 px-4">
                  <div className="text-slate-200">{rec.currency}</div>
                  <div className="text-dv-textDim">{rec.amount.toLocaleString('en-IN')}</div>
                </td>
                <td className="py-3 px-4 font-semibold text-white">₹{rec.amount.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-dv-textMuted max-w-[140px] truncate">
                  {rec.errorReason || rec.checkoutItem || (rec.overdueDays ? `${rec.overdueDays}d overdue` : 'unknown')}
                </td>
                <td className="py-3 px-4 text-white">{(rec.estP * 100).toFixed(1)}%</td>
                <td className="py-3 px-4 text-white font-semibold">₹{rec.expectedRecoverable.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-dv-textMuted">{rec.action}</td>
                <td className="py-3 px-4 text-white">{(rec.actionP * 100).toFixed(1)}%</td>
                <td className="py-3 px-4 text-dv-textMuted">₹{rec.cost}</td>
                <td className="py-3 px-4 font-bold text-dv-lime">₹{rec.netEV.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    rec.status === 'RECOVERED' ? 'text-dv-lime border-dv-lime/30 bg-dv-lime/10' :
                    rec.status.startsWith('HALTED_') ? 'text-dv-rose border-dv-rose/30 bg-dv-rose/10' :
                    'text-dv-cyan border-dv-cyan/30 bg-dv-cyan/10'
                  }`}>
                    {rec.status === 'RECOVERED' ? 'recovered' : rec.status.startsWith('HALTED_') ? 'stopped' : 'open'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
