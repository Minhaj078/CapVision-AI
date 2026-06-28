# CapVision AI - Automated Equity Research Agent

CapVision AI is a production-grade, stateful multi-agent investment research system. It coordinates specialized agents to crawl financial statements, mine real-time market catalysts, assess SWOT risks, and mathematically compile institutional-grade equity research reports—fully grounded to prevent LLM hallucinations.

---

## System Architecture

### Execution Flow Diagram
```text
           +---------------------------------------------+
           |                 User Input                  |
           |             (e.g., "NVIDIA")                |
           +---------------------------------------------+
                                  |
                                  v
           +---------------------------------------------+
           |              1. Research Node               |
           |   - Local Registry / Yahoo Search Ticker    |
           |   - Pulls general profile details           |
           +---------------------------------------------+
                                  |
                 +----------------+----------------+
                 | (Parallel Execution)            |
                 v                                 v
  +-----------------------------+   +-----------------------------+
  |    2A. Financial Node       |   |       2B. News Node         |
  |  - Yahoo quoteSummary query |   |  - Tavily news article scan |
  |  - Pulls balance sheets     |   |  - Evaluates catalysts      |
  |  - Margin/EBITDA timeline   |   |  - Computes news sentiment  |
  +-----------------------------+   +-----------------------------+
                 |                                 |
                 +----------------+----------------+
                                  |
                                  v
           +---------------------------------------------+
           |                3. Risk Node                 |
           |   - Conducts SWOT analysis of the asset     |
           |   - Computes quantitative risk score (1-100)|
           +---------------------------------------------+
                                  |
                                  v
           +---------------------------------------------+
           |              4. Decision Node               |
           |   - Runs deterministic formula scorecard    |
           |   - Determines verdict & target price range |
           |   - Programmatically builds markdown report |
           +---------------------------------------------+
                                  |
                                  v
           +---------------------------------------------+
           |          Final Investment Report            |
           |           (12 structured sections)          |
           +---------------------------------------------+
```

---

## Architecture Breakdown

### 1. State Management in LangGraph.js
We manage the global agent memory state using LangGraph's stateful annotation channel (`Annotation.Root`).
*   **Memory Schema (`AgentState`)**: Declared in [state.ts](file:///c:/Users/rockr/OneDrive/Desktop/InsideIIM_Assignments/server/src/agent/state.ts). It accumulates values throughout the DAG traversal.
*   **Reducer/Accumulator Merging**: Rather than overwriting state properties, nodes mutate or append properties. Parallel execution branches (`financialNode` and `newsNode`) write to separate channels on the state concurrently, which are automatically joined when transitioning to the next downstream node (`riskNode`).

### 2. Data Payloads Between Nodes
The shared state schema carries the following properties:
*   `query`: The original string requested by the user.
*   `ticker`: The resolved stock listing ticker (e.g. `NVDA`).
*   `companyName`: The verified name of the company.
*   `description`: Corporate profile business summary.
*   `companyOverview`: Object storing sector, industry, and exchange.
*   `marketData`: Financial statements, ratios, EPS, and timelines.
*   `newsData`: Scraped news catalysts and headlines.
*   `newsSentiment`: Classified sentiment (Bullish, Neutral, or Bearish).
*   `riskScore`: Safety/risk rating between 1 and 100.
*   `riskAnalysis`: SWOT breakdown.
*   `verdict` / `investmentScore` / `priceTarget` / `report`: The final compiled outputs.

### 3. Integrated APIs
*   **Gemini 2.5 Flash**: Orchestrates subagent reasoning. We utilize its structured JSON output parser and implement an exponential backoff wrapper to handle transient 503 unavailability.
*   **Yahoo Finance API**: Queries `quoteSummary` modules (`summaryDetail`, `financialData`, `defaultKeyStatistics`, `incomeStatementHistory`) to pull balance sheets. Includes fallback mock generators to avoid crashing during 429 rate limit errors.
*   **Tavily Search API**: Scrapes real-time financial web resources and news headlines.

### 4. Deployment Architecture
*   **Frontend SPA (Vercel)**: The React client is optimized for Vercel, referencing the backend API via environment variables.
*   **Backend Server (Render)**: Hostable as a web service. Because `package.json` specifies `"type": "module"`, the project utilizes strict **Node.js ES Modules (ESM)**. All relative imports in `src/` explicitly declare `.js` file extensions (e.g., `import graph from './graph.js'`) to prevent `ERR_MODULE_NOT_FOUND` launch failures on cloud platforms.

---

## Directory Structure

```text
InsideIIM_Assignments/
├── README.md                     # This file
│
├── server/                       # Node.js + Express backend
│   ├── src/
│   │   ├── agent/                # State, nodes, and LangGraph DAG definition
│   │   ├── controllers/          # Endpoint controllers
│   │   ├── services/             # Gemini API client & retry logic
│   │   ├── middlewares/          # Global error handlers
│   │   └── index.ts              # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── client/                       # React SPA client
    ├── src/
    │   ├── components/           # Dashboard, AgentDocs, Sandbox, ChatPanel
    │   ├── App.tsx               # Primary layout
    │   ├── api.ts                # Axios client configuration
    │   └── index.css             # Tailwind styling and scroll config
    ├── package.json
    └── vite.config.ts
```

---

## Setup & Running Locally

### Step 1: Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=3001
GEMINI_API_KEY=AIzaSy...
TAVILY_API_KEY=tvly-dev-...
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:3001/api
```

### Step 2: Running Backend
```bash
cd server
npm install
npm run dev
```
Starts backend server at `http://localhost:3001`.

### Step 3: Running Client
```bash
cd client
npm install
npm run dev
```
Starts the frontend dashboard at `http://localhost:5173`.
