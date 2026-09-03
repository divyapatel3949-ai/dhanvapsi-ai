import React from 'react';
import { ShieldCheck, Zap, Sliders, Moon, Volume2, Activity, PlayCircle } from 'lucide-react';
import { ComplianceConfig } from '../types/recovery';

interface NavbarProps {
  complianceConfig: ComplianceConfig;
  isQuietHours: boolean;
  onOpenCompliance: () => void;
  onOpenSimulator: () => void;
  onTriggerBatch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  complianceConfig,
  isQuietHours,
  onOpenCompliance,
  onOpenSimulator,
  onTriggerBatch
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-rzp-border px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Track Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rzp-blue to-blue-400 flex items-center justify-center shadow-lg shadow-rzp-blue/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight">Razorpay</span>
                <span className="bg-rzp-blue/20 text-rzp-blue border border-rzp-blue/30 text-xs font-semibold px-2 py-0.5 rounded-md">
                  धनवापसी AI
                </span>
              </div>
              <p className="text-xs text-rzp-textMuted font-mono">Track 03 • AI Revenue Recovery • DhanVapsi</p>
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-rzp-border" />

          <div className="hidden lg:flex items-center space-x-2 bg-rzp-card border border-rzp-border px-3 py-1.5 rounded-lg text-xs">
            <Activity className="w-3.5 h-3.5 text-rzp-emerald animate-pulse" />
            <span className="text-slate-300 font-medium">Autonomous Agent:</span>
            <span className="text-rzp-emerald font-semibold">Active & Listening</span>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center space-x-3">
          
          {/* Quiet Hours Status Badge */}
          <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            isQuietHours 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <Moon className="w-3.5 h-3.5" />
            <span>RBI Quiet Hours: {isQuietHours ? 'ACTIVE (21:00-09:00)' : 'OFF (Nudges Active)'}</span>
          </div>

          {/* Quick Hinglish Simulator Trigger */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-1.5 bg-rzp-card hover:bg-rzp-cardHover border border-rzp-border hover:border-rzp-blue/40 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
          >
            <Volume2 className="w-4 h-4 text-rzp-gold" />
            <span className="hidden sm:inline">Hinglish Voice Agent</span>
          </button>

          {/* Compliance Settings Button */}
          <button
            onClick={onOpenCompliance}
            className="flex items-center space-x-1.5 bg-rzp-card hover:bg-rzp-cardHover border border-rzp-border text-slate-300 text-xs font-medium px-3 py-2 rounded-lg transition-all"
          >
            <Sliders className="w-4 h-4 text-rzp-blue" />
            <span className="hidden md:inline">Rules & Guardrails</span>
          </button>

          {/* Run Batch Simulation Button */}
          <button
            onClick={onTriggerBatch}
            className="flex items-center space-x-2 bg-gradient-to-r from-rzp-blue to-blue-600 hover:from-blue-600 hover:to-rzp-blue text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-rzp-blue/25 hover:shadow-rzp-blue/40 transition-all transform active:scale-95"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Run Batch Recovery</span>
          </button>

        </div>
      </div>
    </header>
  );
};
