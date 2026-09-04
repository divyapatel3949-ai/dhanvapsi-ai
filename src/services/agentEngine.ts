import { RevenueRecord, ComplianceConfig, AuditLogStep, BatchMetrics, RecoveryAction, RecoveryGuardrails } from '../types/recovery';
import { RECOVERY_GUARDRAILS } from './mockData';

// Deterministic seeded PRNG
function createSeededRandom(seed: number) {
  return function(): number {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export class AgentEngine {
  private complianceConfig: ComplianceConfig;
  private guardrails: RecoveryGuardrails;
  private rng: () => number;
  private processedCount: number = 0;

  constructor(config: ComplianceConfig) {
    this.complianceConfig = config;
    this.guardrails = RECOVERY_GUARDRAILS;
    this.rng = createSeededRandom(12345); // Fixed seed for deterministic simulation
  }

  public resetSimulation() {
    this.rng = createSeededRandom(12345);
    this.processedCount = 0;
  }

  public processRecord(record: RevenueRecord): RevenueRecord {
    const updated = { ...record, auditTrail: [...record.auditTrail] };
    const nowISO = new Date().toISOString();
    this.processedCount++;

    // Already terminal
    if (updated.status === 'RECOVERED' || updated.status === 'ESCALATED_HUMAN_REVIEW' || 
        updated.status.startsWith('HALTED_')) {
      return updated;
    }

    // ─── STOPPING RULES ─────────────────────────────────────
    if (updated.isOptedOut && this.complianceConfig.autoStopOnOptOut) {
      updated.status = 'HALTED_OPT_OUT';
      updated.stoppingReason = 'Customer explicitly opted out (DPDPA compliance)';
      updated.auditTrail.push({
        id: `stop-optout-${updated.id}`, timestamp: nowISO, stage: 'STOPPING_RULE',
        title: 'Recovery Stopped: Customer Opt-Out',
        description: 'Customer has opted out of recovery communications. All automated outreach halted per DPDPA compliance.',
        metadata: { rule: 'OPT_OUT', guardrail: 'customerOptOutStops' }
      });
      updated.updatedAt = nowISO;
      return updated;
    }

    if (updated.isDisputed) {
      updated.status = 'HALTED_DISPUTE';
      updated.stoppingReason = 'Payment dispute/chargeback registered';
      updated.auditTrail.push({
        id: `stop-dispute-${updated.id}`, timestamp: nowISO, stage: 'STOPPING_RULE',
        title: 'Recovery Stopped: Dispute Filed',
        description: 'Customer raised a payment dispute. Recovery workflow terminated and case flagged for review.',
        metadata: { rule: 'DISPUTE' }
      });
      updated.updatedAt = nowISO;
      return updated;
    }

    if (updated.interventionsCount >= this.guardrails.maxAutomatedAttempts) {
      updated.status = 'HALTED_MAX_ATTEMPTS';
      updated.stoppingReason = `Maximum automated attempts (${this.guardrails.maxAutomatedAttempts}) reached`;
      updated.auditTrail.push({
        id: `stop-max-${updated.id}`, timestamp: nowISO, stage: 'STOPPING_RULE',
        title: 'Recovery Stopped: Max Attempts Reached',
        description: `Automated recovery limit of ${this.guardrails.maxAutomatedAttempts} attempts reached. No further automated contact permitted.`,
        metadata: { rule: 'MAX_ATTEMPTS', limit: this.guardrails.maxAutomatedAttempts }
      });
      updated.updatedAt = nowISO;
      return updated;
    }

    // ─── DIAGNOSIS ─────────────────────────────────────────
    let diagnosis = '';
    let channel: RevenueRecord['recoveryChannel'] = 'DYNAMIC_DISCOUNT_LINK';
    
    switch (updated.vector) {
      case 'PAYMENT_DEGRADATION':
        diagnosis = `Root cause: ${updated.errorReason || 'Bank gateway failure'}. Recommendation: Smart failover payment link via alternative route.`;
        channel = 'DYNAMIC_DISCOUNT_LINK';
        break;
      case 'CHECKOUT_ABANDONMENT':
        diagnosis = `Root cause: Cart abandonment (₹${updated.amount.toLocaleString('en-IN')}). Recommendation: WhatsApp recovery nudge with incentive.`;
        channel = 'WHATSAPP';
        break;
      case 'FAILED_SUBSCRIPTION':
        diagnosis = `Root cause: ${updated.errorReason || 'Subscription mandate declined'}. Recommendation: Mandate retry at optimal window.`;
        channel = 'MANDATE_RETRY';
        break;
      case 'MANDATE_FAILURE':
        diagnosis = `Root cause: ${updated.errorReason || 'Mandate execution failed'}. Recommendation: Request payment method update.`;
        channel = 'EMAIL';
        break;
      case 'B2B_RECEIVABLES':
        diagnosis = `Root cause: Invoice overdue by ${updated.overdueDays || '?'} days. Recommendation: Recovery outreach via voice/message.`;
        channel = updated.amount > 30000 ? 'HINGLISH_VOICE' : 'WHATSAPP';
        break;
    }

    updated.recoveryChannel = channel;
    updated.status = 'DIAGNOSED';
    updated.auditTrail.push({
      id: `diag-${updated.id}`, timestamp: nowISO, stage: 'DIAGNOSIS',
      title: 'AI Root Cause Diagnosis',
      description: diagnosis,
      metadata: { vector: updated.vector, errorCode: updated.errorCode, recoveryProbability: updated.recoveryProbability }
    });

    // ─── COMPLIANCE CHECK ─────────────────────────────────
    updated.auditTrail.push({
      id: `comp-${updated.id}`, timestamp: nowISO, stage: 'COMPLIANCE',
      title: 'Compliance & Policy Check Passed',
      description: `Action ${updated.selectedAction.replace(/_/g, ' ')} is within policy-allowed actions. RBI quiet hours and DPDPA rules verified.`,
      metadata: { selectedAction: updated.selectedAction, policyStatus: 'ALLOWED', quietHoursChecked: true, dpdpaChecked: true }
    });

    // ─── ESCALATION CHECK ─────────────────────────────────
    if (updated.selectedAction === 'HUMAN_REVIEW' || 
        (updated.amount >= this.guardrails.humanReviewThreshold && this.guardrails.autoEscalation)) {
      updated.status = 'ESCALATED_HUMAN_REVIEW';
      updated.escalationReason = updated.amount >= this.guardrails.humanReviewThreshold 
        ? `Transaction amount ₹${updated.amount.toLocaleString('en-IN')} exceeds human review threshold of ₹${this.guardrails.humanReviewThreshold.toLocaleString('en-IN')}`
        : 'AI model selected HUMAN_REVIEW as optimal action for this risk profile';
      updated.interventionsCount += 1;
      updated.auditTrail.push({
        id: `esc-${updated.id}`, timestamp: nowISO, stage: 'ESCALATION',
        title: 'Escalated to Human Review',
        description: updated.escalationReason,
        metadata: { reason: updated.escalationReason, amount: updated.amount, threshold: this.guardrails.humanReviewThreshold }
      });
      updated.updatedAt = nowISO;
      return updated;
    }

    // ─── INTERVENTION ─────────────────────────────────────
    updated.interventionsCount += 1;
    updated.status = 'INTERVENTION_SENT';
    
    const actionLabel = updated.selectedAction.replace(/_/g, ' ');
    updated.auditTrail.push({
      id: `intv-${updated.id}`, timestamp: nowISO, stage: 'INTERVENTION',
      title: `Recovery Action Executed: ${actionLabel}`,
      description: `${actionLabel} dispatched via ${channel}. Attempt #${updated.interventionsCount} of ${this.guardrails.maxAutomatedAttempts} max.`,
      metadata: { attempt: updated.interventionsCount, channel, action: updated.selectedAction, cost: updated.actionCost }
    });

    // ─── SIMULATED OUTCOME (deterministic) ─────────────────
    const outcomeRoll = this.rng();
    const successThreshold = updated.recoveryProbability * updated.actionProbability;
    
    if (outcomeRoll < successThreshold) {
      // SUCCESS
      updated.status = 'RECOVERED';
      updated.recoveredAmount = updated.amount;
      updated.auditTrail.push({
        id: `out-${updated.id}`, timestamp: nowISO, stage: 'OUTCOME',
        title: 'Recovery Successful',
        description: `Simulated payment of ₹${updated.amount.toLocaleString('en-IN')} captured via ${channel}. Revenue recovered.`,
        metadata: { result: 'SUCCESS', recoveredAmount: updated.amount, cost: updated.actionCost }
      });
    } else if (outcomeRoll < successThreshold + 0.15 && updated.vector === 'B2B_RECEIVABLES') {
      // PTP for B2B
      updated.status = 'PTP_REGISTERED';
      const pDate = '2026-09-06';
      updated.promiseToPay = { promisedDate: pDate, amount: updated.amount, channel: channel || 'WHATSAPP', note: 'Customer committed to pay by Friday.', fulfilled: false };
      updated.auditTrail.push({
        id: `out-${updated.id}`, timestamp: nowISO, stage: 'OUTCOME',
        title: 'Promise-to-Pay Registered',
        description: `Customer committed to pay ₹${updated.amount.toLocaleString('en-IN')} by ${pDate}. Recovery paused until promise date.`,
        metadata: { result: 'PTP', promiseDate: pDate }
      });
    } else {
      // FAILED - recovery attempt did not succeed
      updated.auditTrail.push({
        id: `out-${updated.id}`, timestamp: nowISO, stage: 'OUTCOME',
        title: 'Recovery Attempt Failed',
        description: `Simulated recovery attempt did not result in payment capture. Customer did not respond to ${actionLabel}.`,
        metadata: { result: 'FAILED', action: updated.selectedAction }
      });
      // Status stays INTERVENTION_SENT (not terminal — would retry in real system)
    }

    updated.updatedAt = nowISO;
    return updated;
  }

  public calculateMetrics(records: RevenueRecord[]): BatchMetrics {
    let totalRevenueAtRisk = 0;
    let totalMoneyRecovered = 0;
    let totalInterventionsSent = 0;
    let totalCost = 0;
    let activePtpCount = 0;
    let complianceHalts = 0;
    let recoveredCount = 0;
    let failedCount = 0;
    let escalatedCount = 0;
    let stoppedCount = 0;

    const vectorBreakdown: BatchMetrics['vectorBreakdown'] = {
      PAYMENT_DEGRADATION: { atRisk: 0, recovered: 0, count: 0 },
      CHECKOUT_ABANDONMENT: { atRisk: 0, recovered: 0, count: 0 },
      FAILED_SUBSCRIPTION: { atRisk: 0, recovered: 0, count: 0 },
      MANDATE_FAILURE: { atRisk: 0, recovered: 0, count: 0 },
      B2B_RECEIVABLES: { atRisk: 0, recovered: 0, count: 0 },
    };

    records.forEach(rec => {
      totalRevenueAtRisk += rec.amount;
      totalMoneyRecovered += rec.recoveredAmount;
      totalInterventionsSent += rec.interventionsCount;
      totalCost += rec.interventionsCount > 0 ? rec.actionCost : 0;

      if (rec.status === 'RECOVERED') recoveredCount++;
      else if (rec.status === 'ESCALATED_HUMAN_REVIEW') escalatedCount++;
      else if (rec.status.startsWith('HALTED_')) { stoppedCount++; complianceHalts++; }
      else if (rec.status === 'PTP_REGISTERED') activePtpCount++;
      else if (rec.status === 'INTERVENTION_SENT') failedCount++;
      // DETECTED = not yet processed

      if (vectorBreakdown[rec.vector]) {
        vectorBreakdown[rec.vector].atRisk += rec.amount;
        vectorBreakdown[rec.vector].recovered += rec.recoveredAmount;
        vectorBreakdown[rec.vector].count += 1;
      }
    });

    const totalNetRecovered = totalMoneyRecovered - totalCost;
    const processedCount = recoveredCount + failedCount + escalatedCount + stoppedCount + activePtpCount;
    const recoveryRatePercent = processedCount > 0 
      ? Number(((recoveredCount / processedCount) * 100).toFixed(1)) 
      : 0;
    const roiMultiplier = totalCost > 0 ? Number((totalMoneyRecovered / totalCost).toFixed(1)) : 0;

    return {
      totalRecordsProcessed: records.length,
      totalRevenueAtRisk,
      totalMoneyRecovered,
      totalCost,
      totalNetRecovered,
      recoveryRatePercent,
      totalInterventionsSent,
      activePtpCount,
      complianceHalts,
      roiMultiplier,
      recoveredCount,
      failedCount,
      escalatedCount,
      stoppedCount,
      vectorBreakdown
    };
  }
}
