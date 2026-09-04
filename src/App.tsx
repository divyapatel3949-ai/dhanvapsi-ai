import React, { useState, useMemo, useCallback, useRef } from 'react';
import { RevenueRecord, ComplianceConfig, RecoveryVector, BatchMetrics } from './types/recovery';
import { INITIAL_REVENUE_RECORDS, INITIAL_COMPLIANCE_CONFIG, generateSyntheticBatch } from './services/mockData';
import { AgentEngine } from './services/agentEngine';
import { Sidebar, PageId } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { RecoveryQueue } from './components/RecoveryQueue';
import { CaseForensics } from './components/CaseForensics';
import { AgentActivity } from './components/AgentActivity';
import { AnalyticsPage } from './components/AnalyticsPage';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export type BatchState = 'idle' | 'running' | 'complete' | 'error';

export interface BatchProgress {
  state: BatchState;
  current: number;
  total: number;
  phase: string;
}

function createInitialRecords(): RevenueRecord[] {
  const synth = generateSyntheticBatch(42);
  return [...INITIAL_REVENUE_RECORDS, ...synth];
}

export function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [records, setRecords] = useState<RevenueRecord[]>(createInitialRecords);
  const [complianceConfig] = useState<ComplianceConfig>(INITIAL_COMPLIANCE_CONFIG);
  const [selectedCase, setSelectedCase] = useState<RevenueRecord | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({ state: 'idle', current: 0, total: 0, phase: '' });
  const intervalRef = useRef<number | null>(null);

  const agentEngine = useMemo(() => new AgentEngine(complianceConfig), [complianceConfig]);
  const metrics = useMemo(() => agentEngine.calculateMetrics(records), [agentEngine, records]);

  const handleOpenCase = useCallback((rec: RevenueRecord) => {
    // Find the latest version of this record from state
    setRecords(prev => {
      const latest = prev.find(r => r.id === rec.id);
      setSelectedCase(latest || rec);
      return prev;
    });
    setActivePage('case-forensics');
  }, []);

  // Run batch recovery simulation
  const handleRunBatch = useCallback(() => {
    if (batchProgress.state === 'running') return;
    
    // Reset the engine's PRNG for deterministic results
    agentEngine.resetSimulation();
    
    // Reset all records to DETECTED state first
    const freshRecords = createInitialRecords();
    setRecords(freshRecords);
    
    const total = freshRecords.length;
    setBatchProgress({ state: 'running', current: 0, total, phase: 'Analyzing transactions...' });
    
    let idx = 0;
    const phases = [
      { at: 0, text: 'Analyzing transactions...' },
      { at: Math.floor(total * 0.15), text: 'Scoring recovery opportunities...' },
      { at: Math.floor(total * 0.3), text: 'Selecting interventions...' },
      { at: Math.floor(total * 0.5), text: 'Executing bounded recovery workflows...' },
      { at: Math.floor(total * 0.85), text: 'Finalizing outcomes & audit trail...' },
    ];
    
    intervalRef.current = window.setInterval(() => {
      if (idx >= total) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setBatchProgress(prev => ({ ...prev, state: 'complete', current: total, phase: 'Recovery simulation complete' }));
        return;
      }
      
      // Update phase text
      const currentPhase = phases.filter(p => p.at <= idx).pop();
      
      setRecords(prev => {
        const updated = [...prev];
        updated[idx] = agentEngine.processRecord(prev[idx]);
        return updated;
      });
      
      setBatchProgress({ 
        state: 'running', 
        current: idx + 1, 
        total, 
        phase: currentPhase?.text || 'Processing...' 
      });
      
      idx++;
    }, 80);
  }, [batchProgress.state, agentEngine]);

  // Reset demo
  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    agentEngine.resetSimulation();
    setRecords(createInitialRecords());
    setSelectedCase(null);
    setBatchProgress({ state: 'idle', current: 0, total: 0, phase: '' });
  }, [agentEngine]);

  return (
    <div className="min-h-screen bg-dv-bg text-slate-100 flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="ml-56 flex-1 min-h-screen">
        {/* Top Banner */}
        <div className="sticky top-0 z-20 bg-dv-amber/10 border-b border-dv-amber/20 px-6 py-2 flex items-center justify-center space-x-2 flex-wrap gap-y-1">
          <AlertTriangle className="w-3.5 h-3.5 text-dv-amber shrink-0" />
          <p className="text-[11px] text-dv-amber font-medium">
            Demo Simulation — Recovery outcomes use synthetic transaction data and simulated probabilities. No real merchant payments are processed.
          </p>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleRunBatch}
              disabled={batchProgress.state === 'running'}
              className={`text-[10px] font-bold px-4 py-1.5 rounded-lg border transition-all ${
                batchProgress.state === 'running'
                  ? 'bg-dv-amber/20 border-dv-amber/30 text-dv-amber cursor-wait'
                  : 'bg-dv-violet text-white border-dv-violet hover:bg-dv-violetHover'
              }`}
            >
              {batchProgress.state === 'running' 
                ? `${batchProgress.phase} (${batchProgress.current}/${batchProgress.total})`
                : batchProgress.state === 'complete' 
                  ? '✓ Re-run Batch Recovery'
                  : 'Run Batch Recovery'
              }
            </button>
            
            {batchProgress.state === 'complete' && (
              <button
                onClick={handleReset}
                className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-dv-border text-dv-textMuted hover:text-white hover:border-dv-borderLight transition-all flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar during batch run */}
        {batchProgress.state === 'running' && (
          <div className="w-full h-1 bg-dv-border">
            <div 
              className="h-full bg-gradient-to-r from-dv-violet to-dv-cyan transition-all duration-200" 
              style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }} 
            />
          </div>
        )}

        {/* Page Content */}
        <div className="p-8 max-w-6xl">
          {activePage === 'overview' && (
            <OverviewDashboard
              metrics={metrics}
              records={records}
              batchProgress={batchProgress}
              onOpenAudit={handleOpenCase}
              onRunBatch={handleRunBatch}
            />
          )}

          {activePage === 'recovery-queue' && (
            <RecoveryQueue records={records} onSelectCase={handleOpenCase} />
          )}

          {activePage === 'case-forensics' && (
            <CaseForensics record={selectedCase} onBack={() => setActivePage('recovery-queue')} />
          )}

          {activePage === 'agent-activity' && (
            <AgentActivity records={records} onSelectCase={handleOpenCase} />
          )}

          {activePage === 'analytics' && (
            <AnalyticsPage metrics={metrics} records={records} />
          )}
        </div>
      </main>
    </div>
  );
}
