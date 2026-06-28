import { getMarketData } from '../tools/marketData';
import { ai } from '../../services/gemini';
export async function financialNode(state) {
    const { ticker, companyName } = state;
    console.log(`[Financial Node] Retrieving financial records for: ${companyName || ticker}`);
    try {
        // 1. Fetch live metrics and income statements using Yahoo Finance tool
        const marketData = await getMarketData(ticker);
        // 2. Format financials for the Gemini prompt
        const prompt = `
You are a Chartered Financial Analyst. Analyze the financial statements and performance ratios of ${companyName} (${ticker}):

### Current Valuation:
- Stock Price: ${marketData.currentPrice} ${marketData.currency}
- Market Cap: $${(marketData.marketCap / 1e9).toFixed(2)} Billion
- Trailing PE Ratio: ${marketData.peRatio || 'N/A'}
- Trailing EPS: ${marketData.eps || 'N/A'}

### Multi-Year Performance:
- Fiscal Years: ${marketData.financialHistory.years.join(', ')}
- Revenue: ${marketData.financialHistory.revenue.map(r => '$' + (r / 1e9).toFixed(2) + 'B').join(', ')}
- Net Income: ${marketData.financialHistory.netIncome.map(n => '$' + (n / 1e9).toFixed(2) + 'B').join(', ')}

Review these metrics and provide a detailed analysis of:
1. Topline and bottom-line growth trends.
2. Profitability efficiency (PE relative to growth).
3. Strategic financial warnings or signs of stability.

Format in clean markdown. Start with a direct financial health review and then provide a structured table listing these metrics for readability.
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return {
            marketData,
            financialAnalysis: response.text || 'No financial analysis compiled.'
        };
    }
    catch (error) {
        console.error(`[Financial Node] Error for ${ticker}:`, error.message || error);
        throw new Error(`Financial Node failure: ${error.message}`);
    }
}
