export type RecoveryVector = 
  | 'PAYMENT_DEGRADATION'
  | 'CHECKOUT_ABANDONMENT'
  | 'FAILED_SUBSCRIPTION'
  | 'B2B_RECEIVABLES';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type WorkflowStatus = 
  | 'DETECTED'
  | 'DIAGNOSED'
  | 'INTERVENTION_QUEUED'
  | 'INTERVENTION_SENT'
  | 'PTP_REGISTERED' // Promise-to-Pay
  | 'RECOVERED'
  | 'HALTED_COMPLIANCE'
  | 'HALTED_OPT_OUT'
  | 'HALTED_MAX_ATTEMPTS'
  | 'HALTED_DISPUTE';

export interface AuditLogStep {
  id: string;
  timestamp: string;
  stage: 'DETECTION' | 'DIAGNOSIS' | 'COMPLIANCE' | 'INTERVENTION' | 'STOPPING_RULE' | 'OUTCOME';
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PromiseToPay {
  promisedDate: string;
  amount: number;
  channel: string;
  note: string;
  fulfilled: boolean;
}

export interface RevenueRecord {
  id: string;
  vector: RecoveryVector;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  currency: string;
  riskSeverity: RiskSeverity;
  status: WorkflowStatus;
  
  // Specific failure diagnostics
  errorCode?: string;
  errorReason?: string;
  bankName?: string;
  checkoutItem?: string;
  overdueDays?: number;
  subscriptionPlan?: string;
  
  // Interventions & Recovery
  recoveryChannel?: 'WHATSAPP' | 'HINGLISH_VOICE' | 'MANDATE_RETRY' | 'DYNAMIC_DISCOUNT_LINK';
  interventionsCount: number;
  maxInterventionsAllowed: number;
  recoveredAmount: number;
  discountPercentageOffered?: number;
  
  // Stopping rules & Compliance
  isOptedOut?: boolean;
  isDisputed?: boolean;
  stoppingReason?: string;
  promiseToPay?: PromiseToPay;
  
  auditTrail: AuditLogStep[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceConfig {
  quietHoursStart: string; // e.g. "21:00"
  quietHoursEnd: string;   // e.g. "09:00"
  maxNudgesPerRecord: number;
  enforceDND: boolean;
  requireHumanApprovalAbove: number; // ₹ limit
  autoStopOnOptOut: boolean;
}

export interface BatchMetrics {
  totalRecordsProcessed: number;
  totalRevenueAtRisk: number;
  totalMoneyRecovered: number;
  recoveryRatePercent: number;
  totalInterventionsSent: number;
  activePtpCount: number;
  complianceHalts: number;
  roiMultiplier: number;
  vectorBreakdown: Record<RecoveryVector, { atRisk: number; recovered: number; count: number }>;
}
