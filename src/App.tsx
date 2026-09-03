import React, { useState, useMemo, useCallback } from 'react';
import { RevenueRecord, ComplianceConfig, RecoveryVector } from './types/recovery';
import { INITIAL_REVENUE_RECORDS, INITIAL_COMPLIANCE_CONFIG, generateSyntheticBatch } from './services/mockData';
import { AgentEngine } from './services/agentEngine';
import { Sidebar, PageId } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { RecoveryQueue } from './components/RecoveryQueue';
import { CaseForensics } from './components/CaseForensics';
import { AgentActivity } from './components/AgentActivity';
import { AnalyticsPage } from './components/AnalyticsPage';
import { AlertTriangle } from 'lucide-react';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [records, setRecords] = useState<RevenueRecord[]>(() => {
    const synth = generateSyntheticBatch(42);
    return [...INITIAL_REVENUE_RECORDS, ...synth];
  });
  const [complianceConfig] = useState<ComplianceConfig>(INITIAL_COMPLIANCE_CONFIG);
  const [activeVector, setActiveVector] = useState<RecoveryVector | 'ALL'>('ALL');
  const [selectedCase, setSelectedCase] = useState<RevenueRecord | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchIndex, setBatchIndex] = useState(0);

  const agentEngine = useMemo(() => new AgentEngine(complianceConfig), [complianceConfig]);
  const metrics = useMemo(() => agentEngine.calculateMetrics(records), [agentEngine, records]);

  // Navigate to case forensics
  const handleOpenCase = useCallback((rec: RevenueRecord) => {
    setSelectedCase(rec);
    setActivePage('case-forensics');
  }, []);

  // Run batch simulation
  const handleRunBatch = useCallback(() => {
    if (batchRunning) return;
    setBatchRunning(true);
    setBatchIndex(0);

    let idx = 0;
    const interval = setInterval(() => {
      setRecords(prev => {
        if (idx >= prev.length) {
          clearInterval(interval);
          setBatchRunning(false);
          return prev;
        }
        const updated = [...prev];
        updated[idx] = agentEngine.processRecord(prev[idx]);
        return updated;
      });
      setBatchIndex(i => i + 1);
      idx++;
      if (idx >= records.length) {
        clearInterval(interval);
        setBatchRunning(false);
      }
    }, 120);
  }, [batchRunning, agentEngine, records.length]);

  return (
    <div className="min-h-screen bg-dv-bg text-slate-100 flex">

      {/* Sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content */}
      <main className="ml-56 flex-1 min-h-screen">

        {/* Top Simulation Banner */}
        <div className="sticky top-0 z-20 bg-dv-amber/10 border-b border-dv-amber/20 px-6 py-2 flex items-center justify-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-dv-amber" />
          <p className="text-[11px] text-dv-amber font-medium">
            Simulation mode · every recovered-money figure comes from a synthetic Bernoulli simulation on hidden probabilities, not observed merchant recovery.
          </p>

          {/* Run batch button in banner */}
          <button
            onClick={handleRunBatch}
            disabled={batchRunning}
            className={`ml-4 text-[10px] font-bold px-3 py-1 rounded-lg border transition-all ${
              batchRunning
                ? 'bg-dv-amber/20 border-dv-amber/30 text-dv-amber cursor-wait'
                : 'bg-dv-violet text-white border-dv-violet hover:bg-dv-violetHover'
            }`}
          >
            {batchRunning ? `Processing ${batchIndex}/${records.length}...` : 'Run Batch Recovery'}
          </button>
        </div>

        {/* Page Content */}
        <div className="p-8 max-w-6xl">
          {activePage === 'overview' && (
            <OverviewDashboard
              metrics={metrics}
              records={records}
              activeVector={activeVector}
              onSelectVector={setActiveVector}
              onOpenAudit={handleOpenCase}
            />
          )}

          {activePage === 'recovery-queue' && (
            <RecoveryQueue
              records={records}
              onSelectCase={handleOpenCase}
            />
          )}

          {activePage === 'case-forensics' && (
            <CaseForensics
              record={selectedCase}
              onBack={() => setActivePage('recovery-queue')}
            />
          )}

          {activePage === 'agent-activity' && (
            <AgentActivity
              records={records}
              onSelectCase={handleOpenCase}
            />
          )}

          {activePage === 'analytics' && (
            <AnalyticsPage
              metrics={metrics}
              records={records}
            />
          )}
        </div>
      </main>
    </div>
  );
}
