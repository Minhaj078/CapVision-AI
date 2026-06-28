import { graph } from '../agent/graph';
/**
 * Controller: Triggers the live multi-agent LangGraph workflow for stock research.
 */
export async function analyzeTicker(req, res, next) {
    try {
        // Extract ticker from either query parameter or post body
        const ticker = (req.query.ticker || req.body.ticker);
        if (!ticker) {
            res.status(400).json({ error: 'Ticker symbol query or body parameter is required' });
            return;
        }
        const cleanTicker = ticker.trim().toUpperCase();
        console.log(`[Controller: Analyze] Initiating live LangGraph agent execution for: "${cleanTicker}"`);
        // Execute the compiled LangGraph state machine synchronously
        const finalState = await graph.invoke({
            companyQuery: cleanTicker
        });
        console.log(`[Controller: Analyze] Completed research run for: ${cleanTicker}. Verdict: ${finalState.verdict}`);
        // Return the entire consolidated agent state to the client
        res.json(finalState);
    }
    catch (error) {
        console.error('[Controller: Analyze] LangGraph invoke failed:', error.message || error);
        next(error); // Pass exception to central Express error handler
    }
}
