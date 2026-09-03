import React, { useState, useMemo } from 'react';
import { RevenueRecord, ComplianceConfig, RecoveryVector } from './types/recovery';
import { INITIAL_REVENUE_RECORDS, INITIAL_COMPLIANCE_CONFIG } from './services/mockData';
import { AgentEngine } from './services/agentEngine';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { BatchSimulationModule } from './components/BatchSimulationModule';
import { RevenueRiskTable } from './components/RevenueRiskTable';
import { HinglishVoiceSimulator } from './components/HinglishVoiceSimulator';
import { AuditTrailModal } from './components/AuditTrailModal';
import { ComplianceSettingsModal } from './components/ComplianceSettingsModal';
import { Sparkles, Layers, ShieldCheck, Trophy, ExternalLink } from 'lucide-react';

export function App() {
  const [records, setRecords] = useState<RevenueRecord[]>(INITIAL_REVENUE_RECORDS);
  const [complianceConfig, setComplianceConfig] = useState<ComplianceConfig>(INITIAL_COMPLIANCE_CONFIG);
  const [activeVector, setActiveVector] = useState<RecoveryVector | 'ALL'>('ALL');
  
  // Modal states
  const [auditRecord, setAuditRecord] = useState<RevenueRecord | null>(null);
  const [voiceCallRecord, setVoiceCallRecord] = useState<RevenueRecord | null>(null);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);

  const agentEngine = useMemo(() => new AgentEngine(complianceConfig), [complianceConfig]);
  const isQuietHours = useMemo(() => agentEngine.isQuietHours(), [agentEngine]);
  const metrics = useMemo(() => agentEngine.calculateMetrics(records), [agentEngine, records]);

  // Single Item Trigger Handler
  const handleTriggerSingle = (rec: RevenueRecord) => {
    const updated = agentEngine.processRecord(rec);
    setRecords(prev => prev.map(r => (r.id === rec.id ? updated : r)));
  };

  // Update record after voice call simulator
  const handleUpdateRecord = (updatedRec: RevenueRecord) => {
    setRecords(prev => prev.map(r => (r.id === updatedRec.id ? updatedRec : r)));
  };

  // Batch Update Handler
  const handleBatchUpdate = (updatedRecords: RevenueRecord[]) => {
    setRecords(updatedRecords);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-rzp-blue selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        complianceConfig={complianceConfig}
        isQuietHours={isQuietHours}
        onOpenCompliance={() => setIsComplianceOpen(true)}
        onOpenSimulator={() => setVoiceCallRecord(records[1] || records[0])}
        onTriggerBatch={() => {
          // Scroll smoothly to batch section
          document.getElementById('batch-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Hero Banner for Buildathon Submission */}
      <div className="bg-gradient-to-r from-[#0B0F19] via-rzp-card to-[#0B0F19] border-b border-rzp-border px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="bg-rzp-gold/15 text-rzp-gold border border-rzp-gold/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center">
                <Trophy className="w-3 h-3 mr-1" /> Razorpay AI Buildathon Submission
              </span>
              <span className="text-xs text-rzp-textMuted font-mono">Track 03 • AI Revenue Recovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              DhanVapsi AI <span className="text-rzp-gold">— धनवापसी</span>
            </h1>
            <p className="text-xs sm:text-sm text-rzp-textMuted max-w-3xl">
              Detects revenue leakage across payment degradation, cart drop-offs, failed mandates & B2B invoices. Features live batch money recovery simulation, RBI/DPDPA quiet hours, Hinglish voice agent & transparent audit trails.
            </p>
          </div>

          <div className="shrink-0 flex items-center space-x-3 bg-rzp-card/80 border border-rzp-border p-3.5 rounded-2xl">
            <div className="text-right">
              <div className="text-xs text-rzp-textMuted font-semibold">Total Recovered</div>
              <div className="text-xl font-extrabold text-rzp-emerald">₹{metrics.totalMoneyRecovered.toLocaleString('en-IN')}</div>
            </div>
            <div className="h-8 w-px bg-rzp-border" />
            <div className="text-right">
              <div className="text-xs text-rzp-textMuted font-semibold">Recovery Rate</div>
              <div className="text-xl font-extrabold text-rzp-blue">{metrics.recoveryRatePercent}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Section 1: Money Recovered Dashboard & Analytics */}
        <OverviewDashboard
          metrics={metrics}
          records={records}
          activeVector={activeVector}
          onSelectVector={v => setActiveVector(v)}
          onOpenAudit={rec => setAuditRecord(rec)}
        />

        {/* Section 2: Batch Simulation Engine ("THE BAR") */}
        <div id="batch-section">
          <BatchSimulationModule
            currentRecords={records}
            complianceConfig={complianceConfig}
            onBatchUpdate={handleBatchUpdate}
          />
        </div>

        {/* Section 3: Revenue Leakage Risk Registry */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <span>Revenue Risk & Failure Registry</span>
                <span className="text-xs font-mono font-normal text-rzp-textMuted">({records.length} events)</span>
              </h2>
              <p className="text-xs text-rzp-textMuted">
                Real-time registry of detected payment failures, abandoned checkouts, and overdue invoices requiring AI intervention.
              </p>
            </div>
          </div>

          <RevenueRiskTable
            records={records}
            onTriggerSingle={handleTriggerSingle}
            onOpenAudit={rec => setAuditRecord(rec)}
            onOpenVoiceCall={rec => setVoiceCallRecord(rec)}
          />
        </div>

      </main>

      {/* Modals */}
      <HinglishVoiceSimulator
        record={voiceCallRecord}
        onClose={() => setVoiceCallRecord(null)}
        onUpdateRecord={handleUpdateRecord}
      />

      <AuditTrailModal
        record={auditRecord}
        onClose={() => setAuditRecord(null)}
      />

      <ComplianceSettingsModal
        config={complianceConfig}
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
        onSave={cfg => setComplianceConfig(cfg)}
      />

      {/* Footer */}
      <footer className="bg-[#0B0F19] border-t border-rzp-border py-6 px-6 text-center text-xs text-rzp-textMuted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">DhanVapsi AI (धनवापसी)</span>
            <span>— Track 03: AI Revenue Recovery</span>
          </div>
          <div>
            <span>Engineered for Razorpay AI Buildathon • 100% RBI & DPDPA Compliant</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
