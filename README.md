# CapVision AI - Investment Research Agent Workspace

CapVision AI is a production-quality, full-stack **AI Investment Research Agent** that acts as an automated equity research assistant. Built with **React**, **Node.js (Express)**, **LangGraph.js**, and the **Gemini 2.5 API**, the system fetches structured financial data and market sentiment news, processes them through a multi-agent state graph pipeline, compiles detailed investment reports, and supports context-aware interactive follow-up Q&A.

---

## Technical Stack & Design Highlights

1. **Agent Engine (LangGraph.js + TypeScript)**:
   - Configured as a state graph (`StateGraph`) with sequential analysis nodes and conditional transitions.
   - Built entirely in **TypeScript** within Node.js, providing static types and unified interfaces.
2. **LLM Orchestration (Gemini 2.5 Pro & Flash)**:
   - **Gemini 2.5 Pro** runs heavy financial computation, SWOT profiling, and synthesis tasks.
   - **Gemini 2.5 Flash** runs news sentiment extraction and provides low-latency chat completions.
3. **Data Streaming (Server-Sent Events)**:
   - Utilizes Server-Sent Events (SSE) to stream subagent updates to the client in real-time.
   - Enables the frontend to track active node progress (e.g. *Data Retrieval* $\rightarrow$ *Margin Analysis* $\rightarrow$ *SWOT Analysis* $\rightarrow$ *Synthesis*) dynamically.
4. **Data Persistence (Prisma + SQLite)**:
   - File-based SQLite database with Prisma ORM simplifies setup.
   - Stores report metadata, compiled markdown, raw financial statistics, and conversation logs.
5. **Interactive UI (React + Recharts + Vanilla CSS)**:
   - Custom-tailored dark glassmorphic design.
   - Real-time stepper, responsive summary metric panels, interactive charting (Recharts), and follow-up chat bubbles.

---

## Directory Structure

```text
InsideIIM_Assignments/
├── README.md                     # This file
│
├── src/
│   ├── backend/                  # Express server & LangGraph
│   │   ├── prisma/               # Database schemas and connection configurations
│   │   ├── src/
│   │   │   ├── agent/            # State, nodes, models and graph configuration
│   │   │   ├── controllers/      # SSE and Q&A endpoint managers
│   │   │   ├── services/         # Yahoo Finance and Tavily Search wrappers
│   │   │   └── index.ts          # Express start file
│   │   └── package.json
│   │
│   └── frontend/                 # React SPA
│       ├── src/
│       │   ├── components/       # Steppers, charts, QA panel, displays
│       │   ├── hooks/            # useResearchSSE streaming listener
│       │   ├── types/            # Typed interfaces
│       │   ├── App.tsx           # Page orchestrator
│       │   └── index.css          # Color variables & custom CSS styling
│       └── package.json
```

---

## Setup & Running Locally

### Prerequisites
- Node.js version **20+**
- NPM version **10+**

### Step 1: Environment Variables
Create a `.env` file inside `src/backend/` using the provided template:
```bash
cp src/backend/.env.example src/backend/.env
```
Fill in your API keys:
- **`GEMINI_API_KEY`**: Obtain a key for free from the [Google AI Studio](https://aistudio.google.com/).
- **`TAVILY_API_KEY`** *(Optional)*: Obtain a key from [Tavily](https://tavily.com/). If left blank, the backend gracefully falls back to simulated news analysis results.

### Step 2: Running Backend Server
1. Navigate to the backend folder:
   ```bash
   cd src/backend
   ```
2. Setup the database and generate client files:
   ```bash
   npx prisma db push
   ```
3. Start the hot-reloading development server:
   ```bash
   npm run dev
   ```
The backend server runs at `http://localhost:3001` with health-checks at `http://localhost:3001/health`.

### Step 3: Running Frontend Client
1. In a new terminal window, navigate to the frontend folder:
   ```bash
   cd src/frontend
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
The React client runs at `http://localhost:5173`. Open it in your browser, search for stock tickers (e.g. `AAPL`, `MSFT`, `TSLA`, `NVDA`), and witness the agent execute in real-time.
