import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn('[Gemini Service] Warning: GEMINI_API_KEY is not defined in the environment variables. Live API calls will fail.');
}
// Instantiate the Google Gen AI client
export const ai = new GoogleGenAI({ apiKey });
/**
 * Tests connection to the Gemini API.
 */
export async function testGeminiConnection() {
    if (!apiKey)
        return false;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Respond with "pong" to verify connectivity.'
        });
        const text = response.text ? response.text.trim() : '';
        console.log(`[Gemini Service] Connection check returned: "${text}"`);
        return true;
    }
    catch (error) {
        console.error('[Gemini Service] Connection test failed:', error.message || error);
        return false;
    }
}
/**
 * Invokes Gemini 2.5 Flash to construct a structured profile of a company.
 */
export async function analyzeCompany(companyName) {
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing. Configure it in your server/.env file.');
    }
    const cleanName = companyName.trim();
    console.log(`[Gemini Service] Requesting profile analysis for: "${cleanName}"`);
    const prompt = `
Analyze the public company "${cleanName}". Find its official stock ticker, sector, industry, approximate current stock price, currency, and evaluate its financial state.
Provide a clear executive summary (3-4 sentences) and a concise investment thesis (2-3 sentences).
Fill in their approximate year-over-year revenue growth, net profit margins, and operating margins as percentage strings (e.g. "12%", "25.5%").

Ensure all details represent the latest available public information.
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                // Enforce returning a parsed JSON output matching our schema
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        ticker: { type: 'STRING' },
                        companyName: { type: 'STRING' },
                        sector: { type: 'STRING' },
                        industry: { type: 'STRING' },
                        currentPrice: { type: 'NUMBER' },
                        currency: { type: 'STRING' },
                        summary: { type: 'STRING' },
                        investmentThesis: { type: 'STRING' },
                        metrics: {
                            type: 'OBJECT',
                            properties: {
                                revenueYoYGrowth: { type: 'STRING' },
                                profitMargin: { type: 'STRING' },
                                operatingMargin: { type: 'STRING' }
                            },
                            required: ['revenueYoYGrowth', 'profitMargin', 'operatingMargin']
                        }
                    },
                    required: [
                        'ticker',
                        'companyName',
                        'sector',
                        'industry',
                        'currentPrice',
                        'currency',
                        'summary',
                        'investmentThesis',
                        'metrics'
                    ]
                }
            }
        });
        const jsonText = response.text;
        if (!jsonText) {
            throw new Error('Received an empty response from Gemini API.');
        }
        const parsedData = JSON.parse(jsonText);
        return parsedData;
    }
    catch (error) {
        console.error(`[Gemini Service] Error analyzing company "${cleanName}":`, error.message || error);
        throw new Error(`Gemini analysis failed: ${error.message || error}`);
    }
}
