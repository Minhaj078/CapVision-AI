import { ai } from '../../services/gemini';
export async function riskNode(state) {
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

Format your findings in structured markdown. Keep it objective, balance internal bottlenecks against external risks, and avoid introductory notes.
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return {
            riskAnalysis: response.text || 'No risk assessment available.'
        };
    }
    catch (error) {
        console.error(`[Risk Node] Error:`, error.message || error);
        return {
            riskAnalysis: `Failed to complete strategic risk analysis: ${error.message}`
        };
    }
}
