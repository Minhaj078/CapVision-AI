import { executeReasoningEngine } from '../reasoningEngine';
import { ai } from '../../services/gemini';
export async function decisionNode(state) {
    const { ticker, companyName, companyOverview, marketData, newsData, financialAnalysis, newsAnalysis, riskAnalysis } = state;
    console.log(`[Decision Node] Executing reasoning engine for: ${companyName || ticker}`);
    if (!companyOverview || !marketData || !newsData) {
        throw new Error('[Decision Node] Incomplete state data. Overview, financials, or news data is missing.');
    }
    try {
        // 1. Run the reasoning engine to get structured JSON outputs (score, verdict, thesis, risk list)
        const engineOutput = await executeReasoningEngine(companyOverview, marketData, newsData);
        // 2. Pre-calculate the price target (5% - 15% upside target range)
        const calculatedPriceTarget = `$${(marketData.currentPrice * 1.05).toFixed(2)} - $${(marketData.currentPrice * 1.15).toFixed(2)}`;
        // 3. Format a prompt to compile the final publication report using these outputs
        const prompt = `
You are the Investment Director. Synthesize a publication-quality Equity Investment Research Report for ${companyName} (${ticker}) based on these evaluations:

### Attractiveness Rating:
- Investment Score: ${engineOutput.investmentScore}/100
- Recommendation Rating: ${engineOutput.recommendation}
- Confidence Rating: ${engineOutput.confidenceScore}/1.0
- Key Opportunities: ${engineOutput.opportunities.join(', ')}
- Key Risks: ${engineOutput.risks.join(', ')}

### Subagent Analyses:
- Financial Performance:
${financialAnalysis}

- Market Sentiment:
${newsAnalysis}

- Risk Assessment:
${riskAnalysis}

Analyze these details and compile a single, comprehensive Markdown report. Start with section header details:

# EQUITY RESEARCH REPORT: ${companyName.toUpperCase()} (${ticker})
## 1. Executive Summary & Recommendation
- State the final rating: ${engineOutput.recommendation} (Attractiveness Score: ${engineOutput.investmentScore}/100)
- Price Target Range: ${calculatedPriceTarget}
- Short thesis summary: ${engineOutput.reasoning}

## 2. Financial Performance & Trends
## 3. Qualitative Drivers & Sentiment
## 4. Strategic Risk Analysis (SWOT)
## 5. Valuation Analysis & Final Verdict
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return {
            verdict: engineOutput.recommendation,
            priceTarget: calculatedPriceTarget,
            investmentScore: engineOutput.investmentScore,
            risks: engineOutput.risks,
            opportunities: engineOutput.opportunities,
            reasoning: engineOutput.reasoning,
            report: response.text || '# EQUITIES REPORT COMPILATION FAILURE'
        };
    }
    catch (error) {
        console.error(`[Decision Node] Failed to compile:`, error.message || error);
        throw new Error(`Decision Node failure: ${error.message}`);
    }
}
