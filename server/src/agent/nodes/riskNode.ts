import { AgentState } from '../state';
import { ai, generateContentWithRetry } from '../../services/gemini';

/**
 * [Interview Prep]: The Risk Node performs SWOT analysis and risk quantification.
 * It reads the financial analysis and news analysis from the state, runs after both of
 * them have completed, and prompts Gemini to synthesise strengths, weaknesses, opportunities,
 * and threats. It returns a risk score (higher is safer) used in our hybrid recommendation model.
 */
export async function riskNode(state: AgentState): Promise<Partial<AgentState>> {
  const { ticker, companyName, description, financialAnalysis, newsAnalysis } = state;
  console.log(`[Risk Node] Mapping strategic threats for: ${companyName || ticker}`);

  const prompt = `
You are a corporate risk management consultant. Conduct a thorough risk and strategic SWOT analysis for ${companyName} (${ticker}).

Use the following background details gathered by our other research nodes:
- Company Business: ${description}
- Financial Overview: ${financialAnalysis}
- Market Catalysts: ${newsAnalysis}

Analyze:
1. **SWOT Matrix**: Map out Strengths, Weaknesses, Opportunities, and Threats.
2. **Key Risk Factors**: Outline primary operational risks, competitive risks, and regulatory/policy challenges.

CRITICAL ANTI-HALLUCINATION INSTRUCTIONS:
- Use ONLY the supplied data above.
- Never use prior knowledge.
- Never invent products, business segments, financial metrics, future plans, or revenue streams.
- If information is unavailable, explicitly write "Data Not Available".
- Never confuse the current company ${companyName} (${ticker}) with any other company (e.g. do not mention Apple products or NVIDIA unless that is the company under analysis).

Format your output as a JSON object matching the requested schema. The "riskAnalysis" field should contain clean, structured markdown.
Evaluate and output a "riskScore" from 1 to 100, where 100 represents negligible/no operational risks (extremely safe) and 1 represents extreme distress or bankruptcy risk.
`;

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            riskScore: {
              type: 'INTEGER',
              description: 'A safety/risk rating from 1 to 100, where higher is less risky.'
            },
            riskAnalysis: {
              type: 'STRING',
              description: 'Markdown text describing SWOT and risk factors.'
            }
          },
          required: ['riskScore', 'riskAnalysis']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error('Received empty response from the Gemini risk node.');
    }

    const output = JSON.parse(jsonText) as { riskScore: number; riskAnalysis: string };
    console.log(`[Risk Node] SWOT riskScore resolved: ${output.riskScore}/100`);

    return {
      riskScore: output.riskScore,
      riskAnalysis: output.riskAnalysis || 'No risk assessment available.'
    };
  } catch (error: any) {
    console.error(`[Risk Node] Error:`, error.message || error);
    return {
      riskScore: 50, // safe default
      riskAnalysis: `Failed to complete strategic risk analysis: ${error.message}`
    };
  }
}
