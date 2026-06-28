import { StateGraph } from '@langchain/langgraph';
import { AgentStateAnnotation, AgentState } from './state';
import { researchNode } from './nodes/researchNode';
import { financialNode } from './nodes/financialNode';
import { newsNode } from './nodes/newsNode';
import { riskNode } from './nodes/riskNode';
import { decisionNode } from './nodes/decisionNode';

/**
 * [Interview Prep - Why LangGraph?]:
 * LangGraph was chosen because it allows us to model agent interactions as a stateful Directed Acyclic Graph (DAG).
 * Unlike simple sequential linear chains (which require running all operations one-after-another), LangGraph
 * supports parallel branching (running news extraction and financial compilation in parallel to save time)
 * and structured join nodes that automatically wait for all upstream branches to complete.
 * 
 * Node Explanation:
 * 1. 'research': Resolves user query to a valid ticker and downloads the asset overview profile.
 * 2. 'financial': Fetches valuation ratios and historic statements, evaluating quantitative ratios.
 * 3. 'news': Gathers recent press articles and extracts sentiment (Bullish/Neutral/Bearish).
 * 4. 'risk': Runs after BOTH financial & news nodes are done, synthesising qualitative SWOT matrices.
 * 5. 'decision': Synthesises all previous node outputs, calculates deterministic score cards, and compiles the report.
 */

// Assemble the State Graph
const workflow = new StateGraph(AgentStateAnnotation)
  // 1. Add all functional nodes to the graph
  .addNode('research', researchNode)
  .addNode('financial', financialNode)
  .addNode('news', newsNode)
  .addNode('risk', riskNode)
  .addNode('decision', decisionNode)

  // 2. Configure edges to support parallel execution:
  // - Start with research node.
  // - research branches out to financial and news in parallel.
  // - Both financial and news join at risk (risk waits for both).
  // - Risk then passes down to decision.
  .addEdge('__start__', 'research')
  
  // Parallel branch from research
  .addEdge('research', 'financial')
  .addEdge('research', 'news')
  
  // Join branches at risk (LangGraph executes risk only when both branches have updated the state)
  .addEdge('financial', 'risk')
  .addEdge('news', 'risk')
  
  // Final pipeline progression
  .addEdge('risk', 'decision')
  .addEdge('decision', '__end__');

// Compile the workflow
export const graph = workflow.compile();
export type GraphType = typeof graph;
