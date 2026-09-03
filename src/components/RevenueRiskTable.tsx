import React, { useState } from 'react';
import { RevenueRecord, RecoveryVector, RiskSeverity } from '../types/recovery';
import { Search, Filter, Play, FileText, PhoneCall, CheckCircle, ShieldAlert, AlertTriangle, ArrowUpDown, ChevronRight } from 'lucide-react';

interface RevenueRiskTableProps {
  records: RevenueRecord[];
  onTriggerSingle: (record: RevenueRecord) => void;
  onOpenAudit: (record: RevenueRecord) => void;
  onOpenVoiceCall: (record: RevenueRecord) => void;
}

export const RevenueRiskTable: React.FC<RevenueRiskTableProps> = ({
  records,
  onTriggerSingle,
  onOpenAudit,
  onOpenVoiceCall
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVector, setSelectedVector] = useState<RecoveryVector | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<RiskSeverity | 'ALL'>('ALL');

  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.customerPhone.includes(searchTerm) ||
      (rec.bankName && rec.bankName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesVector = selectedVector === 'ALL' || rec.vector === selectedVector;
    const matchesSeverity = selectedSeverity === 'ALL' || rec.riskSeverity === selectedSeverity;

    return matchesSearch && matchesVector && matchesSeverity;
  });

  const getVectorBadge = (vector: RecoveryVector) => {
    switch (vector) {
      case 'PAYMENT_DEGRADATION':
        return <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Payment Fail</span>;
      case 'CHECKOUT_ABANDONMENT':
        return <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Cart Dropoff</span>;
      case 'FAILED_SUBSCRIPTION':
        return <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Mandate Fail</span>;
      case 'B2B_RECEIVABLES':
        return <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">B2B Invoice</span>;
    }
  };

  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="text-rzp-rose font-bold flex items-center text-xs"><AlertTriangle className="w-3 h-3 mr-1" /> CRITICAL</span>;
      case 'HIGH':
        return <span className="text-rzp-gold font-bold flex items-center text-xs"><AlertTriangle className="w-3 h-3 mr-1" /> HIGH</span>;
      case 'MEDIUM':
        return <span className="text-blue-400 font-medium text-xs">MEDIUM</span>;
      case 'LOW':
        return <span className="text-slate-400 font-medium text-xs">LOW</span>;
    }
  };

  const getStatusBadge = (status: RevenueRecord['status']) => {
    if (status === 'RECOVERED') {
      return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-lg">✓ RECOVERED</span>;
    }
    if (status === 'PTP_REGISTERED') {
      return <span className="bg-rzp-gold/20 text-rzp-gold border border-rzp-gold/40 text-xs font-bold px-2.5 py-1 rounded-lg">PTP Logged</span>;
    }
    if (status.startsWith('HALTED_')) {
      return <span className="bg-slate-700/50 text-slate-300 border border-slate-600 text-xs font-medium px-2.5 py-1 rounded-lg">Halted</span>;
    }
    if (status === 'INTERVENTION_SENT') {
      return <span className="bg-rzp-blue/20 text-rzp-blue border border-rzp-blue/40 text-xs font-bold px-2.5 py-1 rounded-lg">Intervention Sent</span>;
    }
    return <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg">Detected</span>;
  };

  return (
    <div className="bg-rzp-card border border-rzp-border rounded-2xl overflow-hidden space-y-4 p-6">
      
      {/* Table Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-rzp-textMuted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customer, ID, bank, error..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F19] border border-rzp-border focus:border-rzp-blue text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all placeholder:text-rzp-textMuted"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          
          <div className="flex items-center space-x-1.5 bg-[#0B0F19] border border-rzp-border px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-rzp-textMuted" />
            <select
              value={selectedVector}
              onChange={e => setSelectedVector(e.target.value as any)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-rzp-card">All Vectors</option>
              <option value="PAYMENT_DEGRADATION" className="bg-rzp-card">Payment Failure</option>
              <option value="CHECKOUT_ABANDONMENT" className="bg-rzp-card">Cart Dropoff</option>
              <option value="FAILED_SUBSCRIPTION" className="bg-rzp-card">Failed Subscription</option>
              <option value="B2B_RECEIVABLES" className="bg-rzp-card">B2B Receivables</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#0B0F19] border border-rzp-border px-3 py-1.5 rounded-xl text-xs">
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value as any)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-rzp-card">All Severities</option>
              <option value="CRITICAL" className="bg-rzp-card">Critical</option>
              <option value="HIGH" className="bg-rzp-card">High</option>
              <option value="MEDIUM" className="bg-rzp-card">Medium</option>
              <option value="LOW" className="bg-rzp-card">Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-rzp-border">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0B0F19] border-b border-rzp-border font-semibold text-rzp-textMuted uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Transaction / Invoice ID</th>
              <th className="py-3.5 px-4">Customer Details</th>
              <th className="py-3.5 px-4">Vector & Diagnostics</th>
              <th className="py-3.5 px-4 text-right">Amount (₹)</th>
              <th className="py-3.5 px-4">Risk Level</th>
              <th className="py-3.5 px-4">Workflow Status</th>
              <th className="py-3.5 px-4 text-center">Agent Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-rzp-border/60 bg-rzp-card">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-rzp-textMuted">
                  No revenue risk records found matching criteria.
                </td>
              </tr>
            ) : (
              filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-rzp-cardHover transition-colors">
                  
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    {rec.id}
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{rec.customerName}</div>
                    <div className="text-[11px] text-rzp-textMuted">{rec.customerPhone}</div>
                  </td>

                  {/* Vector & Error */}
                  <td className="py-3.5 px-4 space-y-1">
                    <div>{getVectorBadge(rec.vector)}</div>
                    <div className="text-[11px] text-rzp-textMuted truncate max-w-xs">
                      {rec.errorReason || rec.checkoutItem || (rec.overdueDays ? `${rec.overdueDays} days overdue` : 'Revenue at risk')}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-100 text-sm">
                    ₹{rec.amount.toLocaleString('en-IN')}
                  </td>

                  {/* Risk */}
                  <td className="py-3.5 px-4">
                    {getSeverityBadge(rec.riskSeverity)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(rec.status)}
                  </td>

                  {/* Action buttons */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      
                      {/* Run Single Agent Step */}
                      {rec.status !== 'RECOVERED' && !rec.status.startsWith('HALTED_') && (
                        <button
                          onClick={() => onTriggerSingle(rec)}
                          className="p-1.5 bg-rzp-blue/20 hover:bg-rzp-blue text-rzp-blue hover:text-white rounded-lg border border-rzp-blue/40 transition-all"
                          title="Trigger AI Agent Step"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Hinglish Voice Call simulator */}
                      <button
                        onClick={() => onOpenVoiceCall(rec)}
                        className="p-1.5 bg-rzp-gold/20 hover:bg-rzp-gold text-rzp-gold hover:text-slate-900 rounded-lg border border-rzp-gold/40 transition-all"
                        title="Simulate Hinglish AI Call / WhatsApp"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>

                      {/* View Audit Trail */}
                      <button
                        onClick={() => onOpenAudit(rec)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
                        title="View Full LLM Audit Trail"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
