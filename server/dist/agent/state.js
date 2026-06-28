import { Annotation } from '@langchain/langgraph';
export const AgentStateAnnotation = Annotation.Root({
    // Initial user input query
    companyQuery: Annotation(),
    // Ticker and basic profiles resolved by the Research Node
    ticker: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => '',
    }),
    companyName: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => '',
    }),
    description: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => '',
    }),
    // Raw data payloads fetched by independent tools
    companyOverview: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => null,
    }),
    marketData: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => null,
    }),
    newsData: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => null,
    }),
    // Analyses written by individual sub-nodes
    financialAnalysis: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => '',
    }),
    newsAnalysis: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => '',
    }),
    riskAnalysis: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => '',
    }),
    // Synthesized outputs compiled by Decision Node
    verdict: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => '',
    }),
    priceTarget: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => '',
    }),
    investmentScore: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => 50,
    }),
    risks: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => [],
    }),
    opportunities: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => [],
    }),
    reasoning: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => '',
    }),
    report: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => '',
    }),
});
