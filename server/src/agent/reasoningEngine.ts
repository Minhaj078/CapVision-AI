import { ai, generateContentWithRetry } from '../services/gemini';
import { CompanyOverview } from './tools/companyOverview';
import { MarketData } from './tools/marketData';
import { NewsData } from './tools/latestNews';

export interface ReasoningEngineOutput {
  investmentScore: number; // Score between 1 and 100
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidenceScore: number; // Confidence score between 0.0 and 1.0
  risks: string[];
  opportunities: string[];
  reasoning: string;
}

/**
 * [Interview Prep]: The Reasoning Engine is designed to justify the final investment recommendation.
 * By computing the recommendation score deterministically in the decision node *before* invoking this engine,
 * we restrict Gemini to writing the analytical explanation/thesis and selecting key risks/opportunities.
 * This completely avoids the issue where LLMs write contradictory reports or ignore data to make arbitrary verdicts.
 */
export async function executeReasoningEngine(
  overview: CompanyOverview,
  marketData: MarketData,
  news: NewsData,
  predeterminedScore: number,
  predeterminedRecommendation: 'BUY' | 'HOLD' | 'SELL',
  financialAnalysis: string,
  newsAnalysis: string,
  riskAnalysis: string
): Promise<ReasoningEngineOutput> {
  console.log(`[Reasoning Engine] Analyzing company data for: ${overview.name} (${overview.ticker})`);

  const prompt = `
You are the Investment Committee Director. Explain and justify the predetermined investment rating and score for ${overview.name} (${overview.ticker}) using the research inputs.

### Committee Pre-Determination:
- Attractiveness Score: ${predeterminedScore}/100
- Final Recommendation: ${predeterminedRecommendation} (80-100 = BUY, 60-79 = HOLD, 0-59 = SELL)

### 1. Company Overview & Industry:
- Sector: ${overview.sector}
- Industry: ${overview.industry}
- Business Description: ${overview.businessSummary}

### 2. Quantitative Financials & Ratios:
- Current Stock Price: ${marketData.currentPrice} ${marketData.currency}
- Market Capitalization: ${marketData.marketCap.toLocaleString()}
- PE Ratio: ${marketData.peRatio || 'N/A'}
- EPS: ${marketData.eps || 'N/A'}
- Historical Annual Revenue (FY 21 -> FY 23): ${marketData.financialHistory.revenue.map(r => r.toLocaleString()).join(', ')}
- Historical Annual Net Income (FY 21 -> FY 23): ${marketData.financialHistory.netIncome.map(n => n.toLocaleString()).join(', ')}

### 3. Subagent Analyses:
- Financial Performance & Growth:
${financialAnalysis}

- Market Catalysts & Sentiment:
${newsAnalysis}

- Strategic Risk & SWOT Analysis:
${riskAnalysis}

---

Conduct a rigorous risk-adjusted analysis. Issue:
1. Confirm the pre-determined **Investment Score** (${predeterminedScore}) and **Investment Recommendation** ("${predeterminedRecommendation}").
2. A **Confidence Score** between 0.0 and 1.0 based on the consistency and availability of financials and news indicators.
3. Primary **Risks**: List 3-4 specific threats such as leverage, valuation, or competitive actions.
4. Primary **Opportunities**: List 3-4 expansion vectors, margins stabilization, or demand drivers.
5. A detailed **Reasoning** write-up (4-5 sentences explaining and synthesizing why the score of ${predeterminedScore} and rating of ${predeterminedRecommendation} are appropriate based on the inputs).

CRITICAL ANTI-HALLUCINATION INSTRUCTIONS:
- Use ONLY the supplied data above.
- Never use prior knowledge.
- Never invent products, business segments, financial metrics, future plans, or revenue streams.
- If information is unavailable, explicitly write "Data Not Available".
- Never confuse the current company ${overview.name} (${overview.ticker}) with any other company (e.g. do not mention iPhone, iOS, or iCloud if the company is NVIDIA).
- Ensure the final explanation perfectly matches the rating of "${predeterminedRecommendation}" and score of "${predeterminedScore}".
`;

  try {
    const response = await generateContentWithRetry({
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
              description: `Must be exactly the predetermined score: ${predeterminedScore}.`
            },
            recommendation: { 
              type: 'STRING', 
              enum: [predeterminedRecommendation],
              description: `Must be exactly the predetermined rating: ${predeterminedRecommendation}.`
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

    const output = JSON.parse(jsonText) as ReasoningEngineOutput;
    console.log(`[Reasoning Engine] Analysis completed. Rating: ${output.recommendation} (Score: ${output.investmentScore}/100)`);
    return {
      ...output,
      investmentScore: predeterminedScore, // Force override just in case
      recommendation: predeterminedRecommendation
    };
  } catch (error: any) {
    console.error(`[Reasoning Engine] Compilation failed for ${overview.ticker}:`, error.message || error);
    throw new Error(`Reasoning Engine compilation failed: ${error.message}`);
  }
}
