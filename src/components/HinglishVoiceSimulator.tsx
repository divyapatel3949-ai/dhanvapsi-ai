import React, { useState, useEffect, useRef } from 'react';
import { RevenueRecord } from '../types/recovery';
import { HinglishVoiceAgent, VoiceSessionState } from '../services/hinglishVoiceAgent';
import { X, Volume2, VolumeX, Send, Phone, PhoneOff, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HinglishVoiceSimulatorProps {
  record: RevenueRecord | null;
  onClose: () => void;
  onUpdateRecord: (updated: RevenueRecord) => void;
}

export const HinglishVoiceSimulator: React.FC<HinglishVoiceSimulatorProps> = ({
  record,
  onClose,
  onUpdateRecord
}) => {
  if (!record) return null;

  const [voiceAgent] = useState(() => new HinglishVoiceAgent());
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const [session, setSession] = useState<VoiceSessionState>({
    recordId: record.id,
    customerName: record.customerName,
    amount: record.amount,
    invoiceId: record.id,
    messages: [],
    status: 'IDLE'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  // Start Call
  const handleStartCall = () => {
    const greeting = voiceAgent.getInitialAgentGreeting(record.customerName, record.amount, record.id);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSession({
      recordId: record.id,
      customerName: record.customerName,
      amount: record.amount,
      invoiceId: record.id,
      messages: [
        {
          id: `msg-${Date.now()}-greeting`,
          sender: 'AGENT',
          text: greeting,
          timestamp: nowStr
        }
      ],
      status: 'IN_PROGRESS'
    });

    if (!isMuted) {
      voiceAgent.speak(greeting);
    }
  };

  const handleEndCall = () => {
    voiceAgent.stopSpeech();
    setSession(s => ({ ...s, status: 'IDLE' }));
  };

  const handleSendText = (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const { nextSession, agentReply } = voiceAgent.handleUserResponse(textToSend, session);
    setSession(nextSession);
    setInputText('');

    if (!isMuted && agentReply) {
      voiceAgent.speak(agentReply);
    }

    // Sync back to record state
    const updatedRecord = { ...record };
    if (nextSession.status === 'COMPLETED_PAID') {
      updatedRecord.status = 'RECOVERED';
      updatedRecord.recoveredAmount = record.amount;
      updatedRecord.auditTrail.push({
        id: `audit-${Date.now()}-voice-paid`,
        timestamp: new Date().toISOString(),
        stage: 'OUTCOME',
        title: 'Payment Settle via Hinglish Voice Agent',
        description: `Customer agreed to payment on voice call. Dynamic Razorpay payment link executed.`
      });
    } else if (nextSession.status === 'COMPLETED_PTP') {
      updatedRecord.status = 'PTP_REGISTERED';
      updatedRecord.promiseToPay = {
        promisedDate: nextSession.ptpDate || new Date().toISOString().split('T')[0],
        amount: record.amount,
        channel: 'HINGLISH_VOICE',
        note: 'Customer committed on Hinglish voice call.',
        fulfilled: false
      };
      updatedRecord.auditTrail.push({
        id: `audit-${Date.now()}-voice-ptp`,
        timestamp: new Date().toISOString(),
        stage: 'OUTCOME',
        title: 'PTP Commitment Registered via Hinglish Voice',
        description: `Registered Promise-to-Pay for ${nextSession.ptpDate}.`
      });
    } else if (nextSession.status === 'HALTED_OPT_OUT') {
      updatedRecord.status = 'HALTED_OPT_OUT';
      updatedRecord.isOptedOut = true;
      updatedRecord.stoppingReason = 'Opted out during Hinglish AI voice call';
      updatedRecord.auditTrail.push({
        id: `audit-${Date.now()}-voice-optout`,
        timestamp: new Date().toISOString(),
        stage: 'STOPPING_RULE',
        title: 'Stopping Rule: Voice Opt-Out Registered',
        description: 'Customer requested DND during call. Halting future outreach.'
      });
    }

    onUpdateRecord(updatedRecord);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-rzp-card border border-rzp-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#0B0F19] border-b border-rzp-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rzp-gold/20 text-rzp-gold border border-rzp-gold/30 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Hinglish AI Voice & WhatsApp Simulator</span>
              </h3>
              <p className="text-xs text-rzp-textMuted font-mono">
                {record.customerName} ({record.customerPhone}) • ₹{record.amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-[#121827] border border-rzp-border text-slate-300 rounded-lg hover:text-white transition-all"
              title={isMuted ? "Unmute Voice Synth" : "Mute Voice Synth"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rzp-rose" /> : <Volume2 className="w-4 h-4 text-rzp-emerald" />}
            </button>

            <button
              onClick={() => { voiceAgent.stopSpeech(); onClose(); }}
              className="p-2 bg-[#121827] border border-rzp-border text-slate-400 rounded-lg hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Call Banner & Status */}
        <div className="bg-[#0B0F19]/50 border-b border-rzp-border px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${session.status === 'IN_PROGRESS' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="font-semibold text-slate-200">
              Call Status: {session.status === 'IN_PROGRESS' ? 'Connected (Hinglish Natural AI)' : session.status}
            </span>
          </div>

          {session.status === 'IDLE' ? (
            <button
              onClick={handleStartCall}
              className="flex items-center space-x-1.5 bg-rzp-emerald hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Connect AI Call</span>
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="flex items-center space-x-1.5 bg-rzp-rose hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Call</span>
            </button>
          )}
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B0F19]/30 min-h-[280px]">
          {session.messages.length === 0 ? (
            <div className="text-center py-16 text-xs text-rzp-textMuted space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Click "Connect AI Call" to simulate real-time Hinglish AI customer interaction.</p>
            </div>
          ) : (
            session.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'AGENT' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs space-y-1 ${
                  msg.sender === 'AGENT'
                    ? 'bg-rzp-card border border-rzp-blue/30 text-slate-100'
                    : 'bg-rzp-blue text-white'
                }`}>
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-mono">
                    <span>{msg.sender === 'AGENT' ? 'DhanVapsi AI (धनवापसी)' : record.customerName}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed font-sans">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Interactive Response Preset Buttons */}
        <div className="bg-[#0B0F19] border-t border-rzp-border p-3 space-y-2">
          <span className="text-[11px] font-semibold text-rzp-textMuted">Simulate Customer Reply:</span>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleSendText("Haan, main abhi payment link se pay kar deta hoon.")}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-all"
            >
              "Pay Now"
            </button>

            <button
              onClick={() => handleSendText("Main Friday tak pay kar dunga, calendar reminder daal do.")}
              className="bg-rzp-gold/10 hover:bg-rzp-gold/20 text-rzp-gold border border-rzp-gold/30 px-2.5 py-1 rounded-lg transition-all"
            >
              "Promise to Pay (Friday)"
            </button>

            <button
              onClick={() => handleSendText("Kya koi discount offer hai?")}
              className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg transition-all"
            >
              "Ask for Discount"
            </button>

            <button
              onClick={() => handleSendText("Please mujhe call mat karo. STOP calls.")}
              className="bg-rzp-rose/10 hover:bg-rzp-rose/20 text-rzp-rose border border-rzp-rose/30 px-2.5 py-1 rounded-lg transition-all"
            >
              "Opt Out / DND"
            </button>
          </div>

          {/* Custom Response Input */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              placeholder="Type custom Hinglish customer response..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendText()}
              className="flex-1 bg-rzp-card border border-rzp-border focus:border-rzp-blue text-xs text-slate-100 rounded-xl px-3.5 py-2 outline-none"
            />
            <button
              onClick={() => handleSendText()}
              className="p-2 bg-rzp-blue hover:bg-blue-600 text-white rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
