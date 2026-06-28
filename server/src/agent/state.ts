import { Annotation } from '@langchain/langgraph';
import { CompanyOverview } from './tools/companyOverview';
import { MarketData } from './tools/marketData';
import { NewsData } from './tools/latestNews';

export const AgentStateAnnotation = Annotation.Root({
  // Initial user input query
  companyQuery: Annotation<string>(),
  
  // Ticker and basic profiles resolved by the Research Node
  ticker: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  companyName: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  description: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),

  // Raw data payloads fetched by independent tools
  companyOverview: Annotation<CompanyOverview | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  marketData: Annotation<MarketData | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  newsData: Annotation<NewsData | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),

  // [Interview Prep]: newsSentiment allows newsNode to write back a structured assessment ("Bullish", "Neutral", "Bearish")
  // which is then consumed deterministically by the decisionNode scorecard calculation.
  newsSentiment: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => 'Neutral',
  }),
  
  // Analyses written by individual sub-nodes
  financialAnalysis: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  newsAnalysis: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  riskAnalysis: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),

  // [Interview Prep]: riskScore represents the safety/opportunity score (1-100) extracted from the riskNode
  // where a higher score denotes lower operational/market/regulatory risk. Used in hybrid decision.
  riskScore: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 70,
  }),
  
  // Synthesized outputs compiled by Decision Node
  verdict: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  priceTarget: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  investmentScore: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 50,
  }),
  confidenceScore: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0.5,
  }),
  risks: Annotation<string[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  opportunities: Annotation<string[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  reasoning: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  report: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
});

export type AgentState = typeof AgentStateAnnotation.State;
