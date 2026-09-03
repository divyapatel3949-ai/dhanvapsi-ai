export interface VoiceMessage {
  id: string;
  sender: 'AGENT' | 'USER';
  text: string;
  timestamp: string;
  actionRequested?: 'PAY_NOW' | 'PROMISE_DATE' | 'DISCOUNT_APPLIED' | 'OPT_OUT';
}

export interface VoiceSessionState {
  recordId: string;
  customerName: string;
  amount: number;
  invoiceId: string;
  messages: VoiceMessage[];
  status: 'IDLE' | 'CALLING' | 'IN_PROGRESS' | 'COMPLETED_PAID' | 'COMPLETED_PTP' | 'HALTED_OPT_OUT';
  ptpDate?: string;
}

export class HinglishVoiceAgent {
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;
    this.synth.cancel(); // Stop current speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly measured polite tone
    utterance.pitch = 1.0;

    // Search for Indian English or Hindi voice if available
    const voices = this.synth.getVoices();
    const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  }

  public stopSpeech() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public getInitialAgentGreeting(customerName: string, amount: number, invoiceId: string): string {
    const formattedAmount = amount.toLocaleString('en-IN');
    return `Namaste ${customerName}ji! Main DhanVapsi AI se baat kar raha hoon. Aapka overdue payment ₹${formattedAmount} for Invoice #${invoiceId} pending hai. Kya aap abhi UPI ya card se quick payment settle kar sakte hain?`;
  }

  public handleUserResponse(userText: string, currentSession: VoiceSessionState): { nextSession: VoiceSessionState; agentReply: string } {
    const lower = userText.toLowerCase();
    const nextSession = { ...currentSession, messages: [...currentSession.messages] };
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    nextSession.messages.push({
      id: `msg-${Date.now()}-u`,
      sender: 'USER',
      text: userText,
      timestamp: nowStr
    });

    let agentReply = '';

    if (lower.includes('stop') || lower.includes('dont call') || lower.includes('dnd') || lower.includes('unsubscribe') || lower.includes('opt out')) {
      agentReply = "Bilkul, humne aapki request note kar li hai. Aapko aage se is invoice ke regarding automated calls nahi aayenge. Have a great day!";
      nextSession.status = 'HALTED_OPT_OUT';
      nextSession.messages.push({
        id: `msg-${Date.now()}-a`,
        sender: 'AGENT',
        text: agentReply,
        timestamp: nowStr,
        actionRequested: 'OPT_OUT'
      });
    } else if (lower.includes('pay now') || lower.includes('link') || lower.includes('upi') || lower.includes('abhi')) {
      const formattedAmount = currentSession.amount.toLocaleString('en-IN');
      agentReply = `Bahut badiya! Main aapke registered mobile number par Instant Razorpay 1-Click Payment Link bhej raha hoon. Total amount ₹${formattedAmount}. Payment complete hote hi invoice auto-settle ho jayega. Thank you!`;
      nextSession.status = 'COMPLETED_PAID';
      nextSession.messages.push({
        id: `msg-${Date.now()}-a`,
        sender: 'AGENT',
        text: agentReply,
        timestamp: nowStr,
        actionRequested: 'PAY_NOW'
      });
    } else if (lower.includes('tomorrow') || lower.includes('friday') || lower.includes('next week') || lower.includes('later') || lower.includes('ptp') || lower.includes('parso')) {
      const pDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
      agentReply = `Dhanyawad! Maine aapka Promise-to-Pay (PTP) commitment ${pDate} ke liye log kar diya hai. Tab tak automated nudges pause rahenge. Verification email aapko send kar diya gaya hai.`;
      nextSession.status = 'COMPLETED_PTP';
      nextSession.ptpDate = pDate;
      nextSession.messages.push({
        id: `msg-${Date.now()}-a`,
        sender: 'AGENT',
        text: agentReply,
        timestamp: nowStr,
        actionRequested: 'PROMISE_DATE'
      });
    } else if (lower.includes('discount') || lower.includes('kam') || lower.includes('offer') || lower.includes('coupon')) {
      const discounted = Math.round(currentSession.amount * 0.95);
      agentReply = `Ji bilkul! Enterprise loyalty offer ke tehat hum aapko 5% instant discount offer kar rahe hain. Naya payable amount ₹${discounted.toLocaleString('en-IN')} hai. Main discount payment link SMS/WhatsApp kar raha hoon.`;
      nextSession.status = 'COMPLETED_PAID';
      nextSession.messages.push({
        id: `msg-${Date.now()}-a`,
        sender: 'AGENT',
        text: agentReply,
        timestamp: nowStr,
        actionRequested: 'DISCOUNT_APPLIED'
      });
    } else {
      agentReply = `Samajh gaya. Main aapki request Razorpay account manager ko escalate kar raha hoon. Kya aapko payment link SMS par bhej doon?`;
      nextSession.messages.push({
        id: `msg-${Date.now()}-a`,
        sender: 'AGENT',
        text: agentReply,
        timestamp: nowStr
      });
    }

    return { nextSession, agentReply };
  }
}
