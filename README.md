# RegIntel Feed — Indian Regulatory Intelligence & Compliance Platform

> **Real-time regulatory intelligence and daily briefings for Indian compliance officers, Chartered Accountants (CAs), Company Secretaries (CS), Registered Investment Advisors (RIAs), FinTechs, and corporate legal teams.**

---

## 📌 Executive Summary

**RegIntel Feed** continuously aggregates, parses, analyzes, and categorizes official circulars, notifications, and gazette orders across India's five major financial and corporate regulators:

1. **SEBI** (Securities and Exchange Board of India) — Capital markets, intermediaries, RIA/RA regulations, mutual funds, algorithmic trading, disclosures.
2. **RBI** (Reserve Bank of India) — Banking, NBFCs, digital lending, cyber security frameworks, cross-border remittance, payment system operators (PSOs).
3. **MCA** (Ministry of Corporate Affairs) — Companies Act 2013 filings, corporate governance, director disclosures, CSR norms, LLP amendments.
4. **CBDT** (Central Board of Direct Taxes) — Income Tax circulars, TDS/TCS updates, transfer pricing guidelines, advance tax compliance.
5. **CBIC** (Central Board of Indirect Taxes and Customs) — GST council notifications, customs tariffs, e-invoicing thresholds, input tax credit (ITC) reconciliations.

Powered by **Google Gemini 2.5**, RegIntel Feed automatically turns complex legal gazette prose into 2-minute actionable executive summaries, extracts statutory deadlines, scores compliance urgency, tags affected entities, and produces standardized RSS 2.0 XML feeds.

---

## ✨ Key Features & Capabilities

### 1. Unified Multi-Regulator Feed
- Real-time aggregated feed of all official regulatory releases.
- Instant search across circular reference numbers, topics, and extracted clauses.
- Multi-dimensional filtering by **Regulator**, **Impact Category** (*KYC/AML, Taxation, Reporting/Filing, Governance, FinTech & Payments, Trading & Markets, Capital Adequacy, Consumer Protection*), and **Urgency** (*CRITICAL, HIGH, MEDIUM, LOW*).
- Status tags indicating newly published circulars.

### 2. Gemini AI Regulatory Summarization & Analysis
- **Plain-English Executive Summaries**: Distills dense multi-page statutory circulars into concise paragraphs.
- **Key Compliance Action Items**: Clear bullet points detailing what compliance officers, auditors, and engineering teams must execute.
- **Applicable Entities**: Pinpoints precisely who is impacted (e.g., *Listed Companies, Scheduled Commercial Banks, Portfolio Managers, Category-I Merchant Bankers*).
- **Urgency Scoring & Timeline Detection**: Highlights statutory effective dates, transition grace periods, and submission windows.

### 3. Interactive AI Compliance Assistant
- Embedded AI copilot tailored for regulatory inquiries.
- Ask questions directly against specific circular clauses (e.g., *"What are the penalty provisions for late filing?"*, *"Create an internal audit checklist for this RBI notification"*).
- Pre-populated quick prompts for audit committee notes, deadline extraction, and operational impact.
- One-click copy for drafting compliance memos.

### 4. Morning Executive Briefing & Daily Digest
- Consolidated executive summary of today's regulatory perimeter.
- Breakdown of notifications by regulatory authority.
- High-priority compliance action matrix.
- Summary statistics on critical actions requiring board or management attention.

### 5. Standards-Compliant RSS 2.0 XML Feeds (`/api/rss`)
- Public, production-ready RSS XML endpoint consolidating all regulatory feeds.
- **Custom URL Builder**: Filter RSS output dynamically via query parameters:
  - By Regulator: `/api/rss?regulator=SEBI`
  - By Impact Category: `/api/rss?tag=FinTech+%26+Payments`
  - Combined: `/api/rss?regulator=RBI&tag=KYC+%26+AML`
