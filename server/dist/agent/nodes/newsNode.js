import { getLatestNews } from '../tools/latestNews';
import { ai } from '../../services/gemini';
export async function newsNode(state) {
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
1. The overall market sentiment rating (Bullish, Neutral, or Bearish) and justify.
2. The top 2 qualitative catalysts shaping stock expectations.
3. Near-term price momentum tailwinds or headwinds.

Format in clean, structured markdown.
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return {
            newsData,
            newsAnalysis: response.text || 'No news analysis available.'
        };
    }
    catch (error) {
        console.error(`[News Node] Error for ${ticker}:`, error.message || error);
        throw new Error(`News Node failure: ${error.message}`);
    }
}
