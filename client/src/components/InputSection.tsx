import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (ticker: string) => void;
  isLoading: boolean;
}

export function InputSection({ onAnalyze, isLoading }: InputSectionProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = query.trim().toUpperCase();
    if (cleanTicker) {
      onAnalyze(cleanTicker);
    }
  };

  const handleChipClick = (ticker: string) => {
    setQuery(ticker);
    onAnalyze(ticker);
  };

  const suggestionChips = ['AAPL', 'NVDA', 'TSLA'];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          placeholder="Enter company ticker (e.g., AAPL, NVDA, TSLA)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          className="w-full rounded-xl bg-slate-900/60 border border-white/5 py-4 pl-5 pr-36 text-white text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm"
          maxLength={10}
        />
        <div className="absolute right-2">
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="mt-4 flex items-center justify-center gap-2.5 text-xs text-slate-500">
        <span>Try searching:</span>
        {suggestionChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChipClick(chip)}
            disabled={isLoading}
            className="rounded-md border border-white/5 bg-slate-950 px-2.5 py-1 font-semibold text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

export default InputSection;
