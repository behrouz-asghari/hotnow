
# 🔥 HotNow

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</p>

<p align="center">
  <strong>An AI-driven dashboard aggregating and analyzing trending topics for the Persian-speaking community.</strong>
</p>
<img width="1920" height="1802" alt="ScreenCaptureHotNow" src="https://github.com/user-attachments/assets/70ffa5f0-e1dc-4090-9bd9-e4ea32d057d6" />

---

## 📖 Table of Contents
- [🚀 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🛠 Tech Stack](#%EF%B8%8F-tech-stack)
- [🏗 Architecture](#%EF%B8%8F-architecture)
- [🧠 Data & AI Pipeline](#%EF%B8%8F-data--ai-pipeline)
- [⚙️ Setup & Installation](#%EF%B8%8F-setup--installation)
- [🌍 Environment Variables](#%EF%B8%8F-environment-variables)
- [⚡ Caching & Performance](#%EF%B8%8F-caching--performance)
- [🤝 Contributing](#%EF%B8%8F-contributing)

---

## 🚀 Overview

**HotNow** is a cutting-edge intelligence dashboard designed to surface the most relevant trends within the Persian-speaking ecosystem. By fusing live signals from Google Trends, Wikipedia, Digikala, and social scrapers, it provides a consolidated view of what the community is searching for, reading, and buying.

---

## ✨ Key Features

- 📈 **Live Trend Tracking**: Real-time Google Trends integration for Iran.
- 📚 **Wikipedia Insights**: Top Persian Wikipedia articles with intelligent category filtering.
- 🛒 **Market Intelligence**: Analysis of Digikala best-selling products and consumer signals.
- 🤖 **AI-Powered Analytics**:
  - **Clustering**: Grouping related topics automatically.
  - **Sentiment**: Estimating public mood towards trends.
  - **Forecasting**: Predicting upcoming trending topics.
  - **Labeling**: Context-aware descriptive labels (General, Social, Market).
- 📅 **Localized Experience**: Full Jalali (Persian) date support and RTL-first responsive design.
- 🛡️ **Smart Caching**: Optimized performance using Next.js revalidation and in-memory storage.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.1.6](https://nextjs.org/) (App Router) |
| **Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Data Processing** | `cheerio`, `fast-xml-parser`, `ml-kmeans` |
| **Date/Time** | `dayjs` + `jalaliday` |
| **AI Engine** | [OpenRouter](https://openrouter.ai/) |

---

## 🏗 Architecture

The project follows a modular architecture for scalability:

- 📂 **`app/api/`**
  - `analyze`: The central intelligence hub. Consolidates data from all sources and triggers the AI pipeline.
  - `refresh`: Manual trigger for cache invalidation.
- 📂 **`app/components/`**
  - Reusable UI elements: `AnalysisPanel`, `StatCards`, `TrendsLabelsBoard`, `RefreshButton`.
- 📂 **`app/lib/`**
  - `ai/`: Logic for clustering, sentiment, and forecasting.
  - `sources/`: Adapters for Digikala, Google Trends, Wikipedia, etc.
  - `fusion/`: Signal merging and normalization engine.
  - `cache/`: In-memory caching utilities.
  - `utils/`: Text processing and Jalali date helpers.

---

## 🧠 Data & AI Pipeline

The intelligence flow follows a structu1. **Ingestion**: Fetching raw data from Google Trends, Wikipedia, Digikala, Ninisite, Karzar, and TgStat.
2. **Processing**: Running machine learning algorithms for clustering and sentiment analysis.
3. **Enrichment**: Generating context-specific labels via OpenRouter (tailored for General, Social, or Market contexts).
4. **Delivery**: Merging enriched signals into a single API response with a 24-hour cache window.

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** (v18 or newer)
- **Package Manager**: `npm`, `yarn`, or `pnpm`

### Installation Steps

1. **Clone the repository**
```bash
   git clone https://github.com/your-username/hotnow.git
   cd hotnow
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variablesCreate a .env.local file and add your key:**

```bash
   OPENROUTER_API_KEY=your_api_key_here
```

3. **Run Development Server**

```bash
   npm run dev
```


4. Open http://localhost:3000 in your browser.

## 🏗 Build for Production

```bash
npm run build
npm start
```

## ⚙️ Configuration & Logic

### Caching Strategy

To ensure high availability and low latency:

* **Revalidation:** The /api/analyze endpoint uses Next.js ISR (Incremental Static Regeneration) with an 86,400-second (24h) window.
* **In-Memory Cache:** Custom utilities minimize redundant upstream API calls between revalidations.


## 📄 License

This project is licensed under the MIT License.
