import { TrendingUp, FileSearch, ArrowLeftRight } from 'lucide-react';

export function EmptyResult() {
  return (
    <div className="w-full rounded-2xl border border-white/5 bg-slate-900/20 p-10 backdrop-blur-sm text-center max-w-2xl mx-auto mt-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/50 border border-white/5 text-indigo-400 mb-6">
        <FileSearch size={24} />
      </div>
      
      <h2 className="font-display text-lg font-bold text-white mb-2">
        Awaiting Investment Ticker
      </h2>
      <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
        Input a stock ticker (e.g. AAPL, NVDA, TSLA) to compile the equity report. CapVision will run subagents to fetch live financials and generate qualitative research insights.
      </p>

      {/* Feature grid list */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-8 text-left">
        <div className="flex gap-3">
          <div className="text-indigo-400 mt-0.5">
            <TrendingUp size={16} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Financial History</h4>
            <p className="text-[11px] text-slate-500 mt-1">Multi-year statements, profit margins, and balance sheet ratios.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="text-indigo-400 mt-0.5">
            <ArrowLeftRight size={16} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Risk Matrix</h4>
            <p className="text-[11px] text-slate-500 mt-1">SWOT profiling covering competitive, operational, and policy threats.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="text-indigo-400 mt-0.5">
            <FileSearch size={16} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">CFA Synthesis</h4>
            <p className="text-[11px] text-slate-500 mt-1">Conclusive target price and Buy/Hold/Sell thesis.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyResult;
