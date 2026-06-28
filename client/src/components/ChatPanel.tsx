import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import type { MockReport } from '../dummyData';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  report: MockReport;
}

export function ChatPanel({ report }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Reset messages when report company changes
  useEffect(() => {
    setMessages([]);
  }, [report.ticker]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMessage = input.trim();
    if (!cleanMessage || sending) return;

    // 1. Append user bubble
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: cleanMessage
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    // 2. Dynamic Q&A answering grounded on the report data
    setTimeout(() => {
      const queryLower = cleanMessage.toLowerCase();
      let replyContent = '';

      if (queryLower.includes('risk') || queryLower.includes('threat') || queryLower.includes('danger') || queryLower.includes('weakness')) {
        const risksList = report.risks && report.risks.length > 0
          ? report.risks.map((r, i) => `${i + 1}. ${r}`).join('\n')
          : 'Data Not Available';
        replyContent = `Here are the primary risk factors evaluated for ${report.companyName} (${report.ticker}):\n\n${risksList}`;
      } else if (queryLower.includes('opportunity') || queryLower.includes('growth') || queryLower.includes('catalyst') || queryLower.includes('upside')) {
        const oppsList = report.opportunities && report.opportunities.length > 0
          ? report.opportunities.map((o, i) => `${i + 1}. ${o}`).join('\n')
          : 'Data Not Available';
        replyContent = `Key strategic opportunities identified for ${report.companyName} (${report.ticker}):\n\n${oppsList}`;
      } else if (queryLower.includes('recommend') || queryLower.includes('buy') || queryLower.includes('sell') || queryLower.includes('hold') || queryLower.includes('score') || queryLower.includes('rating') || queryLower.includes('verdict')) {
        replyContent = `The Investment Committee assigned an attractiveness score of **${report.investmentScore}/100** resulting in a **${report.verdict}** recommendation rating for ${report.companyName}.\n\n*Thesis*: "${report.reasoning}"`;
      } else if (queryLower.includes('financial') || queryLower.includes('revenue') || queryLower.includes('net income') || queryLower.includes('p/e') || queryLower.includes('pe') || queryLower.includes('price')) {
        const fin = report.financialData;
        replyContent = `Financial snapshot for ${report.companyName} (${report.ticker}):\n- **Current Price**: $${fin.currentPrice.toFixed(2)} ${fin.currency}\n- **Market Capitalization**: $${(fin.marketCap / 1e9).toFixed(2)} Billion\n- **P/E Ratio**: ${fin.peRatio ? fin.peRatio.toFixed(1) : 'N/A'}\n- **Price Target**: ${report.priceTarget || 'N/A'}`;
      } else if (queryLower.includes('overview') || queryLower.includes('business') || queryLower.includes('sector') || queryLower.includes('industry') || queryLower.includes('summary')) {
        const fin = report.financialData;
        replyContent = `Company overview for ${report.companyName} (${report.ticker}):\n- **Sector**: ${fin.sector}\n- **Industry**: ${fin.industry}\n- **Exchange**: ${fin.exchange}\n- **Business Summary**: ${fin.description}`;
      } else {
        replyContent = `Based on the equity research report compiled for ${report.companyName} (${report.ticker}), the stock has an attractiveness score of **${report.investmentScore}/100** and a rating of **${report.verdict}**. Bounded projection range is **${report.priceTarget}**.\n\nIs there a specific section (e.g., financials, risks, opportunities, or SWOT) you would like me to summarize?`;
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: replyContent
      };

      setMessages(prev => [...prev, assistantMsg]);
      setSending(false);
    }, 1200);
  };

  return (
    <div className="w-full rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md shadow-xl mt-8">
      <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
        <Sparkles size={18} className="text-indigo-400" />
        <h3 className="font-display text-base font-bold text-white">
          Interactive Research Q&A
        </h3>
      </div>

      {/* Messages Box */}
      <div className="h-[280px] overflow-y-auto rounded-xl border border-white/5 bg-slate-950/40 p-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="m-auto text-center text-xs text-slate-500 max-w-[80%] leading-relaxed">
            Ask the AI Analyst specific follow-ups about {report.companyName} (e.g. "What are the core risks?", "Explain their profit margins", "Should I buy Apple?").
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white self-end rounded-br-sm'
                : 'bg-slate-800/60 text-slate-200 border border-white/5 self-start rounded-bl-sm'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {sending && (
          <div className="bg-slate-800/40 text-slate-400 border border-white/5 max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex items-center gap-2 self-start">
            <Loader2 className="animate-spin text-slate-400" size={14} />
            <span>Analyst is review metrics...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Form */}
      <form onSubmit={handleSend} className="mt-4 flex gap-3">
        <input
          type="text"
          placeholder={`Query details about ${report.ticker} report...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          className="flex-1 rounded-xl bg-slate-950/50 border border-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-all"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-indigo-600 px-4 py-3 text-white hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
