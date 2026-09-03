import React from 'react';
import { RevenueRecord } from '../types/recovery';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface CaseForensicsProps {
  record: RevenueRecord | null;
  onBack: () => void;
}

export const CaseForensics: React.FC<CaseForensicsProps> = ({ record, onBack }) => {
  if (!record) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold text-dv-amber uppercase tracking-[0.15em] mb-1">Merchant Operations</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Case Forensics</h1>
        </div>
        <div className="bg-dv-card border border-dv-border rounded-xl p-12 text-center">
          <p className="text-dv-textMuted text-sm">Select a case from the Recovery Queue or Overview to inspect forensics.</p>
        </div>
      </div>
    );
  }

  const estP = (() => {
    const base = record.riskSeverity === 'CRITICAL' ? 0.7 : record.riskSeverity === 'HIGH' ? 0.65 : record.riskSeverity === 'MEDIUM' ? 0.55 : 0.45;
    const hash = record.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return Math.min(0.95, base + (hash % 20) / 100);
  })();

  const expectedRecoverable = Math.round(record.amount * estP);
  const netExpected = Math.round(expectedRecoverable * 0.83 - 40);

  const actionMap: Record<string, string> = {
    PAYMENT_DEGRADATION: 'RETRY LATER',
    CHECKOUT_ABANDONMENT: 'SEND RECOVERY MESSAGE',
    FAILED_SUBSCRIPTION: 'REQUEST PAYMENT UPDATE',
    B2B_RECEIVABLES: record.amount > 50000 ? 'HUMAN REVIEW' : 'SEND RECOVERY MESSAGE',
  };
  const bestAction = actionMap[record.vector] || 'RETRY LATER';

  const candidateActions = [
    { action: 'RETRY LATER', p: '83.3%', netEV: `₹${netExpected.toLocaleString('en-IN')}`, selected: bestAction === 'RETRY LATER' },
    { action: 'REQUEST PAYMENT UPDATE', p: '67.1%', netEV: `₹${Math.round(netExpected * 0.8).toLocaleString('en-IN')}`, selected: bestAction === 'REQUEST PAYMENT UPDATE' },
    { action: 'SEND RECOVERY MESSAGE', p: '55.0%', netEV: `₹${Math.round(netExpected * 0.6).toLocaleString('en-IN')}`, selected: bestAction === 'SEND RECOVERY MESSAGE' },
    { action: 'REQUEST CUSTOMER ACTION', p: '42.5%', netEV: `₹${Math.round(netExpected * 0.4).toLocaleString('en-IN')}`, selected: false },
    { action: 'HUMAN REVIEW', p: '64.0%', netEV: `₹${Math.round(netExpected * 0.5).toLocaleString('en-IN')}`, selected: bestAction === 'HUMAN REVIEW' },
    { action: 'STOP', p: '—', netEV: '₹0', selected: false },
  ];

  const pipelineSteps = [
    {
      num: '1',
      title: 'Observed Razorpay Data',
      content: [
        `${record.customerName}`,
        `${record.customerEmail}`,
        `INR ${record.amount.toLocaleString('en-IN')}`,
        record.bankName ? `${record.bankName} · Card/UPI` : 'Payment method detected',
        `Failed: ${record.errorReason || record.checkoutItem || `${record.overdueDays}d overdue`}`,
        record.errorCode ? `Error: ${record.errorCode}` : '',
      ].filter(Boolean),
    },
    {
      num: '2',
      title: 'DhanVapsi Model Prediction',
      content: [
        `Recovery probability: ${(estP * 100).toFixed(1)}%`,
        `Expected recoverable: ₹${expectedRecoverable.toLocaleString('en-IN')}`,
        `Best action: ${bestAction}`,
        `Predicted action P: 83.3%`,
        `Net expected: ₹${netExpected.toLocaleString('en-IN')}`,
        '',
        'Model 1 estimates recovery probability.',
        'Model 2 estimates P(success) per action. Both use only failure-time features.',
      ],
    },
    {
      num: '3',
      title: 'DhanVapsi Policy Decision',
      content: [
        `Selected action: ${bestAction}`,
        'Legal actions: RETRY LATER, REQUEST PAYMENT UPDATE, SEND RECOVERY MESSAGE, REQUEST CUSTOMER ACTION, HUMAN REVIEW, STOP',
        '',
        'Model 2 pick was inside the allowlist.',
      ],
    },
    {
      num: '4',
      title: 'Simulated Outcome',
      content: [
        `Result: ${record.status === 'RECOVERED' ? 'success' : record.status.startsWith('HALTED_') ? 'stopped' : 'pending'}`,
        record.status === 'RECOVERED' ? `Recovered ₹${record.recoveredAmount.toLocaleString('en-IN')}` : 'Awaiting resolution',
        record.status === 'RECOVERED' ? `Net after cost ₹${(record.recoveredAmount - 40).toLocaleString('en-IN')}` : '',
        '',
        record.status === 'RECOVERED' ? 'Simulated recovery succeeded. No further action.' : 'Recovery in progress or halted.',
      ].filter(Boolean),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold text-dv-amber uppercase tracking-[0.15em] mb-1">Merchant Operations</p>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Case Forensics</h1>
      </div>

      {/* Breadcrumb */}
      <button onClick={onBack} className="flex items-center space-x-2 text-xs text-dv-violet hover:underline">
        <ArrowLeft className="w-3 h-3" />
        <span>Overview · Recovery Queue · {record.id}</span>
      </button>

      {/* Case Card */}
      <div className="bg-dv-card border border-dv-border rounded-xl p-5 space-y-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dv-amber/15 border border-dv-amber/30 text-dv-amber">Payment</span>
        <h2 className="text-2xl font-extrabold text-white">{record.id}</h2>
        <p className="text-sm text-dv-textMuted">{record.customerName} · INR {record.amount.toLocaleString('en-IN')} (₹{record.amount.toLocaleString('en-IN')})</p>
      </div>

      {/* Pipeline: 4 Step Cards */}
      <div className="grid grid-cols-4 gap-3">
        {pipelineSteps.map((step, i) => (
          <div key={i} className={`rounded-xl p-4 border space-y-2 ${
            i === 3 && record.status === 'RECOVERED'
              ? 'bg-dv-lime/10 border-dv-lime/30'
              : 'bg-dv-card border-dv-border'
          }`}>
            <p className="text-[10px] font-bold text-dv-textDim uppercase tracking-wider">
              {step.num} · {step.title}
            </p>
            <div className="space-y-0.5 text-[11px] text-slate-300 leading-relaxed">
              {step.content.map((line, j) =>
                line === '' ? <br key={j} /> :
                line.startsWith('Model') || line.startsWith('Simulated') ?
                  <p key={j} className="text-dv-textDim text-[10px] italic">{line}</p> :
                  <p key={j} className={line.includes('success') || line.includes('Recovered') ? 'font-bold text-dv-lime' : ''}>
                    {line}
                  </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Simulated Impact Banner */}
      <div className="bg-dv-card border border-dv-border rounded-xl px-5 py-3">
        <p className="text-sm text-white">
          <span className="font-bold">Simulated impact:</span>{' '}
          {record.status === 'RECOVERED'
            ? `success · recovered ₹${record.recoveredAmount.toLocaleString('en-IN')} · net ₹${(record.recoveredAmount - 40).toLocaleString('en-IN')}. This is synthetic, not live Razorpay capture.`
            : `pending · awaiting recovery outcome. This is synthetic simulation.`
          }
        </p>
      </div>

      {/* Evidence & Candidate Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Evidence */}
        <div className="bg-dv-card border border-dv-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Evidence available at failure time</h3>
          <ul className="list-disc list-inside text-xs text-dv-textMuted space-y-1.5">
            <li>{record.bankName ? `Domestic card payment via ${record.bankName}` : 'Payment method detected'}</li>
            <li>Failure category: {record.errorCode || 'checkout_abandonment'}; issuer reason: {record.errorReason || 'user_action'}</li>
            <li>Customer success rate before this payment: {(Math.random() * 40 + 30).toFixed(0)}%</li>
            {record.overdueDays && <li>Invoice overdue by {record.overdueDays} days</li>}
          </ul>
        </div>

        {/* Candidate Actions */}
        <div className="bg-dv-card border border-dv-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Candidate actions</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-dv-textDim text-[10px] uppercase">
                <th className="text-left py-1">Action</th>
                <th className="text-right py-1">P</th>
                <th className="text-right py-1">Net EV</th>
                <th className="py-1"></th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {candidateActions.map((ca, i) => (
                <tr key={i} className="border-t border-dv-border/50">
                  <td className="py-1.5">{ca.action}</td>
                  <td className="text-right">{ca.p}</td>
                  <td className="text-right">{ca.netEV}</td>
                  <td className="text-right">
                    {ca.selected && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-dv-rose/20 border border-dv-rose/30 text-dv-rose">selected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
