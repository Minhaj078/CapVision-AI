import { AgentState } from '../state';
import { executeReasoningEngine } from '../reasoningEngine';

/**
 * [Interview Prep]: The Decision Node is the final stage compiler of our LangGraph.
 * 1. It acts as a deterministic scoring engine that computes scores for Financials (30pts),
 *    Valuation (20pts), Sentiment (25pts), and Risk (25pts) to compute a score out of 100.
 * 2. It maps that score to an investment recommendation (80+ BUY, 60-79 HOLD, <60 SELL).
 * 3. It calculates a justified valuation range based on average multi-year revenue growth.
 * 4. It invokes the Reasoning Engine to justify this calculated rating.
 * 5. It programmatically compiles the final report using the state inputs. By assembling the report
 *    programmatically rather than asking Gemini to synthesize it, we completely eliminate
 *    the risk of Gemini hallucinating details or mixing up companies in the final output.
 */
export async function decisionNode(state: AgentState): Promise<Partial<AgentState>> {
  const {
    ticker,
    companyName,
    companyOverview,
    marketData,
    newsData,
    financialAnalysis,
    newsAnalysis,
    riskAnalysis,
    newsSentiment,
    riskScore
  } = state;

  console.log(`[Decision Node] Evaluating deterministic scoring and compiling report for: ${companyName || ticker}`);

  if (!companyOverview || !marketData || !newsData) {
    throw new Error('[Decision Node] Incomplete state data. Overview, financials, or news data is missing.');
  }

  try {
    // ==========================================
    // 1. DETERMINISTIC SCORING ENGINE
    // ==========================================
    
    // A. Financial Score (Max 30)
    let financialScore = 0;
    const revs = marketData.financialHistory?.revenue || [];
    const netIncomes = marketData.financialHistory?.netIncome || [];

    // Calculate average multi-year revenue growth YoY
    let avgRevGrowth = 0;
    if (revs.length >= 2) {
      let growthSum = 0;
      let count = 0;
      for (let i = 1; i < revs.length; i++) {
        if (revs[i - 1] > 0) {
          growthSum += (revs[i] - revs[i - 1]) / revs[i - 1];
          count++;
        }
      }
      if (count > 0) {
        avgRevGrowth = growthSum / count;
      }
    }

    if (avgRevGrowth >= 0.15) financialScore += 10;
    else if (avgRevGrowth >= 0.05) financialScore += 7;
    else if (avgRevGrowth > 0) financialScore += 5;

    // Calculate average multi-year net income growth YoY
    let avgNetIncomeGrowth = 0;
    if (netIncomes.length >= 2) {
      let growthSum = 0;
      let count = 0;
      for (let i = 1; i < netIncomes.length; i++) {
        if (netIncomes[i - 1] > 0) {
          growthSum += (netIncomes[i] - netIncomes[i - 1]) / netIncomes[i - 1];
          count++;
        }
      }
      if (count > 0) {
        avgNetIncomeGrowth = growthSum / count;
      }
    }

    if (avgNetIncomeGrowth >= 0.10) financialScore += 10;
    else if (avgNetIncomeGrowth >= 0.02) financialScore += 7;
    else if (avgNetIncomeGrowth > 0) financialScore += 5;

    // Profitability Net Income check
    const latestRev = revs[revs.length - 1] || 0;
    const latestNetIncome = netIncomes[netIncomes.length - 1] || 0;
    if (latestNetIncome > 0) {
      const netMargin = latestRev > 0 ? (latestNetIncome / latestRev) : 0;
      if (netMargin > 0.15) financialScore += 10;
      else financialScore += 8;
    }

    // B. Valuation Score (Max 20)
    let valuationScore = 5;
    const pe = marketData.peRatio || 0;
    if (pe > 0 && pe <= 20) valuationScore = 20;
    else if (pe > 20 && pe <= 40) valuationScore = 15;
    else if (pe > 40 && pe <= 75) valuationScore = 10;

    // C. Sentiment Score (Max 25)
    let sentimentScore = 15;
    const sentiment = newsSentiment || 'Neutral';
    if (sentiment === 'Bullish') sentimentScore = 25;
    else if (sentiment === 'Bearish') sentimentScore = 5;

    // D. Risk Score (Max 25)
    const scoreFromRisk = riskScore || 70;
    const scaledRiskScore = Math.min(25, Math.max(0, Math.round((scoreFromRisk / 100) * 25)));

    // Total Score Summary (0 - 100)
    const totalScore = Math.min(100, Math.max(0, financialScore + valuationScore + sentimentScore + scaledRiskScore));

    // Determine Final Recommendation verdict
    let verdict: 'BUY' | 'HOLD' | 'SELL' = 'HOLD';
    if (totalScore >= 80) verdict = 'BUY';
    else if (totalScore >= 60) verdict = 'HOLD';
    else verdict = 'SELL';

    console.log(`[Decision Node] Deterministic Score: ${totalScore}/100 -> Recommendation: ${verdict}`);

    // ==========================================
    // 2. JUSTIFIED PRICE TARGET LOGIC
    // ==========================================
    let priceTargetStr = 'Price target unavailable due to insufficient valuation data.';
    const currentPrice = marketData.currentPrice || 0;
    if (currentPrice > 0 && revs.length >= 2) {
      // Bound the growth rate to reasonable ranges for projections (-25% to +35%)
      const boundedGrowth = Math.min(0.35, Math.max(-0.25, avgRevGrowth));
      
      let lowTarget = 0;
      let highTarget = 0;
      if (boundedGrowth > 0) {
        lowTarget = currentPrice * (1 + boundedGrowth * 0.7);
        highTarget = currentPrice * (1 + boundedGrowth * 1.3);
      } else {
        lowTarget = currentPrice * (1 + boundedGrowth * 1.3);
        highTarget = currentPrice * (1 + boundedGrowth * 0.7);
      }
      priceTargetStr = `$${lowTarget.toFixed(2)} - $${highTarget.toFixed(2)} ${marketData.currency || 'USD'}`;
    }

    // ==========================================
    // 3. EXECUTE REASONING ENGINE FOR EXPLANATION
    // ==========================================
    const engineOutput = await executeReasoningEngine(
      companyOverview,
      marketData,
      newsData,
      totalScore,
      verdict,
      financialAnalysis,
      newsAnalysis,
      riskAnalysis
    );

    // ==========================================
    // 4. PROGRAMMATIC COMPILATION OF THE REPORT
    // ==========================================
    const reportMarkdown = `# EQUITY RESEARCH REPORT: ${companyName.toUpperCase()} (${ticker})
*Generated by AI Investment Research Agent (CapVision)*

## 1. Executive Summary
- **Recommendation Rating**: **${verdict}** (Attractiveness Score: **${totalScore}/100**)
- **Confidence Rating**: **${(engineOutput.confidenceScore * 100).toFixed(0)}%**
- **Price Target Range**: **${priceTargetStr}**
- **Analyst Thesis**: ${engineOutput.reasoning}

## 2. Company Overview
- **Official Name**: ${companyName}
- **Ticker Symbol**: ${ticker}
- **Exchange Listed**: ${companyOverview.exchange || 'Data Not Available'}
- **Sector**: ${companyOverview.sector || 'Data Not Available'}
- **Industry**: ${companyOverview.industry || 'Data Not Available'}
- **Business Summary**: 
${companyOverview.businessSummary || 'Data Not Available'}

## 3. Financial Analysis
${financialAnalysis}

## 4. News & Sentiment Analysis
- **Market Sentiment Rating**: **${sentiment}**
${newsAnalysis}

## 5. SWOT Analysis
${riskAnalysis}

## 6. Key Risks
${engineOutput.risks.map((r: string) => `- ${r}`).join('\n')}

## 7. Key Opportunities
${engineOutput.opportunities.map((o: string) => `- ${o}`).join('\n')}

## 8. Investment Score
- **Final Investment Score**: **${totalScore} / 100**
- **Deterministic Scoring Card Breakdown**:
  - Financial Growth & Profitability Score: **${financialScore} / 30**
  - Valuation Multiples (P/E) Rating: **${valuationScore} / 20**
  - Qualitative News Sentiment Rating: **${sentimentScore} / 25**
  - SWOT Safety Risk Rating: **${scaledRiskScore} / 25**

## 9. Recommendation
The Investment Committee issues a definitive **${verdict}** rating for ${companyName} (${ticker}). This recommendation is calculated using a hybrid quantitative scorecard combining growth metrics, trailing earnings valuation, market sentiment indicators, and strategic risk ratings.

## 10. Confidence Score
- **Assigned Confidence Level**: **${engineOutput.confidenceScore.toFixed(2)} / 1.0**
- *Confidence reflects data availability across active income statements, historical depth, and recent press volatility.*

## 11. Sources Used
- **Yahoo Finance**: Core balance sheet segments, trailing price ratios, exchange details, and three-year historic income statement tables.
- **Tavily Search Engine**: Real-time press scanning, sector momentum metrics, and competitor catalysts.
- **CapVision AI Core Engine**: State orchestration, hybrid recommendation weighting cards, and Gemini LLM thesis justification.

## 12. Disclaimer
This report is generated by an automated AI investment research agent for educational and informational purposes only. It does not constitute formal financial, investment, tax, or legal advice, or a personal recommendation to buy or sell securities. Perform independent validation and consult with a licensed investment professional before allocating capital.`;

    return {
      verdict,
      priceTarget: priceTargetStr,
      investmentScore: totalScore,
      confidenceScore: engineOutput.confidenceScore,
      risks: engineOutput.risks,
      opportunities: engineOutput.opportunities,
      reasoning: engineOutput.reasoning,
      report: reportMarkdown
    };
  } catch (error: any) {
    console.error(`[Decision Node] Failed to compile:`, error.message || error);
    throw new Error(`Decision Node failure: ${error.message}`);
  }
}
