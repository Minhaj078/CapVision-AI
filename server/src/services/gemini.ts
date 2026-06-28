import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    '[Gemini Service] Warning: GEMINI_API_KEY is not defined in the environment variables. Live API calls will fail.'
  );
}

// Instantiate the Google Gen AI client
export const ai = new GoogleGenAI({ apiKey });

/**
 * [Interview Prep]: Resilience engineering wrapper.
 * Retries Gemini requests with exponential backoff on transient errors (like 503 high demand or 429 rate limit).
 */
export async function generateContentWithRetry(options: any, retries = 3, delay = 1500): Promise<any> {
  let currentDelay = delay;
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(options);
    } catch (err: any) {
      const errStatus = err.status || (err.error && err.error.code) || 0;
      const isTransient = errStatus === 429 || errStatus === 503 || 
                          err.message?.includes('503') || err.message?.includes('429') ||
                          err.message?.includes('UNAVAILABLE') || err.message?.includes('high demand');
      
      if (isTransient && i < retries - 1) {
        console.warn(`[Gemini Service] Model busy/rate-limited (${errStatus || 'unspecified'}). Retrying in ${currentDelay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= 2;
      } else {
        throw err;
      }
    }
  }
}

export interface StructuredCompanyAnalysis {
  ticker: string;
  companyName: string;
  sector: string;
  industry: string;
  currentPrice: number;
  currency: string;
  summary: string;
  investmentThesis: string;
  metrics: {
    revenueYoYGrowth: string;
    profitMargin: string;
    operatingMargin: string;
  };
}

/**
 * Tests connection to the Gemini API.
 */
export async function testGeminiConnection(): Promise<boolean> {
  if (!apiKey) return false;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Respond with "pong" to verify connectivity.'
    });
    const text = response.text ? response.text.trim() : '';
    console.log(`[Gemini Service] Connection check returned: "${text}"`);
    return true;
  } catch (error: any) {
    console.error('[Gemini Service] Connection test failed:', error.message || error);
    return false;
  }
}

/**
 * Invokes Gemini 2.5 Flash to construct a structured profile of a company.
 */
export async function analyzeCompany(companyName: string): Promise<StructuredCompanyAnalysis> {
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

    const parsedData = JSON.parse(jsonText) as StructuredCompanyAnalysis;
    return parsedData;
  } catch (error: any) {
    console.error(`[Gemini Service] Error analyzing company "${cleanName}":`, error.message || error);
    throw new Error(`Gemini analysis failed: ${error.message || error}`);
  }
}
