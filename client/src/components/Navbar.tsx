import { TrendingUp, Cpu } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0b0c10]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/25">
              <TrendingUp size={22} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CapVision AI
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#dashboard" className="text-sm font-medium text-white transition hover:text-indigo-400">
              Dashboard
            </a>
            <a href="#documentation" className="text-sm font-medium text-slate-400 transition hover:text-indigo-400">
              Agent Docs
            </a>
            <a href="#settings" className="text-sm font-medium text-slate-400 transition hover:text-indigo-400">
              API Sandbox
            </a>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Agent Core Online</span>
            </div>

            <button className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white border border-white/5 transition hover:bg-slate-700">
              <Cpu size={14} />
              <span>Gemini v2.5</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
