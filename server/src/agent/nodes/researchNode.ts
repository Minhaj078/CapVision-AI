import { AgentState } from '../state';
import { getCompanyOverview, resolveTicker } from '../tools/companyOverview';

/**
 * [Interview Prep]: The Research Node acts as the entry point of the pipeline.
 * It is responsible for ticker resolution (e.g. converting a name like "Apple" into the ticker symbol "AAPL")
 * using the search tool, and then retrieving the company's asset profile and metadata.
 * This guarantees all subsequent nodes in the DAG have a validated ticker symbol.
 */
export async function researchNode(state: AgentState): Promise<Partial<AgentState>> {
  const query = state.companyQuery;
  console.log(`[Research Node] Resolving ticker details for query: "${query}"`);

  try {
    // 1. Resolve company name/query to a stock ticker
    const resolved = await resolveTicker(query);
    
    // 2. Fetch the company overview/profile using the resolved ticker
    const overview = await getCompanyOverview(resolved.ticker);
    console.log(`[Research Node] Successfully resolved and loaded: ${overview.name} (${overview.ticker})`);

    return {
      ticker: overview.ticker,
      companyName: overview.name,
      description: overview.businessSummary,
      companyOverview: overview
    };
  } catch (error: any) {
    console.error(`[Research Node] Error resolving profile for "${query}":`, error.message || error);
    throw new Error(`Research Node failure: ${error.message}`);
  }
}
