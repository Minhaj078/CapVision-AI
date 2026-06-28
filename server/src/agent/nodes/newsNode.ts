import { AgentState } from '../state.js';
import { getLatestNews } from '../tools/latestNews.js';
import { ai, generateContentWithRetry } from '../../services/gemini.js';

/**
 * [Interview Prep]: The News Node isolates qualitative research.
 * It fetches the latest news via Tavily (search) or Yahoo Finance, and prompts
 * Gemini under strict grounding to extract key stock catalysts and a structured
 * sentiment rating. Using a JSON schema response guarantees we can extract the sentiment
 * rating ("Bullish", "Neutral", "Bearish") deterministically.
 */
export async function newsNode(state: AgentState): Promise<Partial<AgentState>> {
  const { ticker, companyName } = state;
  console.log(`[News Node] Extracting news updates for: ${companyName || ticker}`);

  try {
    // 1. Fetch live articles from Tavily/Yahoo Finance tools
    const newsData = await getLatestNews(ticker, companyName);

    // 2. Format articles for the Gemini prompt
    const articlesPromptList = newsData.articles.map((art, i) => {
      return `[Article #${i + 1}]
Title: ${art.title}
Source: ${art.source}
Summary: ${art.summary}
---`;
    }).join('\n');

    const prompt = `
You are a qualitative market analyst. Evaluate the following recent news developments for ${companyName} (${ticker}):

${articlesPromptList}

Summarize:
1. The overall market sentiment rating (must be Bullish, Neutral, or Bearish) and justify.
2. The top 2 qualitative catalysts shaping stock expectations.
3. Near-term price momentum tailwinds or headwinds.

CRITICAL ANTI-HALLUCINATION INSTRUCTIONS:
- Use ONLY the supplied news articles data above.
- Never use prior knowledge.
- Never invent products, business segments, financial metrics, future plans, or revenue streams.
- If information is unavailable, explicitly write "Data Not Available".
- Never confuse the current company ${companyName} (${ticker}) with any other company (e.g. do not mention Apple products or NVIDIA unless that is the company under analysis).

Format your output as a JSON object matching the requested schema. The "analysis" field should contain clean, structured markdown.
`;

    const response = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            sentiment: {
              type: 'STRING',
              enum: ['Bullish', 'Neutral', 'Bearish'],
              description: 'The overall qualitative sentiment rating.'
            },
            analysis: {
              type: 'STRING',
              description: 'Markdown text summarizing sentiment, catalysts, and momentum.'
            }
          },
          required: ['sentiment', 'analysis']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error('Received empty response from the Gemini news node.');
    }

    const output = JSON.parse(jsonText) as { sentiment: string; analysis: string };
    console.log(`[News Node] Sentiment resolved: ${output.sentiment}`);

    return {
      newsData,
      newsSentiment: output.sentiment,
      newsAnalysis: output.analysis || 'No news analysis available.'
    };
  } catch (error: any) {
    console.error(`[News Node] Error for ${ticker}:`, error.message || error);
    throw new Error(`News Node failure: ${error.message}`);
  }
}
