import yahooFinance from 'yahoo-finance2';
/**
 * Tool: Fetches company profile, sector, industry, and business summary.
 */
export async function getCompanyOverview(ticker) {
    const cleanTicker = ticker.trim().toUpperCase();
    console.log(`[Tool: Company Overview] Fetching profile for: ${cleanTicker}`);
    try {
        const summary = await yahooFinance.quoteSummary(cleanTicker, {
            modules: ['assetProfile', 'price']
        });
        const assetProfile = (summary.assetProfile || {});
        const price = (summary.price || {});
        return {
            ticker: cleanTicker,
            name: price.longName || price.shortName || cleanTicker,
            exchange: price.exchangeName || 'Unknown',
            sector: assetProfile.sector || 'Unknown',
            industry: assetProfile.industry || 'Unknown',
            businessSummary: assetProfile.longBusinessSummary || 'No summary available.'
        };
    }
    catch (error) {
        console.error(`[Tool: Company Overview] Error for ${cleanTicker}:`, error.message || error);
        throw new Error(`Overview fetch failed: ${error.message}`);
    }
}
