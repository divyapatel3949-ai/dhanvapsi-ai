import { RevenueRecord, ComplianceConfig, RecoveryGuardrails, RecoveryVector, RiskSeverity, RecoveryAction } from '../types/recovery';

// Simple seeded PRNG (mulberry32)
function createSeededRandom(seed: number) {
  return function(): number {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const RECOVERY_GUARDRAILS: RecoveryGuardrails = {
  maxPaymentRetries: 3,
  maxRecoveryMessages: 2,
  recoveryWindowHours: 48,
  autoEscalation: true,
  customerOptOutStops: true,
  maxAutomatedAttempts: 3,
  humanReviewThreshold: 75000,
};

export const INITIAL_COMPLIANCE_CONFIG: ComplianceConfig = {
  quietHoursStart: "21:00",
  quietHoursEnd: "09:00",
  maxNudgesPerRecord: 3,
  enforceDND: true,
  requireHumanApprovalAbove: 75000,
  autoStopOnOptOut: true
};

// Deterministic recovery probability based on vector + severity + id hash
function calcRecoveryProbability(vector: RecoveryVector, severity: RiskSeverity, idHash: number): number {
  const baseP: Record<RecoveryVector, number> = {
    PAYMENT_DEGRADATION: 0.72,
    CHECKOUT_ABANDONMENT: 0.55,
    FAILED_SUBSCRIPTION: 0.65,
    MANDATE_FAILURE: 0.58,
    B2B_RECEIVABLES: 0.48,
  };
  const severityBonus: Record<RiskSeverity, number> = {
    LOW: 0.08,
    MEDIUM: 0.04,
    HIGH: -0.02,
    CRITICAL: -0.06,
  };
  return Math.min(0.95, Math.max(0.25, baseP[vector] + severityBonus[severity] + (idHash % 15) / 100));
}

function selectAction(vector: RecoveryVector, amount: number, severity: RiskSeverity): RecoveryAction {
  if (amount >= 75000 || (severity === 'CRITICAL' && amount > 40000)) return 'HUMAN_REVIEW';
  switch (vector) {
    case 'PAYMENT_DEGRADATION': return 'RETRY_LATER';
    case 'CHECKOUT_ABANDONMENT': return 'SEND_RECOVERY_MESSAGE';
    case 'FAILED_SUBSCRIPTION': return 'REQUEST_PAYMENT_UPDATE';
    case 'MANDATE_FAILURE': return 'REQUEST_PAYMENT_UPDATE';
    case 'B2B_RECEIVABLES': return amount > 30000 ? 'REQUEST_CUSTOMER_ACTION' : 'SEND_RECOVERY_MESSAGE';
  }
}

function getActionCost(action: RecoveryAction): number {
  const costs: Record<RecoveryAction, number> = {
    RETRY_LATER: 25,
    SEND_RECOVERY_MESSAGE: 40,
    REQUEST_PAYMENT_UPDATE: 80,
    REQUEST_CUSTOMER_ACTION: 60,
    HUMAN_REVIEW: 500,
    STOP: 0,
  };
  return costs[action];
}

function getActionProbability(action: RecoveryAction, idHash: number): number {
  const baseP: Record<RecoveryAction, number> = {
    RETRY_LATER: 0.78,
    SEND_RECOVERY_MESSAGE: 0.62,
    REQUEST_PAYMENT_UPDATE: 0.70,
    REQUEST_CUSTOMER_ACTION: 0.50,
    HUMAN_REVIEW: 0.65,
    STOP: 0,
  };
  return Math.min(0.95, baseP[action] + (idHash % 12) / 100);
}

export const INITIAL_REVENUE_RECORDS: RevenueRecord[] = [
  // 8 hand-crafted records covering all 5 vectors + special cases
  createHandcraftedRecord('RZP-PAY-88201', 'PAYMENT_DEGRADATION', 'Vikram Malhotra', '+91 98765 43210', 'vikram.m@techcorp.in', 14500, 'HIGH', 'BAD_REQUEST_PAYMENT_TIMED_OUT', 'HDFC Bank 3DS OTP Gateway Delay', 'HDFC Bank'),
  createHandcraftedRecord('RZP-INV-40912', 'B2B_RECEIVABLES', 'Apex Logistics India Pvt Ltd', '+91 98200 11223', 'finance@apexlogistics.co.in', 85000, 'CRITICAL', undefined, undefined, undefined, undefined, 14),
  createHandcraftedRecord('RZP-SUB-77319', 'FAILED_SUBSCRIPTION', 'Ananya Sharma', '+91 97112 88990', 'ananya.sharma@designhub.com', 2999, 'MEDIUM', 'SUBSCRIPTION_MANDATE_DECLINED', 'Insufficient funds on auto-debit date', 'ICICI Bank', 'SaaS Pro Monthly'),
  createHandcraftedRecord('RZP-CRT-55102', 'CHECKOUT_ABANDONMENT', 'Rahul Verma', '+91 99887 66554', 'rahul.v@gmail.com', 18499, 'HIGH', undefined, undefined, undefined, undefined, undefined, 'Ergonomic Mesh Chair & Desk Bundle'),
  createHandcraftedRecord('RZP-MND-60201', 'MANDATE_FAILURE', 'Priya Kulkarni', '+91 93456 78901', 'priya.k@finserv.in', 35000, 'HIGH', 'MANDATE_EXECUTION_FAILED', 'Auto-debit mandate rejected by bank', 'Kotak Mahindra', 'Enterprise License'),
  createHandcraftedRecord('RZP-INV-40915', 'B2B_RECEIVABLES', 'Kaur Retail Enterprise', '+91 98450 33441', 'accounts@kaurretail.in', 42000, 'MEDIUM', undefined, undefined, undefined, undefined, 7),
  createHandcraftedRecord('RZP-PAY-88209', 'PAYMENT_DEGRADATION', 'Pooja Hegde', '+91 91234 56789', 'pooja.h@yahoo.co.in', 6800, 'LOW', 'UPI_COLLECT_EXPIRED', 'User missed GPay UPI approve notification', 'Axis Bank'),
  // Special: opted-out customer (will trigger STOP)
  {
    ...createHandcraftedRecord('RZP-SUB-77325', 'FAILED_SUBSCRIPTION', 'Siddharth Rao', '+91 97441 22334', 'siddharth@cloudanalytics.io', 15999, 'CRITICAL', 'CARD_EXPIRED', 'Auto-debit mandate failed due to expired card', 'SBI', 'Enterprise Analytics'),
    isOptedOut: true, // This customer opted out — should trigger STOP
  },
];

function createHandcraftedRecord(
  id: string, vector: RecoveryVector, name: string, phone: string, email: string,
  amount: number, severity: RiskSeverity,
  errorCode?: string, errorReason?: string, bankName?: string,
  subscriptionPlan?: string, overdueDays?: number, checkoutItem?: string
): RevenueRecord {
  const idHash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const action = selectAction(vector, amount, severity);
  const recoveryP = calcRecoveryProbability(vector, severity, idHash);
  const actionP = getActionProbability(action, idHash);
  const expectedRecoverable = Math.round(amount * recoveryP);
  const actionCost = getActionCost(action);
  const netEV = Math.round(expectedRecoverable * actionP - actionCost);
  
  return {
    id,
    vector,
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    amount,
    currency: 'INR',
    riskSeverity: severity,
    status: 'DETECTED',
    errorCode,
    errorReason,
    bankName,
    checkoutItem,
    overdueDays,
    subscriptionPlan,
    recoveryProbability: recoveryP,
    expectedRecoverable,
    selectedAction: action,
    actionProbability: actionP,
    actionCost,
    netExpectedValue: netEV,
    interventionsCount: 0,
    maxInterventionsAllowed: 3,
    recoveredAmount: 0,
    auditTrail: [{
      id: `det-${id}`,
      timestamp: '2026-09-03T10:00:00Z',
      stage: 'DETECTION',
      title: `Revenue Leakage Detected (${vector.replace(/_/g, ' ').toLowerCase()})`,
      description: `Identified potential revenue loss of ₹${amount.toLocaleString('en-IN')}. ${errorReason || (overdueDays ? `Invoice ${overdueDays}d overdue` : checkoutItem ? `Cart: ${checkoutItem}` : 'Automated detection.')}`
    }],
    createdAt: '2026-09-03T10:00:00Z',
    updatedAt: '2026-09-03T10:00:00Z'
  };
}

// DETERMINISTIC synthetic batch generator
export function generateSyntheticBatch(count: number = 42): RevenueRecord[] {
  const rng = createSeededRandom(42_000);
  
  const names = [
    'Aarav Patel', 'Diya Kapoor', 'Kabir Mehta', 'Neha Gupta', 'Rohan Joshi',
    'Sanya Iyer', 'Arjun Reddy', 'Kavya Menon', 'Aditya Deshmukh', 'Tanya Bansal',
    'Deepak Sinha', 'Priya Singh', 'Amitabh Roy', 'Sneha Chawla', 'Tarun Bhatia',
    'Ritu Malhotra', 'Karan Thakur', 'Ishita Nair', 'Manish Agarwal', 'Simran Kaur'
  ];
  
  const vectors: RecoveryVector[] = [
    'PAYMENT_DEGRADATION', 'CHECKOUT_ABANDONMENT', 'FAILED_SUBSCRIPTION', 'MANDATE_FAILURE', 'B2B_RECEIVABLES'
  ];
  
  const errorCodes = [
    'BAD_REQUEST_PAYMENT_TIMED_OUT', 'GATEWAY_DOWNTIME', 'INSUFFICIENT_FUNDS',
    'UPI_TRANSACTION_LIMIT_EXCEEDED', 'SUBSCRIPTION_MANDATE_DECLINED', 'CARD_EXPIRED',
    'BANK_SERVER_DOWN', 'NETBANKING_TIMEOUT'
  ];
  
  const errorReasons = [
    'Bank gateway timeout during 3DS verification',
    'Payment gateway returned 502',
    'Insufficient funds in customer account', 
    'UPI daily transaction limit exceeded',
    'Mandate execution rejected by issuer bank',
    'Card expired, auto-debit declined',
    'Bank server unavailable during processing',
    'Netbanking session timed out'
  ];
  
  const banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra', 'PNB', 'Yes Bank', 'IndusInd Bank'];
  
  const items = [
    'Enterprise Cloud Storage Annual', 'Premium Audio Headphones', 'B2B SaaS License Tier 2',
    'Smart Home Security Kit', 'Co-Working Space Monthly', 'Digital Marketing Suite',
    'AI Analytics Pro Plan', 'E-commerce Shipping Bundle'
  ];
  
  const results: RevenueRecord[] = [];
  
  for (let idx = 0; idx < count; idx++) {
    const vector = vectors[idx % vectors.length];
    const name = names[idx % names.length];
    const amount = Math.floor(rng() * 42000) + 2500;
    const severity: RiskSeverity = amount > 30000 ? 'CRITICAL' : amount > 15000 ? 'HIGH' : amount > 7000 ? 'MEDIUM' : 'LOW';
    const bank = banks[idx % banks.length];
    const errIdx = idx % errorCodes.length;
    
    // Some records have special flags for demo variety
    const isOptedOut = idx === 37; // One customer opted out
    const isDisputed = idx === 28; // One customer disputed
    const overInterventions = idx === 19; // One hit max attempts
    
    const id = `RZP-BAT-${1000 + idx}`;
    const idHash = id.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    const action = selectAction(vector, amount, severity);
    const recoveryP = calcRecoveryProbability(vector, severity, idHash);
    const actionP = getActionProbability(action, idHash);
    const expectedRecoverable = Math.round(amount * recoveryP);
    const actionCost = getActionCost(action);
    const netEV = Math.round(expectedRecoverable * actionP - actionCost);
    
    results.push({
      id,
      vector,
      customerName: name,
      customerPhone: `+91 98${String(10000000 + Math.floor(rng() * 90000000)).slice(0, 8)}`,
      customerEmail: `${name.toLowerCase().replace(' ', '.')}@example.in`,
      amount,
      currency: 'INR',
      riskSeverity: severity,
      status: 'DETECTED',
      errorCode: errorCodes[errIdx],
      errorReason: errorReasons[errIdx],
      bankName: bank,
      checkoutItem: vector === 'CHECKOUT_ABANDONMENT' ? items[idx % items.length] : undefined,
      subscriptionPlan: vector === 'FAILED_SUBSCRIPTION' || vector === 'MANDATE_FAILURE' ? items[idx % items.length] : undefined,
      overdueDays: vector === 'B2B_RECEIVABLES' ? Math.floor(rng() * 18) + 3 : undefined,
      recoveryProbability: recoveryP,
      expectedRecoverable,
      selectedAction: action,
      actionProbability: actionP,
      actionCost,
      netExpectedValue: netEV,
      interventionsCount: overInterventions ? 3 : 0, // One record already at max
      maxInterventionsAllowed: 3,
      recoveredAmount: 0,
      isOptedOut,
      isDisputed,
      auditTrail: [{
        id: `det-${id}`,
        timestamp: '2026-09-03T10:00:00Z',
        stage: 'DETECTION',
        title: `Automated Leakage Detection (${vector.replace(/_/g, ' ').toLowerCase()})`,
        description: `Identified potential revenue loss of ₹${amount.toLocaleString('en-IN')}. ${errorReasons[errIdx]}.`
      }],
      createdAt: '2026-09-03T10:00:00Z',
      updatedAt: '2026-09-03T10:00:00Z'
    });
  }
  
  return results;
}
