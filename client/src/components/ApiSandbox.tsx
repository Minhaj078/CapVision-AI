import { useState, useEffect } from 'react';
import { Terminal, Loader2, Play, Info } from 'lucide-react';
import api from '../api';

type ApiType = 'analyze' | 'yahoo' | 'tavily';

const DEFAULT_REQUESTS: Record<ApiType, string> = {
  analyze: JSON.stringify({
    ticker: "NVDA"
  }, null, 2),
  yahoo: JSON.stringify({
    ticker: "AAPL",
    modules: ["assetProfile", "price", "financialData", "incomeStatementHistory"]
  }, null, 2),
  tavily: JSON.stringify({
    query: "NVIDIA stock news market catalysts 2026",
    search_depth: "basic",
    max_results: 3
  }, null, 2)
};

const SIMULATED_RESPONSES: Record<Exclude<ApiType, 'analyze'>, any> = {
  yahoo: {
    ticker: "AAPL",
    price: {
      regularMarketPrice: 182.30,
      currency: "USD",
      exchangeName: "NasdaqGS",
      longName: "Apple Inc."
    },
    assetProfile: {
      sector: "Technology",
      industry: "Consumer Electronics",
      longBusinessSummary: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide..."
    },
    defaultKeyStatistics: {
      trailingEps: 6.43
    },
    summaryDetail: {
      trailingPE: 28.5,
      marketCap: 2850000000000
    }
  },
  tavily: {
    query: "NVIDIA stock news market catalysts 2026",
    results: [
      {
        title: "NVIDIA Blackwell chips volume production scales for hyper-scalers",
        url: "https://finance.example.com/nvda-blackwell",
        content: "Tech analysts report massive capital deployments from Microsoft, Meta, and AWS for Blackwell accelerators driving Q1 earnings upside.",
        score: 0.98
      },
      {
        title: "NVIDIA quarterly gross margins steady at 75%",
        url: "https://marketnews.example.com/nvda-margins",
        content: "NVIDIA retains dominant pricing power with gross margins holding at historical highs despite rising foundry wafer costs.",
        score: 0.94
      }
    ]
  }
};

export function ApiSandbox() {
  const [selectedApi, setSelectedApi] = useState<ApiType>('analyze');
  const [requestBody, setRequestBody] = useState(DEFAULT_REQUESTS.analyze);
  const [responseBody, setResponseBody] = useState('// Click "Execute API Request" to see output.');
  const [executing, setExecuting] = useState(false);
  const [isError, setIsError] = useState(false);

  // Sync request body when API select changes
  useEffect(() => {
    setRequestBody(DEFAULT_REQUESTS[selectedApi]);
    setResponseBody('// Click "Execute API Request" to see output.');
    setIsError(false);
  }, [selectedApi]);

  const handleExecute = async () => {
    setExecuting(true);
    setResponseBody('// Processing payload in background...');
    setIsError(false);

    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(requestBody);
      } catch (err: any) {
        throw new Error(`Invalid request JSON syntax: ${err.message}`);
      }

      if (selectedApi === 'analyze') {
        // Execute ACTUAL backend route
        console.log(`[API Sandbox] Sending actual POST /api/analyze with payload:`, parsedPayload);
        const response = await api.post('/analyze', parsedPayload);
        setResponseBody(JSON.stringify(response.data, null, 2));
      } else {
        // Simulate external API providers (Yahoo / Tavily) returning structured JSONs
        await new Promise(resolve => setTimeout(resolve, 1000)); // simulate latency
        setResponseBody(JSON.stringify(SIMULATED_RESPONSES[selectedApi], null, 2));
      }
    } catch (error: any) {
      console.error(`[API Sandbox] Execution failed:`, error);
      setIsError(true);
      if (error.response?.data) {
        setResponseBody(JSON.stringify(error.response.data, null, 2));
      } else {
        setResponseBody(JSON.stringify({ error: error.message || 'Unknown request exception' }, null, 2));
      }
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/5 bg-slate-900/20 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
      {/* Title */}
      <div className="border-b border-white/5 pb-5 mb-8">
        <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
          Developer Tools
        </span>
        <h2 className="font-display text-2xl font-extrabold text-white mt-1">
          Interactive API Sandbox
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Test backend endpoints, inspect integration payloads, and explore schemas. 
          Selecting <code className="text-indigo-400 font-mono">POST /api/analyze</code> will invoke the live 
          LangGraph state machine on the server!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Control Panel */}
        <div className="lg:col-span-1 flex flex-col gap-5 bg-slate-950/40 p-5 rounded-xl border border-white/5">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Terminal size={14} className="text-indigo-400" />
              <span>Select Endpoint / API</span>
            </h3>
            
            {/* Radio selectors */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedApi('analyze')}
                className={`w-full flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all ${
                  selectedApi === 'analyze'
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                    : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="text-xs font-extrabold tracking-wider font-mono">POST /api/analyze</span>
                <span className="text-[10px] text-slate-500">Triggers multi-agent LangGraph workflow.</span>
              </button>

              <button
                onClick={() => setSelectedApi('yahoo')}
                className={`w-full flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all ${
                  selectedApi === 'yahoo'
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                    : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="text-xs font-extrabold tracking-wider font-mono">Yahoo Finance Module</span>
                <span className="text-[10px] text-slate-500">Query asset profiles, prices, and stats.</span>
              </button>

              <button
                onClick={() => setSelectedApi('tavily')}
                className={`w-full flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all ${
                  selectedApi === 'tavily'
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                    : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="text-xs font-extrabold tracking-wider font-mono">Tavily Search API</span>
                <span className="text-[10px] text-slate-500">Retrieves real-time market search index.</span>
              </button>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1">
              <Info size={12} className="text-cyan-400" />
              <span>Available Backends</span>
            </h4>
            <ul className="text-[10px] text-slate-400 flex flex-col gap-1.5">
              <li>&bull; **Gemini 2.5 Flash**: Orchestrates node inferences.</li>
              <li>&bull; **Yahoo Finance**: Supplies historical financials.</li>
              <li>&bull; **Tavily Search**: Scrapes momentum news articles.</li>
            </ul>
          </div>

          {/* Trigger button */}
          <button
            onClick={handleExecute}
            disabled={executing}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-indigo-500/20 active:scale-98 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer"
          >
            {executing ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Running State Graph...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Execute API Request</span>
              </>
            )}
          </button>
        </div>

        {/* Right JSON Editor & Response */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* JSON Request Body */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Request JSON Payload
            </label>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              disabled={executing}
              className="w-full h-[280px] rounded-lg bg-slate-950 border border-white/5 p-4 text-xs font-mono text-cyan-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* JSON Response Body */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Response Output
            </label>
            <pre className={`w-full h-[280px] rounded-lg bg-slate-950 border p-4 text-[10px] font-mono overflow-y-auto leading-relaxed ${
              isError
                ? 'border-rose-500/20 text-rose-400 bg-rose-950/5'
                : responseBody.startsWith('//')
                  ? 'border-white/5 text-slate-500'
                  : 'border-emerald-500/20 text-emerald-400 bg-emerald-950/5'
            }`}>
              <code>{responseBody}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiSandbox;
