import { RevenueRecord, ComplianceConfig } from '../types/recovery';

export const INITIAL_COMPLIANCE_CONFIG: ComplianceConfig = {
  quietHoursStart: "21:00",
  quietHoursEnd: "09:00",
  maxNudgesPerRecord: 3,
  enforceDND: true,
  requireHumanApprovalAbove: 100000, // ₹1,00,000
  autoStopOnOptOut: true
};

export const INITIAL_REVENUE_RECORDS: RevenueRecord[] = [
  {
    id: "RZP-PAY-88201",
    vector: "PAYMENT_DEGRADATION",
    customerName: "Vikram Malhotra",
    customerPhone: "+91 98765 43210",
    customerEmail: "vikram.m@techcorp.in",
    amount: 14500,
    currency: "INR",
    riskSeverity: "HIGH",
    status: "DETECTED",
    errorCode: "BAD_REQUEST_PAYMENT_TIMED_OUT",
    errorReason: "HDFC Bank 3DS OTP Gateway Delay (Downtime detected)",
    bankName: "HDFC Bank",
    interventionsCount: 0,
    maxInterventionsAllowed: 3,
    recoveredAmount: 0,
    auditTrail: [
      {
        id: "step-1",
        timestamp: "2026-09-02T16:30:00Z",
        stage: "DETECTION",
        title: "Razorpay Webhook: payment.failed",
        description: "Payment failure captured for order #ORD-9901 (₹14,500). Error Code: BAD_REQUEST_PAYMENT_TIMED_OUT."
      }
    ],
    createdAt: "2026-09-02T16:30:00Z",
    updatedAt: "2026-09-02T16:30:00Z"
  },
  {
    id: "RZP-INV-40912",
    vector: "B2B_RECEIVABLES",
    customerName: "Apex Logistics India Pvt Ltd",
    customerPhone: "+91 98200 11223",
    customerEmail: "finance@apexlogistics.co.in",
    amount: 85000,
    currency: "INR",
    riskSeverity: "CRITICAL",
    status: "DETECTED",
    overdueDays: 14,
    interventionsCount: 0,
    maxInterventionsAllowed: 3,
    recoveredAmount: 0,
    auditTrail: [
      {
        id: "step-1",
        timestamp: "2026-09-02T10:00:00Z",
        stage: "DETECTION",
        title: "Invoice Overdue Detector",
        description: "Invoice #INV-40912 reached 14 days past due date. Total outstanding balance ₹85,000."
      }
    ],
    createdAt: "2026-09-02T10:00:00Z",
    updatedAt: "2026-09-02T10:00:00Z"
  },
  {
    id: "RZP-SUB-77319",
    vector: "FAILED_SUBSCRIPTION",
    customerName: "Ananya Sharma",
    customerPhone: "+91 97112 88990",
    customerEmail: "ananya.sharma@designhub.com",
    amount: 2999,
    currency: "INR",
    riskSeverity: "MEDIUM",
    status: "DETECTED",
    errorCode: "SUBSCRIPTION_MANDATE_DECLINED",
    errorReason: "Insufficient funds on auto-debit date (End of Month)",
    subscriptionPlan: "SaaS Pro Monthly Membership",
    bankName: "ICICI Bank",
    interventionsCount: 0,
    maxInterventionsAllowed: 3,
    recoveredAmount: 0,
    auditTrail: [
      {
        id: "step-1",
        timestamp: "2026-09-01T08:15:00Z",
        stage: "DETECTION",
        title: "Mandate Execution Failed",
        description: "Recurring mandate ₹2,999 failed on ICICI Bank card ending in 4092."
      }
    ],
    createdAt: "2026-09-01T08:15:00Z",
    updatedAt: "2026-09-01T08:15:00Z"
  },
  {
    id: "RZP-CRT-55102",
    vector: "CHECKOUT_ABANDONMENT",
    customerName: "Rahul Verma",
    customerPhone: "+91 99887 66554",
    customerEmail: "rahul.v@gmail.com",
    amount: 18499,
    currency: "INR",
    riskSeverity: "HIGH",
    status: "DETECTED",
    checkoutItem: "Ergonomic Mesh Chair & Desk Bundle",
    interventionsCount: 0,
    maxInterventionsAllowed: 3,
    recoveredAmount: 0,
    discountPercentageOffered: 5,
    auditTrail: [
      {
        id: "step-1",
        timestamp: "2026-09-02T15:45:00Z",
        stage: "DETECTION",
        title: "Checkout Drop-off Event",
        description: "Customer abandoned checkout at payment review step (Cart value ₹18,499)."
      }
    ],
    createdAt: "2026-09-02T15:45:00Z",
    updatedAt: "2026-09-02T15:45:00Z"
  },
  {
    id: "RZP-INV-40915",
    vector: "B2B_RECEIVABLES",
    customerName: "Kaur Retail Enterprise",
    customerPhone: "+91 98450 33441",
    customerEmail: "accounts@kaurretail.in",
    amount: 42000,
    currency: "INR",
    riskSeverity: "MEDIUM",
    status: "DETECTED",
    overdueDays: 7,
    interventionsCount: 0,
    maxInterventionsAllowed: 3,
    recoveredAmount: 0,
    auditTrail: [
      {
        id: "step-1",
        timestamp: "2026-09-02T09:00:00Z",
        stage: "DETECTION",
        title: "Invoice Overdue Detector",
        description: "Invoice #INV-40915 overdue by 7 days. Total amount: ₹42,000."
      }
    ],
    createdAt: "2026-09-02T09:00:00Z",
    updatedAt: "2026-09-02T09:00:00Z"
  },
  {
    id: "RZP-PAY-88209",
    vector: "PAYMENT_DEGRADATION",
    customerName: "Pooja Hegde",
    customerPhone: "+91 91234 56789",
    customerEmail: "pooja.h@yahoo.co.in",
    amount: 6800,
    currency: "INR",
    riskSeverity: "LOW",
    status: "DETECTED",
    errorCode: "UPI_COLLECT_EXPIRED",
    errorReason: "User missed GPay UPI approve request notification",
    bankName: "Axis Bank",
    interventionsCount: 0,
    maxInterventionsAllowed: 3,
    recoveredAmount: 0,
    auditTrail: [
      {
        id: "step-1",
        timestamp: "2026-09-02T14:10:00Z",
        stage: "DETECTION",
        title: "UPI Expiry Detected",
        description: "Collect request timed out after 5 minutes."
      }
    ],
    createdAt: "2026-09-02T14:10:00Z",
    updatedAt: "2026-09-02T14:10:00Z"
  },
  {
    id: "RZP-SUB-77325",
    vector: "FAILED_SUBSCRIPTION",
    customerName: "Siddharth Rao",
    customerPhone: "+91 97441 22334",
    customerEmail: "siddharth@cloudanalytics.io",
    amount: 15999,
    currency: "INR",
    riskSeverity: "CRITICAL",
    status: "DETECTED",
    errorCode: "CARD_EXPIRED",
    errorReason: "Auto-debit mandate failed due to expired credit card",
    subscriptionPlan: "Enterprise Analytics Tier",
    bankName: "SBI",
    interventionsCount: 0,
    maxInterventionsAllowed: 3,
    recoveredAmount: 0,
    auditTrail: [
      {
        id: "step-1",
        timestamp: "2026-09-02T11:20:00Z",
        stage: "DETECTION",
        title: "Card Expiry Mandate Failure",
        description: "Mandate ₹15,999 failed on expired SBI Card ending 8812."
      }
    ],
    createdAt: "2026-09-02T11:20:00Z",
    updatedAt: "2026-09-02T11:20:00Z"
  },
  {
    id: "RZP-CRT-55108",
    vector: "CHECKOUT_ABANDONMENT",
    customerName: "Meera Nair",
    customerPhone: "+91 98199 00112",
    customerEmail: "meera.nair@outlook.com",
    amount: 7250,
    currency: "INR",
    riskSeverity: "MEDIUM",
    status: "DETECTED",
    checkoutItem: "Smart Fitness Watch",
    interventionsCount: 0,
    maxInterventionsAllowed: 3,
    recoveredAmount: 0,
    discountPercentageOffered: 10,
    auditTrail: [
      {
        id: "step-1",
        timestamp: "2026-09-02T12:00:00Z",
        stage: "DETECTION",
        title: "Checkout Drop-off Event",
        description: "Cart abandoned at discount coupon step."
      }
    ],
    createdAt: "2026-09-02T12:00:00Z",
    updatedAt: "2026-09-02T12:00:00Z"
  }
];

