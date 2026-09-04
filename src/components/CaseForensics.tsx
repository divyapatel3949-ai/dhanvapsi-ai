import React from 'react';
import { RevenueRecord, RecoveryAction } from '../types/recovery';
import { ArrowLeft } from 'lucide-react';
import { RECOVERY_GUARDRAILS } from '../services/mockData';

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

  const actionLabel = record.selectedAction.replace(/_/g, ' ');

  const getStatusText = (): string => {
    if (record.status === 'RECOVERED') return 'success';
    if (record.status === 'ESCALATED_HUMAN_REVIEW') return 'escalated';
    if (record.status.startsWith('HALTED_')) return 'stopped';
    if (record.status === 'INTERVENTION_SENT') return 'failed';
    return 'pending';
  };

  // Deterministic customer success rate from id hash
  const idHash = record.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const customerSuccessRate = 30 + (idHash % 40);

  const allActions: RecoveryAction[] = ['RETRY_LATER', 'SEND_RECOVERY_MESSAGE', 'REQUEST_PAYMENT_UPDATE', 'REQUEST_CUSTOMER_ACTION', 'HUMAN_REVIEW', 'STOP'];

  const getActionNetEV = (action: RecoveryAction): number => {
    if (action === 'STOP') return 0;
    const basePMap: Record<RecoveryAction, number> = {
      RETRY_LATER: 0.78, SEND_RECOVERY_MESSAGE: 0.62, REQUEST_PAYMENT_UPDATE: 0.70,
      REQUEST_CUSTOMER_ACTION: 0.50, HUMAN_REVIEW: 0.65, STOP: 0,
    };
    const costMap: Record<RecoveryAction, number> = {
      RETRY_LATER: 25, SEND_RECOVERY_MESSAGE: 40, REQUEST_PAYMENT_UPDATE: 80,
      REQUEST_CUSTOMER_ACTION: 60, HUMAN_REVIEW: 500, STOP: 0,
    };
    const p = Math.min(0.95, basePMap[action] + (idHash % 12) / 100);
    return Math.round(record.expectedRecoverable * p - costMap[action]);
  };

  const pipelineSteps = [
    {
      num: '1', title: 'Observed Razorpay Data',
      content: [
        record.customerName,
        record.customerEmail,
        `INR ${record.amount.toLocaleString('en-IN')}`,
        record.bankName ? `${record.bankName} · Card/UPI` : 'Payment method detected',
        `Failed: ${record.errorReason || record.checkoutItem || `${record.overdueDays}d overdue`}`,
        record.errorCode ? `Error: ${record.errorCode}` : '',
      ].filter(Boolean),
    },
    {
      num: '2', title: 'DhanVapsi Model Prediction',
      content: [
        `Recovery probability: ${(record.recoveryProbability * 100).toFixed(1)}%`,
        `Expected recoverable: ₹${record.expectedRecoverable.toLocaleString('en-IN')}`,
        `Best action: ${actionLabel}`,
        `Action success P: ${(record.actionProbability * 100).toFixed(1)}%`,
        `Net expected: ₹${record.netExpectedValue.toLocaleString('en-IN')}`,
        '',
        'Model 1 estimates recovery probability.',
        'Model 2 estimates P(success) per action.',
      ],
    },
    {
      num: '3', title: 'DhanVapsi Policy Decision',
      content: [
        `Selected action: ${actionLabel}`,
        `Policy-allowed actions: ${allActions.filter(a => a !== 'STOP').map(a => a.replace(/_/g, ' ')).join(', ')}`,
        '',
        record.selectedAction === 'HUMAN_REVIEW'
          ? 'Escalated: amount exceeds human review threshold or high-risk profile.'
          : 'Model selection is within the allowed action list. Policy check passed.',
      ],
    },
    {
      num: '4', title: 'Simulated Outcome',
      content: [
        `Result: ${getStatusText()}`,
        record.status === 'RECOVERED' ? `Recovered ₹${record.recoveredAmount.toLocaleString('en-IN')}` :
        record.status === 'ESCALATED_HUMAN_REVIEW' ? `Escalated: ${record.escalationReason || 'Sent to human review'}` :
        record.status.startsWith('HALTED_') ? `Stopped: ${record.stoppingReason || 'Guardrail triggered'}` :
        record.status === 'INTERVENTION_SENT' ? 'Recovery attempt did not result in payment capture.' :
        'Awaiting batch recovery execution.',
        record.status === 'RECOVERED' ? `Net after cost: ₹${(record.recoveredAmount - record.actionCost).toLocaleString('en-IN')}` : '',
        '',
        record.status === 'RECOVERED' ? 'Simulated recovery succeeded. No further action.' :
        record.status === 'ESCALATED_HUMAN_REVIEW' ? 'Case requires manual human review.' :
        record.status.startsWith('HALTED_') ? 'Recovery workflow terminated by guardrail.' :
        'Synthetic simulation — no real payment processed.',
      ].filter(Boolean),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold text-dv-amber uppercase tracking-[0.15em] mb-1">Merchant Operations</p>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Case Forensics</h1>
      </div>

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

      {/* 4-Step Pipeline */}
      <div className="grid grid-cols-4 gap-3">
        {pipelineSteps.map((step, i) => (
          <div key={i} className={`rounded-xl p-4 border space-y-2 ${
            i === 3 && record.status === 'RECOVERED' ? 'bg-dv-lime/10 border-dv-lime/30' :
            i === 3 && record.status === 'ESCALATED_HUMAN_REVIEW' ? 'bg-dv-amber/10 border-dv-amber/30' :
            i === 3 && record.status.startsWith('HALTED_') ? 'bg-dv-rose/10 border-dv-rose/30' :
            'bg-dv-card border-dv-border'
          }`}>
            <p className="text-[10px] font-bold text-dv-textDim uppercase tracking-wider">{step.num} · {step.title}</p>
            <div className="space-y-0.5 text-[11px] text-slate-300 leading-relaxed">
              {step.content.map((line, j) =>
                line === '' ? <br key={j} /> :
                line.startsWith('Model') || line.startsWith('Synthetic') || line.startsWith('Simulated recovery') || line.startsWith('Case requires') || line.startsWith('Recovery workflow') ?
                  <p key={j} className="text-dv-textDim text-[10px] italic">{line}</p> :
                  <p key={j} className={
                    line.includes('success') || line.includes('Recovered') ? 'font-bold text-dv-lime' :
                    line.includes('escalated') || line.includes('Escalated') ? 'font-bold text-dv-amber' :
                    line.includes('stopped') || line.includes('Stopped') ? 'font-bold text-dv-rose' : ''
                  }>{line}</p>
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
            ? `success · recovered ₹${record.recoveredAmount.toLocaleString('en-IN')} · net ₹${(record.recoveredAmount - record.actionCost).toLocaleString('en-IN')}. This is synthetic, not live Razorpay capture.`
            : record.status === 'ESCALATED_HUMAN_REVIEW'
            ? `escalated · sent to human review. ${record.escalationReason || ''}`
            : record.status.startsWith('HALTED_')
            ? `stopped · ${record.stoppingReason || 'Guardrail triggered'}. No further automated action.`
            : record.status === 'INTERVENTION_SENT'
            ? `failed · recovery attempt did not capture payment. This is synthetic simulation.`
            : `pending · awaiting batch recovery execution. This is synthetic simulation.`
          }
        </p>
      </div>

      {/* Why This Action + Evidence + Candidate Actions */}
      <div className="grid grid-cols-3 gap-4">
        {/* Why This Action */}
        <div className="bg-dv-card border border-dv-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Why DhanVapsi chose this action</h3>
          <ul className="list-disc list-inside text-xs text-dv-textMuted space-y-1.5">
            <li>Transaction amount: ₹{record.amount.toLocaleString('en-IN')}</li>
            <li>Failure type: {record.vector.replace(/_/g, ' ').toLowerCase()}</li>
            <li>Previous customer success rate: {customerSuccessRate}%</li>
            <li>Recovery probability: {(record.recoveryProbability * 100).toFixed(1)}%</li>
            <li>Expected recoverable: ₹{record.expectedRecoverable.toLocaleString('en-IN')}</li>
            <li>Alternative actions had lower expected net value</li>
            <li>Selected action is within recovery policy</li>
            {record.amount >= RECOVERY_GUARDRAILS.humanReviewThreshold && (
              <li className="text-dv-amber">Amount exceeds ₹{RECOVERY_GUARDRAILS.humanReviewThreshold.toLocaleString('en-IN')} → escalated to human review</li>
            )}
          </ul>
          <div className="border-t border-dv-border pt-2">
            <p className="text-xs text-white font-bold">Decision: <span className="text-dv-violet">{actionLabel}</span></p>
          </div>
        </div>

        {/* Evidence */}
        <div className="bg-dv-card border border-dv-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Evidence at failure time</h3>
          <ul className="list-disc list-inside text-xs text-dv-textMuted space-y-1.5">
            <li>{record.bankName ? `Payment via ${record.bankName}` : 'Payment method detected'}</li>
            <li>Failure: {record.errorCode || 'checkout_abandonment'}; reason: {record.errorReason || 'user_action'}</li>
            <li>Customer success rate: {customerSuccessRate}%</li>
            {record.overdueDays && <li>Invoice overdue by {record.overdueDays} days</li>}
            {record.checkoutItem && <li>Cart item: {record.checkoutItem}</li>}
            {record.subscriptionPlan && <li>Plan: {record.subscriptionPlan}</li>}
          </ul>
        </div>

        {/* Candidate Actions */}
        <div className="bg-dv-card border border-dv-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Candidate actions</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-dv-textDim text-[10px] uppercase">
                <th className="text-left py-1">Action</th>
                <th className="text-right py-1">Net EV</th>
                <th className="py-1"></th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {allActions.map(action => (
                <tr key={action} className="border-t border-dv-border/50">
                  <td className="py-1.5">{action.replace(/_/g, ' ')}</td>
                  <td className="text-right">₹{getActionNetEV(action).toLocaleString('en-IN')}</td>
                  <td className="text-right">
                    {action === record.selectedAction && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-dv-violet/20 border border-dv-violet/30 text-dv-violet">selected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail Timeline */}
      {record.auditTrail.length > 1 && (
        <div className="bg-dv-card border border-dv-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Audit Trail</h3>
          <div className="space-y-3">
            {record.auditTrail.map((step, i) => (
              <div key={step.id} className="flex items-start space-x-3 text-xs">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  step.stage === 'OUTCOME' && record.status === 'RECOVERED' ? 'bg-dv-lime' :
                  step.stage === 'STOPPING_RULE' ? 'bg-dv-rose' :
                  step.stage === 'ESCALATION' ? 'bg-dv-amber' :
                  'bg-dv-violet'
                }`} />
                <div className="flex-1 border-b border-dv-border/30 pb-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{step.title}</p>
                    <span className="text-[10px] text-dv-textDim font-mono">{step.stage}</span>
                  </div>
                  <p className="text-dv-textMuted mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
