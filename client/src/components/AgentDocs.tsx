import { useState } from 'react';
import { Cpu, Landmark, Newspaper, ShieldAlert, CheckSquare, GitMerge, FileText } from 'lucide-react';

interface NodeDoc {
  id: string;
  name: string;
  icon: any;
  role: string;
  inputs: string[];
  outputs: string[];
  groundingRule: string;
}

const NODES_DATA: NodeDoc[] = [
  {
    id: 'research',
    name: 'Research Node',
    icon: Cpu,
    role: 'Resolves query to standard ticker using local registry lookup or Yahoo Finance Search. Retrieves the primary asset overview, exchange listing, sector, industry, and description summaries.',
    inputs: ['companyQuery (User Input)'],
    outputs: ['ticker', 'companyName', 'description', 'companyOverview'],
    groundingRule: 'Resolves query to validated standard market listing before starting pipeline.'
  },
  {
    id: 'financial',
    name: 'Financial Node',
    icon: Landmark,
    role: 'Fetches multi-year income statements, current stock prices, EPS, P/E ratios, and market cap databases via Yahoo Finance quotes modules. Evaluates topline and bottom-line trends.',
    inputs: ['ticker', 'companyName'],
    outputs: ['marketData', 'financialAnalysis'],
    groundingRule: 'Must use ONLY the supplied quantitative tables. Stricter instruction to write "Data Not Available" rather than speculating on missing metrics.'
  },
  {
    id: 'news',
    name: 'News Node',
    icon: Newspaper,
    role: 'Scrapes recent press releases and articles using Tavily Search API or Yahoo Search. Extracts key market catalysts, momentum headwinds, and computes news sentiment.',
    inputs: ['ticker', 'companyName'],
    outputs: ['newsData', 'newsSentiment', 'newsAnalysis'],
    groundingRule: 'Prohibits relying on historical knowledge. Restricts sentiment categories strictly to Bullish, Neutral, or Bearish.'
  },
  {
    id: 'risk',
    name: 'Risk Node',
    icon: ShieldAlert,
    role: 'Synthesizes financial analyses and qualitative sentiment drivers to perform a strategic SWOT analysis. Quantifies corporate risk exposure onto a safety score scale.',
    inputs: ['description', 'financialAnalysis', 'newsAnalysis'],
    outputs: ['riskScore', 'riskAnalysis'],
    groundingRule: 'Restricts threats to facts derived from the active state, preventing LLMs from fabricating generic risk factors.'
  },
  {
    id: 'decision',
    name: 'Decision Node',
    icon: CheckSquare,
    role: 'Runs the hybrid quantitative scoring card (0-100) and recommendation logic (BUY/HOLD/SELL). Estimates growth-justified price ranges and programmatically compiles the 12 report chapters.',
    inputs: ['all previous state properties'],
    outputs: ['verdict', 'priceTarget', 'investmentScore', 'confidenceScore', 'risks', 'opportunities', 'reasoning', 'report'],
    groundingRule: 'Calculates verdict and price target ranges mathematically, forcing Gemini to solely write explanations. Assembles markdown programmatically.'
  }
];

export function AgentDocs() {
  const [activeTab, setActiveTab] = useState('research');
  const activeNode = NODES_DATA.find(n => n.id === activeTab) || NODES_DATA[0];
  const IconComponent = activeNode.icon;

  return (
    <div className="w-full rounded-2xl border border-white/5 bg-slate-900/20 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
      {/* Title */}
      <div className="border-b border-white/5 pb-5 mb-8">
        <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
          Agent System Blueprint
        </span>
        <h2 className="font-display text-2xl font-extrabold text-white mt-1">
          Stateful LangGraph.js Architecture
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Our investment research engine is modeled as a Directed Acyclic Graph (DAG) using 
          <strong> LangGraph.js</strong>. By representing subagents as stateful nodes, we coordinate
          parallel executions, join concurrent outputs, and maintain a strict memory state.
        </p>
      </div>

      {/* Visual Workflow Cards */}
      <div className="mb-10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5">
          Execution DAG Flow Chart
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Card 1 */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex flex-col gap-2 relative">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Cpu size={18} />
              <h4 className="text-sm font-bold">1. Research Node</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resolves query to ticker, fetches company metadata profiles.
            </p>
            <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-indigo-400 font-bold">
              &rarr;
            </div>
          </div>

          {/* Cards 2 & 3 in parallel */}
          <div className="md:col-span-2 grid grid-rows-2 gap-3 relative">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex flex-col gap-2 relative">
              <div className="flex items-center gap-2.5 text-cyan-400">
                <Landmark size={18} />
                <h4 className="text-sm font-bold">2A. Financial Analyst</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parallel Node: Pulls balance sheets, ratios, and EBITDA tables.
              </p>
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 flex flex-col gap-2 relative">
              <div className="flex items-center gap-2.5 text-purple-400">
                <Newspaper size={18} />
                <h4 className="text-sm font-bold">2B. News Miner</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parallel Node: Scrapes catalysts and computes sentiment.
              </p>
            </div>
            <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-cyan-400 font-bold">
              &rarr;
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col gap-2 relative">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <ShieldAlert size={18} />
              <h4 className="text-sm font-bold">3. Risk Evaluator</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              SWOT compiler and safety rating score calculator.
            </p>
          </div>
        </div>

        {/* Unified Compiler Link */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-lg bg-slate-950 border border-white/5 px-4 py-2 text-xs text-slate-400">
            <GitMerge size={14} className="text-indigo-400 animate-pulse" />
            <span>Join Edge (Risk + Financial + News)</span>
            <span className="text-slate-600">&bull;</span>
            <FileText size={14} className="text-emerald-400" />
            <span>Consolidated into Decision Compiler Node</span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Subagent Node Specifications
        </h3>
        
        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/5 pb-4">
          {NODES_DATA.map((node) => {
            const NodeIcon = node.icon;
            const isActive = activeTab === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setActiveTab(node.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15 scale-[1.02]'
                    : 'bg-slate-950/60 text-slate-400 border border-white/5 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <NodeIcon size={14} />
                <span>{node.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="rounded-xl border border-white/5 bg-slate-950/50 p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <IconComponent size={20} />
              </div>
              <h4 className="font-display text-base font-bold text-white">
                {activeNode.name} Profile
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {activeNode.role}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Inputs Read From State</h5>
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.inputs.map((inp, idx) => (
                    <span key={idx} className="rounded bg-slate-900 border border-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 font-mono">
                      {inp}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Outputs Written To State</h5>
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.outputs.map((out, idx) => (
                    <span key={idx} className="rounded bg-indigo-950/40 border border-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 font-mono">
                      {out}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 border-t md:border-t-0 md:border-l border-white/5 pt-5 md:pt-0 md:pl-6 flex flex-col justify-between">
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Factual Grounding Rule</h5>
              <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-4">
                <p className="text-xs text-indigo-300 leading-relaxed italic">
                  "{activeNode.groundingRule}"
                </p>
              </div>
            </div>
            <div className="mt-5 text-[10px] text-slate-500 leading-relaxed">
              *All prompt modules declare `Use ONLY supplied data` and `Never invent products` ensuring 100% company isolation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentDocs;
