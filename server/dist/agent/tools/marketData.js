import yahooFinance from 'yahoo-finance2';
/**
 * Tool: Fetches live price, PE, EPS, market cap, and revenue/net income histories.
 */
export async function getMarketData(ticker) {
    const cleanTicker = ticker.trim().toUpperCase();
    console.log(`[Tool: Market Data] Fetching financial ratios and histories for: ${cleanTicker}`);
    try {
        const summary = await yahooFinance.quoteSummary(cleanTicker, {
            modules: [
                'summaryDetail',
                'financialData',
                'defaultKeyStatistics',
                'incomeStatementHistory'
            ]
        });
        const summaryDetail = (summary.summaryDetail || {});
        const financialData = (summary.financialData || {});
        const keyStats = (summary.defaultKeyStatistics || {});
        const incomeHistory = summary.incomeStatementHistory?.incomeStatementHistory || [];
        // Map historical years, revenues, and net incomes (limit to last 3 periods)
        const years = incomeHistory.map((item) => {
            const date = item.endDate ? new Date(item.endDate) : null;
            return date ? date.getFullYear().toString() : 'N/A';
        }).reverse();
        const revenue = incomeHistory.map((item) => item.totalRevenue || 0).reverse();
        const netIncome = incomeHistory.map((item) => item.netIncome || 0).reverse();
        return {
            ticker: cleanTicker,
            currentPrice: financialData.currentPrice || summaryDetail.regularMarketPreviousClose || 0,
            marketCap: summaryDetail.marketCap || 0,
            peRatio: summaryDetail.trailingPE || 0,
            eps: keyStats.trailingEps || 0,
            currency: financialData.financialCurrency || 'USD',
            financialHistory: {
                years,
                revenue,
                netIncome
            }
        };
    }
    catch (error) {
        console.error(`[Tool: Market Data] Error for ${cleanTicker}:`, error.message || error);
        throw new Error(`Market data fetch failed: ${error.message}`);
    }
}
