<div align="center">
  
# ⚡ Razorpay Rebound AI

### Autonomous Agentic Revenue Recovery Platform

**Track 03 — AI Revenue Recovery | Razorpay AI Buildathon 2026**

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

*Build an agent that detects revenue at risk, determines the right intervention, and executes a bounded recovery workflow — from payment failures and checkout abandonment to overdue receivables.*

</div>

---

## 🎯 Problem Statement (Track 03)

> **"Revenue loss rarely happens in one clean step."** A payment degrades, a checkout gets abandoned, a subscription fails, or an invoice goes overdue. AI can now close the loop from detecting the problem to diagnosing it, choosing the right intervention, and recovering the money.

### THE BAR

> *Don't just identify the problem. Show measured money recovered across a batch, with compliant escalation, stopping rules, and an audit trail.*

---

## 🏆 How Rebound AI Exceeds the Bar

| Benchmark Requirement | Rebound AI Implementation |
|---|---|
| **Measured money recovered across a batch** | Real-time batch simulation engine processing 50+ transactions with live ₹ INR tally, recovery rate %, and ROI multiplier |
| **Compliant escalation** | RBI Quiet Hours (21:00–09:00), TRAI DND registry check, DPDPA opt-out compliance, configurable human-approval thresholds |
| **Stopping rules** | Auto-halt on: opt-out/DND, max contact cap reached, payment received (webhook), dispute/chargeback filed |
| **Audit trail** | Immutable step-by-step decision log: DETECTION → DIAGNOSIS → COMPLIANCE → INTERVENTION → STOPPING RULE → OUTCOME with raw JSON inspector |

---

## 🔥 Key Features

### 1. Multi-Vector Revenue Leakage Detection
- **Payment Degradation** — Bank gateway downtime, 3DS OTP timeouts, UPI collect expiry
- **Checkout Drop-off Recovery** — Abandoned cart nudges with dynamic discount payment links
- **Failed Subscription Mandates** — Smart retry sequencer targeting salary-window dates
- **B2B Receivables Chaser** — Overdue invoice tracking with Promise-to-Pay (PTP) logging

### 2. Hinglish AI Voice & WhatsApp Recovery Agent
- Natural Hinglish conversational AI voice simulator with Web Speech API text-to-speech
- Interactive customer response simulation: "Pay Now", "Promise to Pay", "Ask Discount", "Opt Out"
- Real-time PTP date commitment logging and payment link dispatch

### 3. Batch Revenue Recovery Engine
- Process batches of 50+ records with configurable speed (1x / 2x / 5x)
- Live execution feed streaming agent decisions and money recovered in real-time
- Real-time tally: Revenue Processed → Money Recovered → Recovery Rate → Compliance Halts

### 4. RBI & DPDPA Compliance Guardrails
- Quiet Hours enforcement (configurable, default 21:00–09:00)
- Maximum contact frequency caps (default 3 nudges per record)
- Instant opt-out processing on STOP/UNSUBSCRIBE keywords
- Human approval gates for high-value transactions (configurable ₹ threshold)

### 5. Transparent LLM Decision Audit Trail
- Visual timeline of every AI agent decision step with metadata
- Raw JSON payload inspector for developer debugging
- Immutable audit hash reference for compliance verification

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 3 (Custom Razorpay Dark Theme) |
| **Charts** | Recharts 2 |
| **Icons** | Lucide React |
| **Voice Synthesis** | Web Speech API (SpeechSynthesis) |
| **Design System** | Custom Razorpay Obsidian Dark (`#0B0F19`, `#3071FF`, `#EAB308`) |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/razorpay-rebound-ai.git
cd razorpay-rebound-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
razorpay-rebound-ai/
├── index.html                          # HTML entry point
├── package.json                        # Dependencies & scripts
├── vite.config.ts                      # Vite build configuration
├── tailwind.config.js                  # Razorpay dark theme palette
├── tsconfig.json                       # TypeScript configuration
│
├── src/
│   ├── main.tsx                        # React DOM entry
│   ├── App.tsx                         # Main application shell
│   ├── index.css                       # Global styles & scrollbar theme
│   │
│   ├── types/
│   │   └── recovery.ts                # Core data models & interfaces
│   │
│   ├── services/
│   │   ├── agentEngine.ts             # AI decision agent (diagnosis, compliance, interventions)
│   │   ├── hinglishVoiceAgent.ts      # Hinglish voice/chat simulator engine
│   │   └── mockData.ts               # Realistic Indian merchant dataset & batch generator
│   │
│   └── components/
│       ├── Navbar.tsx                  # Top navigation with branding & controls
│       ├── OverviewDashboard.tsx       # KPI cards & analytics charts
│       ├── BatchSimulationModule.tsx   # Batch processing engine with live feed
│       ├── RevenueRiskTable.tsx        # Searchable/filterable risk registry
│       ├── HinglishVoiceSimulator.tsx  # Interactive voice/chat recovery modal
│       ├── AuditTrailModal.tsx         # LLM decision timeline & JSON inspector
│       └── ComplianceSettingsModal.tsx # RBI/DPDPA rules configuration panel
```

---

## 🎮 Demo Walkthrough

1. **Dashboard** — View real-time KPIs: Total Revenue at Risk, Measured Money Recovered, Recovery Rate %, Active PTPs, ROI Multiplier, and Compliance Score.

2. **Run Batch Recovery** — Click "Run Batch Recovery" to simulate autonomous agent processing across 50+ transactions. Watch the live execution feed as the AI agent diagnoses root causes, checks compliance, sends interventions, and recovers money in real-time.

3. **Hinglish Voice Agent** — Click the phone icon on any record to launch an interactive Hinglish AI voice call simulation. Test customer responses: pay now, request discount, promise to pay later, or opt out.

4. **Audit Trail** — Click the document icon on any record to inspect the full AI decision trail from detection through outcome, with metadata tags and raw JSON payload.

5. **Compliance Rules** — Click "Rules & Guardrails" to configure RBI quiet hours, max contact caps, DPDPA opt-out enforcement, and human approval thresholds.

---

## 📊 Example Directions Covered

| Direction | Implementation |
|---|---|
| Payment degradation → root cause → recovery action | ✅ Bank downtime detection → failover payment link |
| Checkout drop-off recovery | ✅ Cart abandonment → WhatsApp nudge with dynamic discount |
| Failed-subscription recovery | ✅ Mandate failure → smart retry sequencer at salary window |
| B2B receivables chaser | ✅ Overdue invoice → Hinglish AI voice call → PTP tracking |
| Mandate retry sequencer | ✅ Optimal timing retry based on bank success probability |
| Hinglish voice recovery | ✅ Full interactive voice simulator with TTS playback |
| Promise-to-pay tracker | ✅ PTP commitment logging with date tracking |

---

## 📄 License

MIT License — Built for the Razorpay AI Buildathon 2026

---

<div align="center">
  
**Built with ❤️ for Razorpay AI Buildathon 2026 — Track 03: AI Revenue Recovery**

</div>
