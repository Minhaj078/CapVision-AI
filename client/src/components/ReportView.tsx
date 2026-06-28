import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Printer,
  DollarSign,
  TrendingUp,
  Award,
  Percent,
  BarChart3,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Newspaper,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import type { MockReport } from '../dummyData';

interface ReportViewProps {
  report: MockReport;
}

export function ReportView({ report }: ReportViewProps) {
  const [chartTab, setChartTab] = useState<'income' | 'balance'>('income');

  const { financialData } = report;
  const { financials, metrics } = financialData;

  // Setup data in millions for charts
  const chartData = financials.years.map((year, index) => ({
    year,
    Revenue: financials.revenue[index] ? financials.revenue[index] / 1e9 : 0,
    NetIncome: financials.netIncome[index] ? financials.netIncome[index] / 1e9 : 0,
    TotalCash: financials.totalCash[index] ? financials.totalCash[index] / 1e9 : 0,
    TotalDebt: financials.totalDebt[index] ? financials.totalDebt[index] / 1e9 : 0,
  }));

  const formatLargeNum = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  const handlePrint = () => {
    window.print();
  };

  // Get color configurations based on the investment verdict
  const getVerdictStyle = (v?: string) => {
    const clean = (v || 'HOLD').toUpperCase();
    if (clean === 'BUY') {
      return {
        badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        text: 'text-emerald-400',
        bar: 'bg-emerald-500'
      };
    } else if (clean === 'SELL') {
      return {
        badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        text: 'text-rose-400',
        bar: 'bg-rose-500'
      };
    }
    return {
      badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      text: 'text-amber-400',
      bar: 'bg-amber-500'
    };
  };

  const styles = getVerdictStyle(report.verdict);
  const score = report.investmentScore || 50;

  return (
    <div className="w-full rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl mt-8 print:border-none print:bg-white print:text-black print:p-0">
      
      {/* Header Panel */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-5 mb-6 print:border-black/10">
        <div>
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase print:text-indigo-600">
            Investment Research Synthesis
          </span>
          <h2 className="font-display text-2xl font-extrabold text-white mt-1 print:text-black">
            {report.companyName} ({report.ticker})
          </h2>
          <p className="text-xs text-slate-400 mt-1 print:text-black/60">
            Sector: {financialData.sector} &bull; Industry: {financialData.industry} &bull; Listed on {financialData.exchange}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 active:scale-95 transition-all print:hidden"
        >
          <Printer size={14} />
          <span>Print Report</span>
        </button>
      </div>

      {/* Attractiveness Verdict Dashboard Section */}
      {report.verdict && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-white/5 pb-6">
          {/* Verdict Box */}
          <div className="rounded-xl border border-white/5 bg-slate-950/20 p-5 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Committee Rating</div>
              <div className="flex items-center gap-3 mt-3">
                <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-extrabold tracking-wider ${styles.badge}`}>
                  {report.verdict}
                </span>
                <div className="text-xs text-slate-400">
                  Target Price: <span className="font-semibold text-white">{report.priceTarget || 'N/A'}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              Issued based on quantitative financials, leverage checks, and news catalysts.
            </p>
          </div>

          {/* Investment Score Card */}
          <div className="rounded-xl border border-white/5 bg-slate-950/20 p-5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attractiveness Score</div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className={`text-3xl font-extrabold ${styles.text}`}>{score}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            
            {/* Horizontal progress indicator bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3.5">
              <div className={`h-2 rounded-full transition-all duration-500 ${styles.bar}`} style={{ width: `${score}%` }} />
            </div>
            <div className="text-[10px] text-slate-500 mt-3">
              100 represents a completely risk-adjusted buy option.
            </div>
          </div>

          {/* Short Thesis/Reasoning Summary */}
          <div className="rounded-xl border border-white/5 bg-slate-950/20 p-5 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Director Thesis Summary</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed italic">
                "{report.reasoning}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 print:grid-cols-5 print:gap-2">
        <div className="rounded-xl border border-white/5 bg-slate-950/20 p-4 flex gap-3 items-center print:border-black/10 print:bg-black/5">
          <div className="rounded-lg bg-cyan-500/10 p-2.5 text-cyan-400 print:bg-cyan-600/10 print:text-cyan-600">
            <DollarSign size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price</div>
            <div className="text-sm font-extrabold text-white mt-0.5 print:text-black">
              ${financialData.currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/20 p-4 flex gap-3 items-center print:border-black/10 print:bg-black/5">
          <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-400 print:bg-purple-600/10 print:text-purple-600">
            <TrendingUp size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Market Cap</div>
            <div className="text-sm font-extrabold text-white mt-0.5 print:text-black">
              {formatLargeNum(financialData.marketCap)}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/20 p-4 flex gap-3 items-center print:border-black/10 print:bg-black/5">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400 print:bg-emerald-600/10 print:text-emerald-600">
            <Award size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ROE</div>
            <div className="text-sm font-extrabold text-white mt-0.5 print:text-black">
              {(metrics.returnOnEquity * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/20 p-4 flex gap-3 items-center print:border-black/10 print:bg-black/5">
          <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400 print:bg-amber-600/10 print:text-amber-600">
            <Percent size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Net Margin</div>
            <div className="text-sm font-extrabold text-white mt-0.5 print:text-black">
              {(metrics.profitMargin * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/20 p-4 flex gap-3 items-center print:border-black/10 print:bg-black/5">
          <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-400 print:bg-indigo-600/10 print:text-indigo-600">
            <BarChart3 size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">P/E Ratio</div>
            <div className="text-sm font-extrabold text-white mt-0.5 print:text-black">
              {financialData.peRatio ? financialData.peRatio.toFixed(1) : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* SWOT Opportunities and Risks split layout */}
      {report.risks && report.opportunities && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Opportunities Section */}
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 text-emerald-400 mb-3.5">
              <ShieldCheck size={18} />
              <h4 className="font-display text-sm font-bold uppercase tracking-wider">Primary Opportunities</h4>
            </div>
            <ul className="flex flex-col gap-2">
              {report.opportunities.map((opp, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                  <span className="text-emerald-400 font-bold mt-0.5">&bull;</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks Section */}
          <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-5">
            <div className="flex items-center gap-2 text-rose-400 mb-3.5">
              <ShieldAlert size={18} />
              <h4 className="font-display text-sm font-bold uppercase tracking-wider">Key Risks Factors</h4>
            </div>
            <ul className="flex flex-col gap-2">
              {report.risks.map((risk, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                  <span className="text-rose-400 font-bold mt-0.5">&bull;</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Historical financial graphs panel */}
      <div className="rounded-xl border border-white/5 bg-slate-950/30 p-5 mb-8 print:hidden">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Financial Statement History ($ Billions)
          </h4>
          
          <div className="flex rounded-lg bg-slate-950 p-1 border border-white/5">
            <button
              onClick={() => setChartTab('income')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                chartTab === 'income' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Income Statement
            </button>
            <button
              onClick={() => setChartTab('balance')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                chartTab === 'balance' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Balance Sheet
            </button>
          </div>
        </div>

        <div className="w-full h-[220px]">
          {chartTab === 'income' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="year" stroke="#475569" style={{ fontSize: '10px' }} />
                <YAxis stroke="#475569" style={{ fontSize: '10px' }} />
                <Tooltip contentStyle={{ background: '#090a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="top" height={36} style={{ fontSize: '11px' }} />
                <Area name="Revenue" type="monotone" dataKey="Revenue" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                <Area name="Net Profit" type="monotone" dataKey="NetIncome" stroke="#a855f7" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="year" stroke="#475569" style={{ fontSize: '10px' }} />
                <YAxis stroke="#475569" style={{ fontSize: '10px' }} />
                <Tooltip contentStyle={{ background: '#090a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="top" height={36} style={{ fontSize: '11px' }} />
                <Bar name="Total Cash" dataKey="TotalCash" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar name="Total Debt" dataKey="TotalDebt" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Styled Markdown Content */}
      <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed 
        prose-headings:font-display prose-headings:font-bold prose-headings:text-white
        prose-h1:text-xl prose-h1:border-b prose-h1:border-white/5 prose-h1:pb-2 prose-h1:mb-4
        prose-h2:text-base prose-h2:text-cyan-400 prose-h2:mt-6 prose-h2:mb-3
        prose-p:mb-4
        prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-4
        prose-table:w-full prose-table:border-collapse prose-table:my-5
        prose-th:bg-slate-900 prose-th:px-4 prose-th:py-2.5 prose-th:text-left prose-th:font-semibold prose-th:text-white prose-th:border-b prose-th:border-white/10
        prose-td:px-4 prose-td:py-2.5 prose-td:border-b prose-td:border-white/5
        print:text-black print:prose-headings:text-black print:prose-th:bg-black/5 print:prose-th:border-black/20 print:prose-td:border-black/10"
      >
        <ReactMarkdown>{report.report}</ReactMarkdown>
      </div>

      {/* News Coverage Deck Section */}
      {report.newsArticles && report.newsArticles.length > 0 && (
        <div className="mt-10 border-t border-white/5 pt-8 print:hidden">
          <div className="flex items-center gap-2 text-indigo-400 mb-5">
            <Newspaper size={18} />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider">Latest Live News Scraped</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.newsArticles.map((art, idx) => (
              <a
                key={idx}
                href={art.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-white/5 bg-slate-950/20 p-4 transition-all hover:bg-slate-800/20 hover:border-indigo-500/20"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">{art.source}</span>
                    <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h4 className="text-xs font-semibold text-white mt-1.5 leading-snug group-hover:text-indigo-200 transition-colors">
                    {art.title}
                  </h4>
                </div>
                {art.summary && (
                  <p className="text-[10px] text-slate-500 mt-2.5 line-clamp-2">
                    {art.summary}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimers details */}
      <div className="mt-8 border-t border-white/5 pt-4 flex gap-3 text-[11px] text-slate-500 leading-relaxed print:border-black/10 print:text-black/60">
        <AlertCircle size={16} className="flex-shrink-0 text-slate-600" />
        <p>
          <strong>Compliance Disclaimer:</strong> This document represents an automated AI investment analysis report compiled via Yahoo Finance tools and Gemini reasoning. It is not formal investment advice or recommendation to purchase securities. Maintain absolute prudence before allocating financial capital.
        </p>
      </div>
    </div>
  );
}

export default ReportView;
