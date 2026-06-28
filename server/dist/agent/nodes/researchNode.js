import { getCompanyOverview } from '../tools/companyOverview';
export async function researchNode(state) {
    const query = state.companyQuery;
    console.log(`[Research Node] Fetching profile details for query: "${query}"`);
    try {
        // Invoke the Yahoo Finance tool to fetch overview details
        const overview = await getCompanyOverview(query);
        console.log(`[Research Node] Successfully resolved: ${overview.name} (${overview.ticker})`);
        return {
            ticker: overview.ticker,
            companyName: overview.name,
            description: overview.businessSummary,
            companyOverview: overview
        };
    }
    catch (error) {
        console.error(`[Research Node] Error resolving profile for "${query}":`, error.message || error);
        throw new Error(`Research Node failure: ${error.message}`);
    }
}
