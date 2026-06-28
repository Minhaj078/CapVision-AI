import { AgentState } from '../state.js';
import { getMarketData } from '../tools/marketData.js';
import { ai, generateContentWithRetry } from '../../services/gemini.js';

/**
 * [Interview Prep]: The Financial Node isolates the quantitative assessment.
 * By querying Yahoo Finance directly and passing structured ratios to Gemini,
 * we ensure the model does not hallucinate financial numbers or growth rates.
 * The strict grounding rules prevent the LLM from relying on stale or out-of-domain knowledge.
 */
export async function financialNode(state: AgentState): Promise<Partial<AgentState>> {
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

CRITICAL ANTI-HALLUCINATION INSTRUCTIONS:
- Use ONLY the supplied financial data above.
- Never use prior knowledge.
- Never invent products, business segments, financial metrics, future plans, or revenue streams.
- If information is unavailable, explicitly write "Data Not Available".
- Never confuse the current company ${companyName} (${ticker}) with any other company (e.g. do not mention Apple products or NVIDIA unless that is the company under analysis).

Format in clean markdown. Start with a direct financial health review and then provide a structured table listing these metrics for readability.
`;

    const response = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return {
      marketData,
      financialAnalysis: response.text || 'No financial analysis compiled.'
    };
  } catch (error: any) {
    console.error(`[Financial Node] Error for ${ticker}:`, error.message || error);
    throw new Error(`Financial Node failure: ${error.message}`);
  }
}
