import { ai } from '../services/gemini';
/**
 * Reasoning Engine: Evaluates financials, news, and profiles using Gemini to issue a typed investment verdict.
 */
export async function executeReasoningEngine(overview, marketData, news) {
    console.log(`[Reasoning Engine] Analyzing company data for: ${overview.name} (${overview.ticker})`);
    const prompt = `
You are the Investment Committee Director. Evaluate the investment case for ${overview.name} (${overview.ticker}) based on the following research inputs:

### 1. Company Overview & Industry
- Sector: ${overview.sector}
- Industry: ${overview.industry}
- Business Description: ${overview.businessSummary}

### 2. Quantitative Financials & Ratios
- Current Stock Price: ${marketData.currentPrice} ${marketData.currency}
- Market Capitalization: ${marketData.marketCap.toLocaleString()}
- PE Ratio: ${marketData.peRatio || 'N/A'}
- EPS: ${marketData.eps || 'N/A'}
- Historical Annual Revenue (FY 21 -> FY 23): ${marketData.financialHistory.revenue.map(r => r.toLocaleString()).join(', ')}
- Historical Annual Net Income (FY 21 -> FY 23): ${marketData.financialHistory.netIncome.map(n => n.toLocaleString()).join(', ')}

### 3. Qualitative Market News
${news.articles.map((art, i) => `[Article #${i + 1}] Title: ${art.title} (Source: ${art.source}) - Summary: ${art.summary}`).join('\n')}

---

Conduct a rigorous risk-adjusted analysis. Issue:
1. An **Investment Score** between 1 and 100 (where 100 represents a risk-free, highly profitable vector).
2. A definitive **Investment Recommendation** (must be "BUY", "HOLD", or "SELL").
3. A **Confidence Score** between 0.0 and 1.0 based on the consistency of financials and news indicators.
4. Primary **Risks** (list 3-4 specific threats such as leverage, valuation, or competitive actions).
5. Primary **Opportunities** (list 3-4 expansion vectors, margins stabilization, or demand drivers).
6. A detailed **Reasoning** write-up (4-5 sentences explaining the synthesis of metrics, sentiment, and risks).
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                // Enforce returning a JSON string matching our typescript model schema
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        investmentScore: {
                            type: 'INTEGER',
                            description: 'An investment attractiveness score between 1 and 100.'
                        },
                        recommendation: {
                            type: 'STRING',
                            enum: ['BUY', 'HOLD', 'SELL'],
                            description: 'The final rating recommendation.'
                        },
                        confidenceScore: {
                            type: 'NUMBER',
                            description: 'A decimal confidence rating between 0.0 and 1.0.'
                        },
                        risks: {
                            type: 'ARRAY',
                            items: { type: 'STRING' },
                            description: 'Primary risk factors compiled for the stock.'
                        },
                        opportunities: {
                            type: 'ARRAY',
                            items: { type: 'STRING' },
                            description: 'Key opportunities or strategic growth catalysts.'
                        },
                        reasoning: {
                            type: 'STRING',
                            description: 'Analytical reasoning justifying the investment rating, metrics, and risks.'
                        }
                    },
                    required: [
                        'investmentScore',
                        'recommendation',
                        'confidenceScore',
                        'risks',
                        'opportunities',
                        'reasoning'
                    ]
                }
            }
        });
        const jsonText = response.text;
        if (!jsonText) {
            throw new Error('Received empty response from the Gemini reasoning engine.');
        }
        const output = JSON.parse(jsonText);
        console.log(`[Reasoning Engine] Analysis completed. Rating: ${output.recommendation} (Score: ${output.investmentScore}/100)`);
        return output;
    }
    catch (error) {
        console.error(`[Reasoning Engine] Compilation failed for ${overview.ticker}:`, error.message || error);
        throw new Error(`Reasoning Engine compilation failed: ${error.message}`);
    }
}
