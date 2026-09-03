import { RevenueRecord, ComplianceConfig, AuditLogStep, BatchMetrics } from '../types/recovery';

export class AgentEngine {
  private complianceConfig: ComplianceConfig;

  constructor(config: ComplianceConfig) {
    this.complianceConfig = config;
  }

  public updateConfig(config: ComplianceConfig) {
    this.complianceConfig = config;
  }

  // Check if current time falls into quiet hours (e.g. 21:00 to 09:00)
  public isQuietHours(): boolean {
    const now = new Date();
    const currentHours = now.getHours();
    const [startH] = this.complianceConfig.quietHoursStart.split(':').map(Number);
    const [endH] = this.complianceConfig.quietHoursEnd.split(':').map(Number);

    if (startH > endH) {
      // Overnight range, e.g. 21:00 - 09:00
      return currentHours >= startH || currentHours < endH;
    } else {
      return currentHours >= startH && currentHours < endH;
    }
  }

  // Core Agent Step: Process a record through diagnosis, compliance check, and intervention
  public processRecord(record: RevenueRecord): RevenueRecord {
    const updated = { ...record, auditTrail: [...record.auditTrail] };
    const nowISO = new Date().toISOString();

    // 1. STOPPING RULES CHECK
    if (updated.isOptedOut && this.complianceConfig.autoStopOnOptOut) {
      updated.status = 'HALTED_OPT_OUT';
      updated.stoppingReason = 'Customer explicitly requested opt-out / DND';
      updated.auditTrail.push({
        id: `audit-${Date.now()}-stop-optout`,
        timestamp: nowISO,
        stage: 'STOPPING_RULE',
        title: 'Workflow Terminated: Opt-Out Received',
        description: 'Stopping rule triggered: DPDPA / RBI compliance halt due to user UNSUBSCRIBE request.'
      });
      return updated;
    }

    if (updated.isDisputed) {
      updated.status = 'HALTED_DISPUTE';
      updated.stoppingReason = 'Invoice or transaction dispute registered';
      updated.auditTrail.push({
        id: `audit-${Date.now()}-stop-dispute`,
        timestamp: nowISO,
        stage: 'STOPPING_RULE',
        title: 'Workflow Terminated: Payment Disputed',
        description: 'Stopping rule triggered: Customer raised chargeback/dispute. Escalating to support.'
      });
      return updated;
    }

    if (updated.interventionsCount >= this.complianceConfig.maxNudgesPerRecord) {
      updated.status = 'HALTED_MAX_ATTEMPTS';
      updated.stoppingReason = `Maximum contact limit (${this.complianceConfig.maxNudgesPerRecord}) reached`;
      updated.auditTrail.push({
        id: `audit-${Date.now()}-stop-max`,
        timestamp: nowISO,
        stage: 'STOPPING_RULE',
        title: 'Workflow Terminated: Max Nudge Cap',
        description: `Enforced compliance cap of ${this.complianceConfig.maxNudgesPerRecord} contact attempts to prevent spam.`
      });
      return updated;
    }

    if (updated.status === 'RECOVERED') {
      return updated; // Already recovered
    }

    // 2. COMPLIANCE CHECK (Quiet hours)
    if (this.isQuietHours()) {
      updated.status = 'HALTED_COMPLIANCE';
      updated.stoppingReason = `RBI Quiet Hours active (${this.complianceConfig.quietHoursStart} - ${this.complianceConfig.quietHoursEnd})`;
      updated.auditTrail.push({
        id: `audit-${Date.now()}-compliance-quiet`,
        timestamp: nowISO,
        stage: 'COMPLIANCE',
        title: 'Escalation Paused: Quiet Hours Active',
        description: `Automated recovery paused until ${this.complianceConfig.quietHoursEnd} in compliance with RBI customer protection directives.`
      });
      return updated;
    }

    // 3. DIAGNOSIS STAGE
    if (updated.status === 'DETECTED') {
      let diagnosis = '';
      if (updated.vector === 'PAYMENT_DEGRADATION') {
        diagnosis = `Root Cause: Bank gateway degradation on ${updated.bankName || 'Partner Bank'}. Recommendation: Smart Failover to alternative Razorpay UPI/Card route + Instant SMS Retry Link.`;
        updated.recoveryChannel = 'DYNAMIC_DISCOUNT_LINK';
      } else if (updated.vector === 'CHECKOUT_ABANDONMENT') {
        diagnosis = `Root Cause: Friction at checkout (Cart ₹${updated.amount.toLocaleString('en-IN')}). Recommendation: Send WhatsApp nudge with 5% Instant Discount Coupon link.`;
        updated.recoveryChannel = 'WHATSAPP';
      } else if (updated.vector === 'FAILED_SUBSCRIPTION') {
        diagnosis = `Root Cause: Auto-debit failed on ${updated.bankName || 'Card'}. Recommendation: Trigger Mandate Retry Sequencer at optimal 09:30 AM EOM salary window.`;
        updated.recoveryChannel = 'MANDATE_RETRY';
      } else if (updated.vector === 'B2B_RECEIVABLES') {
        diagnosis = `Root Cause: B2B Invoice overdue by ${updated.overdueDays || 7} days. Recommendation: Launch interactive Hinglish AI Voice Agent call to secure Promise-to-Pay (PTP).`;
        updated.recoveryChannel = 'HINGLISH_VOICE';
      }

      updated.status = 'DIAGNOSED';
      updated.auditTrail.push({
        id: `audit-${Date.now()}-diag`,
        timestamp: nowISO,
        stage: 'DIAGNOSIS',
        title: 'AI Root Cause Diagnosis Complete',
        description: diagnosis,
        metadata: { vector: updated.vector, errorCode: updated.errorCode }
      });
    }

    // 4. INTERVENTION STAGE
    if (updated.status === 'DIAGNOSED' || updated.status === 'INTERVENTION_QUEUED') {
      updated.interventionsCount += 1;
      updated.status = 'INTERVENTION_SENT';
      
      let actionTitle = '';
      let actionDesc = '';

      switch (updated.recoveryChannel) {
        case 'WHATSAPP':
          actionTitle = 'WhatsApp Dynamic Recovery Link Dispatched';
          actionDesc = `Sent tailored WhatsApp message with 1-click Razorpay checkout link (₹${updated.amount.toLocaleString('en-IN')}).`;
          break;
        case 'HINGLISH_VOICE':
          actionTitle = 'Hinglish AI Voice Recovery Call Initiated';
          actionDesc = `Initiated polite Hinglish conversational voice agent call to customer ${updated.customerPhone} regarding overdue invoice.`;
          break;
        case 'MANDATE_RETRY':
          actionTitle = 'Mandate Retry Sequencer Executed';
          actionDesc = `Scheduled smart auto-retry mandate queue attempt #1 targeting high-probability bank success window.`;
          break;
        case 'DYNAMIC_DISCOUNT_LINK':
        default:
          actionTitle = 'Razorpay Failover Payment Link Generated';
          actionDesc = `Dispatched instant SMS payment link via secondary payment gateway route.`;
          break;
      }

      updated.auditTrail.push({
        id: `audit-${Date.now()}-interv`,
        timestamp: nowISO,
        stage: 'INTERVENTION',
        title: actionTitle,
        description: actionDesc,
        metadata: { attempt: updated.interventionsCount, channel: updated.recoveryChannel }
      });

      // Simulation probability of immediate recovery or PTP
      const randomOutcome = Math.random();
      if (randomOutcome > 0.35) {
        // High success chance in simulation!
        updated.status = 'RECOVERED';
        updated.recoveredAmount = updated.amount;
        updated.updatedAt = nowISO;
        updated.auditTrail.push({
          id: `audit-${Date.now()}-outcome-success`,
          timestamp: nowISO,
          stage: 'OUTCOME',
          title: 'Money Recovered! (Webhook: order.paid)',
          description: `Successfully captured full payment of ₹${updated.amount.toLocaleString('en-IN')} via ${updated.recoveryChannel}. Revenue recovered!`
        });
      } else if (updated.vector === 'B2B_RECEIVABLES' && randomOutcome > 0.15) {
        // Register Promise-To-Pay
        updated.status = 'PTP_REGISTERED';
        const pDate = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
        updated.promiseToPay = {
          promisedDate: pDate,
          amount: updated.amount,
          channel: 'HINGLISH_VOICE',
          note: 'Customer agreed on voice call to settle payment by Friday morning.',
          fulfilled: false
        };
        updated.auditTrail.push({
          id: `audit-${Date.now()}-outcome-ptp`,
          timestamp: nowISO,
          stage: 'OUTCOME',
          title: 'Promise-to-Pay (PTP) Registered',
          description: `Customer committed to pay ₹${updated.amount.toLocaleString('en-IN')} on ${pDate}. Workflow paused until promise date.`
        });
      }
    }

    updated.updatedAt = nowISO;
    return updated;
  }

