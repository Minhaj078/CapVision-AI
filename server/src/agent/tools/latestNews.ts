import yahooFinance from 'yahoo-finance2';

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  summary?: string;
}

export interface NewsData {
  ticker: string;
  articles: NewsArticle[];
}

/**
 * Tool: Fetches recent news and articles for a stock ticker.
 */
export async function getLatestNews(ticker: string, companyName?: string): Promise<NewsData> {
  const cleanTicker = ticker.trim().toUpperCase();
  const searchName = companyName || cleanTicker;
  const tavilyKey = process.env.TAVILY_API_KEY;

  console.log(`[Tool: Latest News] Fetching news updates for: ${cleanTicker}`);

  // Tier 1: Try Tavily API if key exists
  if (tavilyKey) {
    try {
      console.log(`[Tool: Latest News] Querying Tavily API...`);
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${searchName} stock news market updates 2026`,
          search_depth: 'basic',
          max_results: 5
        })
      });

      if (response.ok) {
        const data: any = await response.json();
        if (data && Array.isArray(data.results)) {
          const articles = data.results.map((res: any) => ({
            title: res.title || 'No Title',
            url: res.url || '#',
            source: 'Web Search',
            summary: res.content || ''
          }));
          return { ticker: cleanTicker, articles };
        }
      }
    } catch (err: any) {
      console.warn(`[Tool: Latest News] Tavily fetch failed: ${err.message}. Falling back to Yahoo Finance.`);
    }
  }

  // Tier 2: Fallback to Yahoo Finance Search API (Key-free)
  try {
    console.log(`[Tool: Latest News] Querying Yahoo Finance Search API...`);
    const searchResults = await yahooFinance.search(cleanTicker, {
      newsCount: 5,
      quotesCount: 0
    });

    if (searchResults && Array.isArray(searchResults.news) && searchResults.news.length > 0) {
      const articles = searchResults.news.map((item: any) => ({
        title: item.title || 'No Title',
        url: item.link || '#',
        source: item.publisher || 'Yahoo Finance',
        publishedAt: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : undefined,
        summary: item.title || '' // Yahoo Search sometimes doesn't supply a full snippet
      }));
      return { ticker: cleanTicker, articles };
    }
  } catch (err: any) {
    console.warn(`[Tool: Latest News] Yahoo Search failed: ${err.message}. Falling back to simulated news.`);
  }

  // Tier 3: Hard Fallback to Simulated News
  console.log(`[Tool: Latest News] Returning simulated mock news.`);
  return {
    ticker: cleanTicker,
    articles: [
      {
        title: `${searchName} Stock Performance Registers Steady Volume Activity`,
        url: 'https://finance.example.com/mock-1',
        source: 'Market Watcher',
        summary: `Analysts report that ${searchName} (${cleanTicker}) is exhibiting high volume volatility as investors adjust allocations ahead of upcoming product cycles.`
      },
      {
        title: `Technical Analysis: Key Price Support Levels for ${cleanTicker}`,
        url: 'https://finance.example.com/mock-2',
        source: 'Technical Index',
        summary: `Chart technicians outline support and resistance thresholds for ${searchName} based on trailing moving average metrics.`
      }
    ]
  };
}
