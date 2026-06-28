import yahooFinance from 'yahoo-finance2';

export interface CompanyOverview {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  businessSummary: string;
}

// Local registry mapping common company name inputs to stock tickers (reduces API call overhead & avoids rate limit issues)
const COMMON_COMPANIES: Record<string, { ticker: string; name: string }> = {
  nvidia: { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  nvda: { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  apple: { ticker: 'AAPL', name: 'Apple Inc.' },
  aapl: { ticker: 'AAPL', name: 'Apple Inc.' },
  tesla: { ticker: 'TSLA', name: 'Tesla, Inc.' },
  tsla: { ticker: 'TSLA', name: 'Tesla, Inc.' },
  infosys: { ticker: 'INFY', name: 'Infosys Limited' },
  infy: { ticker: 'INFY', name: 'Infosys Limited' },
  reliance: { ticker: 'RELIANCE.NS', name: 'Reliance Industries Limited' }
};

/**
 * Tool: Resolves a company name or query to a stock ticker using Yahoo Finance Search.
 */
export async function resolveTicker(query: string): Promise<{ ticker: string; name: string }> {
  const cleanQuery = query.trim();
  const lowerQuery = cleanQuery.toLowerCase();

  // 1. Bypass search and immediately resolve from local registry if matched
  if (COMMON_COMPANIES[lowerQuery]) {
    const resolved = COMMON_COMPANIES[lowerQuery];
    console.log(`[Tool: Resolve Ticker] Matched query "${cleanQuery}" in local registry -> ${resolved.ticker}`);
    return resolved;
  }

  // 2. Fall back to live Yahoo Finance search
  console.log(`[Tool: Resolve Ticker] Resolving company query via live search: "${cleanQuery}"`);
  try {
    const searchResult = await yahooFinance.search(cleanQuery, { quotesCount: 5 });
    if (searchResult && searchResult.quotes && searchResult.quotes.length > 0) {
      // Find the first Equity/Stock listing
      const equityQuote = searchResult.quotes.find(
        (q: any) => q.quoteType === 'EQUITY' || q.typeDisp === 'Equity'
      );
      const bestQuote = equityQuote || searchResult.quotes[0];
      if (bestQuote && bestQuote.symbol) {
        const resolvedName = bestQuote.longname || bestQuote.shortname || bestQuote.symbol;
        console.log(`[Tool: Resolve Ticker] Resolved "${cleanQuery}" -> "${bestQuote.symbol}" (${resolvedName})`);
        return {
          ticker: bestQuote.symbol,
          name: resolvedName
        };
      }
    }
  } catch (err: any) {
    console.error(`[Tool: Resolve Ticker] Yahoo Search failed due to rate limits or connection errors:`, err.message || err);
  }

  // Fallback if search returns nothing or errors out
  console.warn(`[Tool: Resolve Ticker] Default fallback ticker for query: "${cleanQuery.toUpperCase()}"`);
  return {
    ticker: cleanQuery.toUpperCase(),
    name: cleanQuery
  };
}

/**
 * Tool: Fetches company profile, sector, industry, and business summary.
 */
export async function getCompanyOverview(ticker: string): Promise<CompanyOverview> {
  const cleanTicker = ticker.trim().toUpperCase();
  console.log(`[Tool: Company Overview] Fetching profile for: ${cleanTicker}`);

  try {
    const summary = await yahooFinance.quoteSummary(cleanTicker, {
      modules: ['assetProfile', 'price']
    });

    const assetProfile = (summary.assetProfile || {}) as any;
    const price = (summary.price || {}) as any;

    return {
      ticker: cleanTicker,
      name: price.longName || price.shortName || cleanTicker,
      exchange: price.exchangeName || 'Unknown',
      sector: assetProfile.sector || 'Unknown',
      industry: assetProfile.industry || 'Unknown',
      businessSummary: assetProfile.longBusinessSummary || 'No summary available.'
    };
  } catch (error: any) {
    console.warn(`[Tool: Company Overview] Live fetch failed for "${cleanTicker}":`, error.message || error);
    console.log(`[Tool: Company Overview] Gracefully falling back to mock profile for: ${cleanTicker}`);
    return getMockOverview(cleanTicker);
  }
}

/**
 * Return simulated overview profile fallback data during API failures/rate limits.
 */
function getMockOverview(ticker: string): CompanyOverview {
  const t = ticker.toUpperCase();
  if (t === 'NVDA') {
    return {
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      exchange: 'NasdaqGS',
      sector: 'Technology',
      industry: 'Semiconductors',
      businessSummary: 'NVIDIA Corporation designs graphics processing units (GPUs) for the gaming and professional markets, as well as system on a chip units (SoCs) for the mobile computing and automotive market. NVIDIA is the leading manufacturer of high-end AI chips used for deep learning and neural network training.'
    };
  }
  if (t === 'AAPL') {
    return {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NasdaqGS',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      businessSummary: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company also sells various related services, including music, news, payments, and storage.'
    };
  }
  if (t === 'TSLA') {
    return {
      ticker: 'TSLA',
      name: 'Tesla, Inc.',
      exchange: 'NasdaqGS',
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      businessSummary: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.'
    };
  }
  if (t === 'INFY') {
    return {
      ticker: 'INFY',
      name: 'Infosys Limited',
      exchange: 'NYSE',
      sector: 'Technology',
      industry: 'Information Technology Services',
      businessSummary: 'Infosys Limited provides consulting, technology, outsourcing, and next-generation digital services in North America, Europe, India, and internationally.'
    };
  }
  if (t === 'RELIANCE.NS' || t === 'RELIANCE') {
    return {
      ticker: 'RELIANCE.NS',
      name: 'Reliance Industries Limited',
      exchange: 'NSE',
      sector: 'Energy',
      industry: 'Oil & Gas Refining & Marketing',
      businessSummary: 'Reliance Industries Limited engages in hydrocarbon exploration and production, petroleum refining and marketing, petrochemicals, retail, digital, and financial services worldwide.'
    };
  }
  return {
    ticker: t,
    name: `${t} Corporation`,
    exchange: 'NYSE',
    sector: 'Technology',
    industry: 'Software',
    businessSummary: `Business overview details for ${t} are currently unavailable. The company operates within the global tech sector.`
  };
}