  // Calculate global metrics across a list of revenue records
  public calculateMetrics(records: RevenueRecord[]): BatchMetrics {
    let totalRevenueAtRisk = 0;
    let totalMoneyRecovered = 0;
    let totalInterventionsSent = 0;
    let activePtpCount = 0;
    let complianceHalts = 0;

    const vectorBreakdown: BatchMetrics['vectorBreakdown'] = {
      PAYMENT_DEGRADATION: { atRisk: 0, recovered: 0, count: 0 },
      CHECKOUT_ABANDONMENT: { atRisk: 0, recovered: 0, count: 0 },
      FAILED_SUBSCRIPTION: { atRisk: 0, recovered: 0, count: 0 },
      B2B_RECEIVABLES: { atRisk: 0, recovered: 0, count: 0 }
    };

    records.forEach(rec => {
      totalRevenueAtRisk += rec.amount;
      totalMoneyRecovered += rec.recoveredAmount;
      totalInterventionsSent += rec.interventionsCount;

      if (rec.status === 'PTP_REGISTERED') activePtpCount += 1;
      if (rec.status.startsWith('HALTED_')) complianceHalts += 1;

      if (vectorBreakdown[rec.vector]) {
        vectorBreakdown[rec.vector].atRisk += rec.amount;
        vectorBreakdown[rec.vector].recovered += rec.recoveredAmount;
        vectorBreakdown[rec.vector].count += 1;
      }
    });

    const recoveryRatePercent = totalRevenueAtRisk > 0 
      ? Number(((totalMoneyRecovered / totalRevenueAtRisk) * 100).toFixed(1)) 
      : 0;

    // ROI Multiplier: (Money Recovered / Simulated Intervention Cost @ ₹5 per nudge)
    const totalCost = Math.max(totalInterventionsSent * 5, 100);
    const roiMultiplier = Number((totalMoneyRecovered / totalCost).toFixed(1));

    return {
      totalRecordsProcessed: records.length,
      totalRevenueAtRisk,
      totalMoneyRecovered,
      recoveryRatePercent,
      totalInterventionsSent,
      activePtpCount,
      complianceHalts,
      roiMultiplier,
      vectorBreakdown
    };
  }
}
