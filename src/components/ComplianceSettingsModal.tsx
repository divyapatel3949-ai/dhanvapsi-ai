import React from 'react';
import { ComplianceConfig } from '../types/recovery';
import { X, ShieldCheck, Moon, Sliders, AlertTriangle } from 'lucide-react';

interface ComplianceSettingsModalProps {
  config: ComplianceConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ComplianceConfig) => void;
}

export const ComplianceSettingsModal: React.FC<ComplianceSettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = React.useState<ComplianceConfig>({ ...config });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-rzp-card border border-rzp-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-[#0B0F19] border-b border-rzp-border p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rzp-blue/20 text-rzp-blue border border-rzp-blue/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">RBI & DPDPA Compliance Rules</h3>
              <p className="text-xs text-rzp-textMuted">Configure stopping rules, quiet hours & contact caps</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-200">
          
          {/* Quiet Hours */}
          <div className="space-y-2 bg-[#0B0F19] p-4 rounded-xl border border-rzp-border">
            <div className="flex items-center space-x-2 font-bold text-slate-100">
              <Moon className="w-4 h-4 text-rzp-gold" />
              <span>RBI Quiet Hours Window (No Nudges)</span>
            </div>
            <p className="text-[11px] text-rzp-textMuted">
              Complies with Indian customer protection norms restricting automated outreach during late night hours.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-rzp-textMuted mb-1">Start Time (24h)</label>
                <input
                  type="time"
                  value={formData.quietHoursStart}
                  onChange={e => setFormData({ ...formData, quietHoursStart: e.target.value })}
                  className="w-full bg-rzp-card border border-rzp-border focus:border-rzp-blue p-2 rounded-lg text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-rzp-textMuted mb-1">End Time (24h)</label>
                <input
                  type="time"
                  value={formData.quietHoursEnd}
                  onChange={e => setFormData({ ...formData, quietHoursEnd: e.target.value })}
                  className="w-full bg-rzp-card border border-rzp-border focus:border-rzp-blue p-2 rounded-lg text-slate-100 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Max Nudges Cap */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-200">Maximum Contact Attempts Cap</label>
            <p className="text-[11px] text-rzp-textMuted">
              Hard stop workflow if total interventions reach this limit per transaction to prevent harassment.
            </p>
            <input
              type="number"
              min={1}
              max={10}
              value={formData.maxNudgesPerRecord}
              onChange={e => setFormData({ ...formData, maxNudgesPerRecord: Number(e.target.value) })}
              className="w-full bg-[#0B0F19] border border-rzp-border focus:border-rzp-blue p-2.5 rounded-xl text-slate-100 font-bold"
            />
          </div>

          {/* Human Approval Threshold */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-200">Human Approval Threshold (₹ INR)</label>
            <p className="text-[11px] text-rzp-textMuted">
              High-value transactions above this amount require merchant approval before automated Hinglish AI call.
            </p>
            <input
              type="number"
              step={10000}
              value={formData.requireHumanApprovalAbove}
              onChange={e => setFormData({ ...formData, requireHumanApprovalAbove: Number(e.target.value) })}
              className="w-full bg-[#0B0F19] border border-rzp-border focus:border-rzp-blue p-2.5 rounded-xl text-slate-100 font-bold"
            />
          </div>

          {/* Opt-Out & DND Toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoStopOnOptOut}
                onChange={e => setFormData({ ...formData, autoStopOnOptOut: e.target.checked })}
                className="w-4 h-4 accent-rzp-blue rounded"
              />
              <span className="font-semibold text-slate-200">Auto-Halt on Opt-Out / UNSUBSCRIBE keyword (DPDPA mandate)</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enforceDND}
                onChange={e => setFormData({ ...formData, enforceDND: e.target.checked })}
                className="w-4 h-4 accent-rzp-blue rounded"
              />
              <span className="font-semibold text-slate-200">Verify TRAI DND Registry before SMS/Voice call dispatch</span>
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-rzp-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#0B0F19] hover:bg-rzp-cardHover border border-rzp-border text-slate-300 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rzp-blue hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-rzp-blue/20 transition-all"
            >
              Save Compliance Rules
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
