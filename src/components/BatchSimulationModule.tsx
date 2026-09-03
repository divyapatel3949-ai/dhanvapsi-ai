import React, { useState, useEffect, useRef } from 'react';
import { RevenueRecord, BatchMetrics, ComplianceConfig } from '../types/recovery';
import { AgentEngine } from '../services/agentEngine';
import { generateSyntheticBatch } from '../services/mockData';
import { Play, Pause, RotateCcw, Zap, CheckCircle, ShieldAlert, IndianRupee, Layers, CheckCircle2 } from 'lucide-react';

interface BatchSimulationModuleProps {
  currentRecords: RevenueRecord[];
  complianceConfig: ComplianceConfig;
  onBatchUpdate: (updatedRecords: RevenueRecord[]) => void;
}

export const BatchSimulationModule: React.FC<BatchSimulationModuleProps> = ({
  currentRecords,
  complianceConfig,
  onBatchUpdate
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(2);
  const [batchRecords, setBatchRecords] = useState<RevenueRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liveLog, setLiveLog] = useState<{ id: string; msg: string; type: 'RECOVERED' | 'HALTED' | 'INTERVENTION' }[]>([]);

  const agentEngineRef = useRef<AgentEngine>(new AgentEngine(complianceConfig));

  useEffect(() => {
    agentEngineRef.current.updateConfig(complianceConfig);
  }, [complianceConfig]);

  // Load initial batch if empty
  useEffect(() => {
    if (batchRecords.length === 0) {
      const synthetic = generateSyntheticBatch(40);
      setBatchRecords([...currentRecords, ...synthetic]);
    }
  }, []);

  // Run simulation interval
  useEffect(() => {
    let intervalId: any = null;

    if (isSimulating && currentIndex < batchRecords.length) {
      const delay = 1000 / speed;
      intervalId = setInterval(() => {
        setBatchRecords(prev => {
          if (currentIndex >= prev.length) {
            setIsSimulating(false);
            return prev;
          }

          const currentRec = prev[currentIndex];
          const processedRec = agentEngineRef.current.processRecord(currentRec);
          
          const newArray = [...prev];
          newArray[currentIndex] = processedRec;

          // Add live log entry
          const nowStr = new Date().toLocaleTimeString();
          if (processedRec.status === 'RECOVERED') {
            setLiveLog(logs => [
              {
                id: `log-${Date.now()}`,
                msg: `[${nowStr}] RECOVERED ₹${processedRec.recoveredAmount.toLocaleString('en-IN')} for ${processedRec.customerName} via ${processedRec.recoveryChannel}`,
                type: 'RECOVERED'
              },
              ...logs.slice(0, 15)
            ]);
          } else if (processedRec.status.startsWith('HALTED_')) {
            setLiveLog(logs => [
              {
                id: `log-${Date.now()}`,
                msg: `[${nowStr}] STOPPING RULE TRIGGERED: ${processedRec.stoppingReason} (${processedRec.customerName})`,
                type: 'HALTED'
              },
              ...logs.slice(0, 15)
            ]);
          } else {
            setLiveLog(logs => [
              {
                id: `log-${Date.now()}`,
                msg: `[${nowStr}] Intervened on ${processedRec.customerName} (${processedRec.vector.split('_')[0]}) via ${processedRec.recoveryChannel || 'SMS'}`,
                type: 'INTERVENTION'
              },
              ...logs.slice(0, 15)
            ]);
          }

          onBatchUpdate(newArray);
          return newArray;
        });

        setCurrentIndex(c => c + 1);
      }, delay);
    } else if (currentIndex >= batchRecords.length && isSimulating) {
      setIsSimulating(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSimulating, currentIndex, speed, batchRecords, onBatchUpdate]);

  const handleStartSim = () => {
    if (currentIndex >= batchRecords.length) {
      // Reset if finished
      setCurrentIndex(0);
      const freshBatch = generateSyntheticBatch(40);
      setBatchRecords(freshBatch);
      setLiveLog([]);
    }
    setIsSimulating(true);
  };

  const handlePauseSim = () => {
    setIsSimulating(false);
  };

  const handleResetSim = () => {
    setIsSimulating(false);
    setCurrentIndex(0);
    const freshBatch = generateSyntheticBatch(40);
    setBatchRecords(freshBatch);
    setLiveLog([]);
    onBatchUpdate(freshBatch);
  };

  const metrics: BatchMetrics = agentEngineRef.current.calculateMetrics(batchRecords);
  const progressPercent = batchRecords.length > 0 ? Math.round((currentIndex / batchRecords.length) * 100) : 0;

  return (
    <div className="bg-rzp-card border border-rzp-border p-6 rounded-2xl space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-rzp-blue" />
            <h2 className="text-lg font-extrabold text-white">Batch Revenue Recovery Engine</h2>
            <span className="bg-rzp-blue/20 text-rzp-blue border border-rzp-blue/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
              THE BAR Benchmark
            </span>
          </div>
          <p className="text-xs text-rzp-textMuted mt-1">
            Simulate autonomous recovery across a batch of failed transactions, overdue invoices & abandoned carts.
          </p>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Speed Selector */}
          <div className="flex items-center bg-[#0B0F19] border border-rzp-border rounded-lg p-1 text-xs">
            <span className="text-rzp-textMuted px-2 font-medium">Speed:</span>
            {([1, 2, 5] as const).map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  speed === s ? 'bg-rzp-blue text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {!isSimulating ? (
            <button
              onClick={handleStartSim}
              className="flex items-center space-x-2 bg-rzp-emerald hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{currentIndex > 0 && currentIndex < batchRecords.length ? 'Resume Batch' : 'Start Batch Run'}</span>
            </button>
          ) : (
            <button
              onClick={handlePauseSim}
              className="flex items-center space-x-2 bg-rzp-amber hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleResetSim}
            className="p-2.5 bg-[#0B0F19] hover:bg-rzp-cardHover border border-rzp-border text-slate-300 rounded-lg transition-all"
            title="Reset Batch"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Realtime Tally */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">Batch Processing Progress: {currentIndex} / {batchRecords.length} records ({progressPercent}%)</span>
          <span className="text-rzp-emerald font-extrabold">
            Recovered: ₹{metrics.totalMoneyRecovered.toLocaleString('en-IN')} ({metrics.recoveryRatePercent}%)
          </span>
        </div>

        <div className="w-full bg-[#0B0F19] h-3 rounded-full overflow-hidden border border-rzp-border p-0.5">
          <div
            className="bg-gradient-to-r from-rzp-blue via-indigo-500 to-rzp-emerald h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Realtime Live Execution Stream & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Real-time Event Log */}
        <div className="lg:col-span-2 bg-[#0B0F19] border border-rzp-border p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between border-b border-rzp-border pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center">
              <Zap className="w-3.5 h-3.5 text-rzp-gold mr-1.5" /> Live Agent Execution Feed
            </span>
            <span className="text-[10px] text-rzp-textMuted font-mono">Stream Logs</span>
          </div>

          <div className="h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
            {liveLog.length === 0 ? (
              <div className="text-rzp-textMuted py-12 text-center text-xs">
                Press "Start Batch Run" to stream agent interventions and money recovery.
              </div>
            ) : (
              liveLog.map(log => (
                <div
                  key={log.id}
                  className={`p-2 rounded border transition-all ${
                    log.type === 'RECOVERED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : log.type === 'HALTED'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-rzp-blue/10 border-rzp-blue/30 text-blue-300'
                  }`}
                >
                  {log.msg}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Realtime Tally Stats */}
        <div className="bg-[#0B0F19] border border-rzp-border p-4 rounded-xl space-y-3 flex flex-col justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Batch Recovery Tally</h4>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-rzp-border/60">
              <span className="text-rzp-textMuted">Revenue Processed:</span>
              <span className="font-bold text-white">₹{metrics.totalRevenueAtRisk.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-rzp-border/60">
              <span className="text-rzp-textMuted">Money Recovered:</span>
              <span className="font-extrabold text-rzp-emerald">₹{metrics.totalMoneyRecovered.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-rzp-border/60">
              <span className="text-rzp-textMuted">Recovery Success %:</span>
              <span className="font-bold text-rzp-blue">{metrics.recoveryRatePercent}%</span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-rzp-textMuted">Compliance Halts:</span>
              <span className="font-bold text-rzp-amber">{metrics.complianceHalts} records</span>
            </div>
          </div>

          <div className="bg-rzp-blue/15 border border-rzp-blue/30 p-2.5 rounded-lg text-center">
            <span className="text-[11px] text-rzp-blue font-bold">
              Estimated Net Revenue Saved: ₹{metrics.totalMoneyRecovered.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
