import React, { useState } from 'react';
import { RevenueRecord } from '../types/recovery';
import { X, FileText, CheckCircle2, ShieldCheck, AlertCircle, Clock, Terminal, ChevronDown, ChevronRight } from 'lucide-react';

interface AuditTrailModalProps {
  record: RevenueRecord | null;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ record, onClose }) => {
  if (!record) return null;
  const [showRawJson, setShowRawJson] = useState(false);

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'DETECTION':
        return <AlertCircle className="w-4 h-4 text-rzp-rose" />;
      case 'DIAGNOSIS':
        return <Clock className="w-4 h-4 text-rzp-gold" />;
      case 'COMPLIANCE':
        return <ShieldCheck className="w-4 h-4 text-rzp-blue" />;
      case 'INTERVENTION':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'STOPPING_RULE':
        return <AlertCircle className="w-4 h-4 text-rzp-amber" />;
      case 'OUTCOME':
      default:
        return <CheckCircle2 className="w-4 h-4 text-rzp-emerald" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-rzp-card border border-rzp-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0B0F19] border-b border-rzp-border p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rzp-blue/20 text-rzp-blue border border-rzp-blue/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>LLM Decision Audit Trail</span>
                <span className="font-mono text-xs px-2 py-0.5 bg-rzp-border rounded text-slate-300">{record.id}</span>
              </h3>
              <p className="text-xs text-rzp-textMuted font-mono">
                Customer: {record.customerName} • Vector: {record.vector} • Amount: ₹{record.amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#121827] border border-rzp-border hover:border-rzp-blue text-xs text-slate-300 rounded-lg transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-rzp-gold" />
              <span>{showRawJson ? 'View Graphical Trail' : 'Inspect Raw Payload'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-[#121827] border border-rzp-border text-slate-400 rounded-lg hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audit Timeline Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#0B0F19]/40 space-y-6">
          
          {showRawJson ? (
            <pre className="bg-[#0B0F19] border border-rzp-border p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
              {JSON.stringify(record, null, 2)}
            </pre>
          ) : (
            <div className="relative border-l-2 border-rzp-border ml-4 space-y-6 pl-6">
              {record.auditTrail.map((step, idx) => (
                <div key={step.id} className="relative group">
                  
                  {/* Circle Marker */}
                  <div className="absolute -left-[33px] top-0.5 w-6 h-6 rounded-full bg-[#0B0F19] border-2 border-rzp-border group-hover:border-rzp-blue flex items-center justify-center transition-all">
                    {getStageIcon(step.stage)}
                  </div>

                  {/* Step Card */}
                  <div className="bg-rzp-card border border-rzp-border hover:border-rzp-blue/40 p-4 rounded-xl space-y-2 transition-all shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{step.title}</span>
                      <span className="text-[10px] font-mono text-rzp-textMuted">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{step.description}</p>

                    {step.metadata && (
                      <div className="pt-2 border-t border-rzp-border/60 text-[11px] font-mono text-rzp-textMuted flex flex-wrap gap-2">
                        {Object.entries(step.metadata).map(([k, v]) => (
                          <span key={k} className="bg-[#0B0F19] px-2 py-0.5 rounded border border-rzp-border">
                            {k}: <span className="text-slate-200">{String(v)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#0B0F19] border-t border-rzp-border p-4 flex items-center justify-between text-xs">
          <span className="text-rzp-textMuted font-mono">
            Immutable Audit Hash: <span className="text-slate-400">0x7f8a9...b4e2</span>
          </span>

          <button
            onClick={onClose}
            className="bg-rzp-blue hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl transition-all"
          >
            Close Audit Trail
          </button>
        </div>

      </div>
    </div>
  );
};
