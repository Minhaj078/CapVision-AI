import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InputSection from './components/InputSection';
import LoadingStepper from './components/LoadingStepper';
import type { StepInfo, StepStatus } from './components/LoadingStepper';
import EmptyResult from './components/EmptyResult';
import ReportView from './components/ReportView';
import ChatPanel from './components/ChatPanel';
import type { MockReport, CompanyFinanceData } from './dummyData';
import api from './api';
import AgentDocs from './components/AgentDocs';
import ApiSandbox from './components/ApiSandbox';

const INITIAL_STEPS: StepInfo[] = [
  { id: '1', title: 'Securing Disclosures', desc: 'Fetching balance sheets, operating flows, and liabilities.', status: 'pending' },
  { id: '2', title: 'Financial Analyst Node', desc: 'Evaluating EBITDA growth, equity returns, and metrics.', status: 'pending' },
  { id: '3', title: 'Sentiment Mining Node', desc: 'Scraping recent headlines for market trend sentiment.', status: 'pending' },
  { id: '4', title: 'Risk Evaluator Node', desc: 'Constructing SWOT profiles and regulatory threats.', status: 'pending' },
  { id: '5', title: 'Director Compiler Node', desc: 'Formatting target price range and final recommendation.', status: 'pending' }
];

export function App() {
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<StepInfo[]>(INITIAL_STEPS);
  const [report, setReport] = useState<MockReport | null>(null);

  const runLiveAnalysis = async (ticker: string) => {
    setLoading(true);
    setReport(null);
    
    // Reset steps to pending
    const resetSteps = INITIAL_STEPS.map(step => ({ ...step, status: 'pending' as StepStatus }));
    setSteps(resetSteps);

    // Step 1: Start immediately
    setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'running' as StepStatus } : s));

    // Simple visual progression that simulates subagent operations in the background
    let currentStep = 0;
    const progressInterval = setInterval(() => {
      if (currentStep < 4) {
        setSteps(prev => prev.map((s, i) => {
          if (i === currentStep) return { ...s, status: 'completed' as StepStatus };
          if (i === currentStep + 1) return { ...s, status: 'running' as StepStatus };
          return s;
        }));
        currentStep++;
      }
    }, 1500);

    try {
      console.log(`[App] Triggering live equity analysis for query: "${ticker}"`);
      const response = await api.post('/analyze', { ticker });
      const data = response.data;

      // Safely map backend state data to client's MockReport format
      const overview = data.companyOverview || {};
      const market = data.marketData || {};

      // Map financial statements history
      const revenueArray = market.financialHistory?.revenue || [];
      const netIncomeArray = market.financialHistory?.netIncome || [];
      const latestRevenue = revenueArray[revenueArray.length - 1] || 0;
      const latestNetIncome = netIncomeArray[netIncomeArray.length - 1] || 0;

      // growth calculation
      let revGrowth = 0;
      if (revenueArray.length >= 2) {
        const prevRev = revenueArray[revenueArray.length - 2];
        if (prevRev > 0) revGrowth = (latestRevenue - prevRev) / prevRev;
      }

      const profitMargin = latestRevenue > 0 ? latestNetIncome / latestRevenue : 0;

      const companyFinance: CompanyFinanceData = {
        ticker: data.ticker || ticker.toUpperCase(),
        name: data.companyName || overview.name || ticker.toUpperCase(),
        description: data.description || overview.businessSummary || 'No summary available.',
        sector: overview.sector || 'Unknown',
        industry: overview.industry || 'Unknown',
        exchange: overview.exchange || 'Unknown',
        currency: market.currency || 'USD',
        marketCap: market.marketCap || 0,
        peRatio: market.peRatio || 0,
        dividendYield: 0,
        beta: 1.0,
        financials: {
          revenue: revenueArray,
          netIncome: netIncomeArray,
          operatingCashflow: [],
          totalDebt: [],
          totalCash: [],
          years: market.financialHistory?.years || []
        },
        metrics: {
          profitMargin: profitMargin,
          operatingMargin: profitMargin * 1.1, 
          returnOnEquity: profitMargin * 1.5,
          revenueGrowth: revGrowth,
          ebitda: latestRevenue * 0.2
        },
        currentPrice: market.currentPrice || 0
      };

      const finalReport: MockReport = {
        id: `report-${Date.now()}`,
        ticker: data.ticker || ticker.toUpperCase(),
        companyName: data.companyName || overview.name || ticker.toUpperCase(),
        report: data.report || '',
        financialData: companyFinance,
        verdict: data.verdict || 'HOLD',
        investmentScore: data.investmentScore || 50,
        priceTarget: data.priceTarget || 'Price target unavailable',
        risks: data.risks || [],
        opportunities: data.opportunities || [],
        reasoning: data.reasoning || '',
        chatReplies: [],
        defaultChatReply: `Please ask me follow-ups about ${data.companyName || ticker}.`
      };

      clearInterval(progressInterval);
      setSteps(prev => prev.map(s => ({ ...s, status: 'completed' as StepStatus })));
      setReport(finalReport);
      setLoading(false);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error('[App] Failed to load analysis:', err);
      // Reset steps
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'pending' as StepStatus } : s));
      setLoading(false);
      alert(`Research compilation failed: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="min-height-screen bg-[#06070a] text-slate-100 flex flex-col font-sans scroll-smooth">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-16">
        
        {/* 1. Dashboard Section */}
        <section id="dashboard" className="scroll-mt-24 flex flex-col gap-6">
          {/* Banner Hero */}
          <Hero />

          {/* Input Control Block */}
          <InputSection onAnalyze={runLiveAnalysis} isLoading={loading} />

          {/* Pipeline Loader Stepper */}
          <LoadingStepper steps={steps} visible={loading} />

          {/* Results Panels */}
          {!loading && !report && <EmptyResult />}

          {!loading && report && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in print:grid-cols-1 print:gap-0">
              {/* Left Main Report Presentation */}
              <div className="lg:col-span-2">
                <ReportView report={report} />
              </div>

              {/* Right Chat Panel */}
              <div className="lg:col-span-1 sticky top-24 print:hidden">
                <ChatPanel report={report} />
              </div>
            </div>
          )}
        </section>

        {/* 2. Agent Documentation Section */}
        <section id="documentation" className="scroll-mt-24 border-t border-white/5 pt-16">
          <AgentDocs />
        </section>

        {/* 3. API Sandbox Section */}
        <section id="settings" className="scroll-mt-24 border-t border-white/5 pt-16 mb-10">
          <ApiSandbox />
        </section>

      </main>

      {/* Footer bar */}
      <footer className="w-full border-t border-white/5 bg-[#090a0f] py-6 text-center text-xs text-slate-600 mt-10 print:hidden">
        <p>&copy; {new Date().getFullYear()} CapVision AI. Built with React, Vite, and Tailwind CSS v4.</p>
      </footer>
    </div>
  );
}

export default App;