- Directly compatible with **Slack** (`/feed subscribe`), **Microsoft Teams**, **Feedly**, **Inoreader**, **Outlook**, and automated webhook bots.

### 6. Compliance Workpaper & Bookmark Manager
- Save circulars to an internal compliance review watchlist.
- Attach private internal notes, audit instructions, and responsible officer assignments.
- Export saved workpapers as formatted **CSV** files for offline review and audit committee reporting.

### 7. Scraper Health & Regulatory Source Manager
- Real-time status monitoring of official circular listing endpoints.
- Single-click or automated scraper pipeline execution (`runScrapeAndSummarizePipeline`).
- **Manual Ingestion Sandbox**: Paste unindexed gazette text or emergency notifications for instantaneous Gemini analysis and feed insertion.

### 8. Customizable Profile & Digest Preferences
- Configure personal compliance officer profile (Name, Title, Email).
- Filter default feed view to specific tracked regulators or impact domains.

---

## 🛠️ Architecture & Tech Stack

```
 ┌─────────────────────────────────────────────────────────────┐
 │                  Client (React 19 + Vite)                   │
 │   • Tailwind CSS v4       • Lucide React Icons              │
 │   • Motion Transitions    • Responsive Executive Layout     │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTP / JSON / XML
 ┌──────────────────────────────▼──────────────────────────────┐
 │               Backend Service (Node.js + Express)           │
 │   • Modular Scrapers (Cheerio + HTTP Fetchers)              │
 │   • Gemini 2.5 Flash SDK (@google/genai)                    │
 │   • Standards-Compliant RSS 2.0 XML Engine                  │
 │   • Thread-safe JSON Persistence Engine (data/storage.json) │
 └──────────────────────────────┬──────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│     Google Gemini AI API      │       │     Official Regulators       │
│  (Analysis & Assistant Copilot)│       │ (SEBI, RBI, MCA, CBDT, CBIC)  │
└───────────────────────────────┘       └───────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Express 4, TypeScript, `tsx`, `esbuild`.
- **AI Intelligence**: Google Gemini 2.5 Flash via `@google/genai`.
- **Parsing & Scraping**: Cheerio, HTTP fetching with resilient fallbacks.

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notifications` | Fetch regulatory notifications with filtering by `regulator`, `tag`, `search`, `urgency`, `startDate`, `endDate`. |
| `GET` | `/api/notifications/:id` | Get full details of a specific circular. |
| `GET` | `/api/digest/today` | Generate consolidated daily executive digest and top action items. |
| `POST` | `/api/ai/ask` | Query the Gemini compliance assistant with specific circular context. |
| `GET` | `/api/rss` / `/api/feed.xml` | Standards-compliant RSS 2.0 XML feed (supports `?regulator=` and `?tag=`). |
| `GET` | `/api/saved` | List bookmarked compliance workpapers and notes. |
| `POST` | `/api/notifications/save` | Bookmark a circular with optional compliance note. |
| `PUT` | `/api/saved/:id/note` | Update internal note for a saved item. |
| `DELETE` | `/api/saved/:id` | Remove an item from saved workpapers. |
| `GET` | `/api/sources` | Get health and last scrape timestamps for all regulatory endpoints. |
| `POST` | `/api/sources/scrape-all` | Trigger scraper pipeline across all regulatory sources. |
| `POST` | `/api/sources/scrape-one` | Run scraper for a single specified regulator (`SEBI`, `RBI`, etc.). |
| `POST` | `/api/sources/manual-ingest` | Ingest raw gazette text for instant AI analysis and feed insertion. |
| `GET` | `/api/settings` | Retrieve user preferences and digest configuration. |
| `POST` | `/api/settings` | Update user preferences and tracked regulator filters. |

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The application and backend API will start at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔒 Security & Privacy

- All Gemini API interactions and scraper operations are executed **server-side**; secret keys are never exposed to the client.
- Strict input validation and sanitization on all manual ingestion and assistant endpoints.
- Compliance workpaper notes are stored securely in local database storage.
