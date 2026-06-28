import { StateGraph } from '@langchain/langgraph';
import { AgentStateAnnotation } from './state';
import { researchNode } from './nodes/researchNode';
import { financialNode } from './nodes/financialNode';
import { newsNode } from './nodes/newsNode';
import { riskNode } from './nodes/riskNode';
import { decisionNode } from './nodes/decisionNode';
// Assemble the State Graph
const workflow = new StateGraph(AgentStateAnnotation)
    // 1. Add all functional nodes to the graph
    .addNode('research', researchNode)
    .addNode('financial', financialNode)
    .addNode('news', newsNode)
    .addNode('risk', riskNode)
    .addNode('decision', decisionNode)
    // 2. Configure edges (start -> research -> financials -> news -> risk -> decision -> end)
    .addEdge('__start__', 'research')
    .addEdge('research', 'financial')
    .addEdge('financial', 'news')
    .addEdge('news', 'risk')
    .addEdge('risk', 'decision')
    .addEdge('decision', '__end__');
// Compile the workflow
export const graph = workflow.compile();
