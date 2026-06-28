import { Cpu, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative overflow-hidden py-10 sm:py-16 text-center">
      {/* Abstract background glow blobs */}
      <div className="absolute top-0 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl rounded-full" />
      
      <div className="mx-auto max-w-3xl px-4">
        {/* Badge Indicator */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-xs font-medium text-indigo-300 mb-6">
          <Sparkles size={12} className="text-indigo-400" />
          <span>LangGraph Multi-Agent Architecture</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-none">
          Automated Equity Research
          <span className="block mt-3 bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Powered by AI Agents
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          CapVision orchestrates specialized AI agents to crawl financial statements, mine news catalysts, analyze risk vectors, and construct institutional-grade investment reports in real-time.
        </p>

        {/* Action Quick Stats */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-cyan-400" />
            <span>Gemini 2.5 Pro Inference</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div>SEC Filings & Yahoo Data</div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div>SWOT Risk Matrix</div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
