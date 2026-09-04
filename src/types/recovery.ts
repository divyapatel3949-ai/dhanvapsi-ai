export type RecoveryVector = 
  | 'PAYMENT_DEGRADATION'
  | 'CHECKOUT_ABANDONMENT'
  | 'FAILED_SUBSCRIPTION'
  | 'MANDATE_FAILURE'
  | 'B2B_RECEIVABLES';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type WorkflowStatus = 
  | 'DETECTED'
  | 'DIAGNOSED'
  | 'INTERVENTION_QUEUED'
  | 'INTERVENTION_SENT'
  | 'PTP_REGISTERED'
  | 'RECOVERED'
  | 'ESCALATED_HUMAN_REVIEW'
  | 'HALTED_COMPLIANCE'
  | 'HALTED_OPT_OUT'
  | 'HALTED_MAX_ATTEMPTS'
  | 'HALTED_DISPUTE';

export type RecoveryAction = 
  | 'RETRY_LATER'
  | 'SEND_RECOVERY_MESSAGE'
  | 'REQUEST_PAYMENT_UPDATE'
  | 'REQUEST_CUSTOMER_ACTION'
  | 'HUMAN_REVIEW'
  | 'STOP';

export interface AuditLogStep {
  id: string;
  timestamp: string;
  stage: 'DETECTION' | 'DIAGNOSIS' | 'COMPLIANCE' | 'INTERVENTION' | 'ESCALATION' | 'STOPPING_RULE' | 'OUTCOME';
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

export interface RecoveryGuardrails {
  maxPaymentRetries: number;
  maxRecoveryMessages: number;
  recoveryWindowHours: number;
  autoEscalation: boolean;
  customerOptOutStops: boolean;
  maxAutomatedAttempts: number;
  humanReviewThreshold: number; // INR amount
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
  
  // Failure diagnostics
  errorCode?: string;
  errorReason?: string;
  bankName?: string;
  checkoutItem?: string;
  overdueDays?: number;
  subscriptionPlan?: string;
  
  // AI Model outputs (populated by engine)
  recoveryProbability: number;
  expectedRecoverable: number;
  selectedAction: RecoveryAction;
  actionProbability: number;
  actionCost: number;
  netExpectedValue: number;
  
  // Interventions & Recovery
  recoveryChannel?: 'WHATSAPP' | 'HINGLISH_VOICE' | 'MANDATE_RETRY' | 'DYNAMIC_DISCOUNT_LINK' | 'EMAIL';
  interventionsCount: number;
  maxInterventionsAllowed: number;
  recoveredAmount: number;
  discountPercentageOffered?: number;
  
  // Stopping rules & Compliance
  isOptedOut?: boolean;
  isDisputed?: boolean;
  stoppingReason?: string;
  escalationReason?: string;
  promiseToPay?: PromiseToPay;
  
  auditTrail: AuditLogStep[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceConfig {
  quietHoursStart: string;
  quietHoursEnd: string;
  maxNudgesPerRecord: number;
  enforceDND: boolean;
  requireHumanApprovalAbove: number;
  autoStopOnOptOut: boolean;
}

export interface BatchMetrics {
  totalRecordsProcessed: number;
  totalRevenueAtRisk: number;
  totalMoneyRecovered: number;
  totalCost: number;
  totalNetRecovered: number;
  recoveryRatePercent: number;
  totalInterventionsSent: number;
  activePtpCount: number;
  complianceHalts: number;
  roiMultiplier: number;
  recoveredCount: number;
  failedCount: number;
  escalatedCount: number;
  stoppedCount: number;
  vectorBreakdown: Record<RecoveryVector, { atRisk: number; recovered: number; count: number }>;
}