// Helper to generate 40 additional realistic records for rich batch simulations
export function generateSyntheticBatch(count: number = 42): RevenueRecord[] {
  const names = [
    "Aarav Patel", "Diya Kapoor", "Kabir Mehta", "Neha Gupta", "Rohan Joshi",
    "Sanya Iyer", "Arjun Reddy", "Kavya Menon", "Aditya Deshmukh", "Tanya Bansal",
    "Deepak Sinha", "Priya Kulkarni", "Amitabh Roy", "Sneha Chawla", "Tarun Bhatia"
  ];
  
  const vectors: RevenueRecord['vector'][] = [
    'PAYMENT_DEGRADATION', 'CHECKOUT_ABANDONMENT', 'FAILED_SUBSCRIPTION', 'B2B_RECEIVABLES'
  ];

  const errorCodes = [
    "BAD_REQUEST_PAYMENT_TIMED_OUT",
    "GATEWAY_DOWNTIME",
    "INSUFFICIENT_FUNDS",
    "UPI_TRANSACTION_LIMIT_EXCEEDED",
    "SUBSCRIPTION_MANDATE_DECLINED",
    "CARD_EXPIRED"
  ];

  const banks = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra"];

  const items = [
    "Enterprise Cloud Storage Annual",
    "Premium Audio Headphones",
    "B2B SaaS License - Tier 2",
    "Smart Home Security Kit",
    "Co-Working Workspace Subscription"
  ];

  return Array.from({ length: count }).map((_, idx) => {
    const vector = vectors[idx % vectors.length];
    const name = names[idx % names.length];
    const amount = Math.floor(Math.random() * 45000) + 1500;
    const severity: RevenueRecord['riskSeverity'] = amount > 25000 ? 'CRITICAL' : amount > 10000 ? 'HIGH' : 'MEDIUM';
    
    return {
      id: `RZP-BAT-${1000 + idx}`,
      vector,
      customerName: name,
      customerPhone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      customerEmail: `${name.toLowerCase().replace(' ', '.')}@example.in`,
      amount,
      currency: "INR",
      riskSeverity: severity,
      status: "DETECTED",
      errorCode: errorCodes[idx % errorCodes.length],
      errorReason: "Synthetic simulation anomaly trigger",
      bankName: banks[idx % banks.length],
      checkoutItem: vector === 'CHECKOUT_ABANDONMENT' ? items[idx % items.length] : undefined,
      subscriptionPlan: vector === 'FAILED_SUBSCRIPTION' ? items[idx % items.length] : undefined,
      overdueDays: vector === 'B2B_RECEIVABLES' ? Math.floor(Math.random() * 20) + 3 : undefined,
      interventionsCount: 0,
      maxInterventionsAllowed: 3,
      recoveredAmount: 0,
      auditTrail: [
        {
          id: `step-batch-${idx}`,
          timestamp: new Date(Date.now() - idx * 600000).toISOString(),
          stage: "DETECTION",
          title: `Automated Leakage Detection (${vector})`,
          description: `Identified potential revenue loss of ₹${amount.toLocaleString('en-IN')}`
        }
      ],
      createdAt: new Date(Date.now() - idx * 600000).toISOString(),
      updatedAt: new Date(Date.now() - idx * 600000).toISOString()
    };
  });
}
