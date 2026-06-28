# HotNow - Persian Trends Dashboard

**HotNow** is a modern, high-performance dashboard built with Next.js designed to track and display trending content for the Persian-speaking community. It aggregates data from real-time sources to provide insights into what is currently popular.

## 🚀 Features

* **Live Google Trends:** Displays the hottest daily search queries for Iran.
* **Wikipedia Top Articles:** Fetches the most-viewed Persian Wikipedia articles from the last 24 hours.
* **Smart Filtering:** Filters out sensitive or irrelevant categories (e.g., Living People, Births/Deaths) from Wikipedia results.
* **Shamsi (Jalali) Calendar:** Full support for Persian date formatting.
* **Optimized Performance:** Leverages Next.js App Router and intelligent caching strategies.
* **Responsive RTL UI:** Fully optimized layout for Right-to-Left languages using Tailwind CSS.
* **Pagination:** Seamless data navigation for long lists.

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.1.6 (App Router) |
| **Language** | TypeScript |
| **UI** | React 19, Tailwind CSS 4 |
| **Data Parsing** | fast-xml-parser |
| **Date Handling** | dayjs + jalaliday |

## 📦 Getting Started

### Prerequisites

* **Node.js:** v18 or higher
* **Package Manager:** npm, yarn, or pnpm

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd hotnow
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

4. Open http://localhost:3000 in your browser.

## 🏗 Build for Production

```bash
npm run build
npm start
```

## 📂 Project Structure

```text
hotnow/
├── app/
│   ├── assets/          # Custom fonts and static assets
│   ├── components/      # Reusable UI components (e.g., HotTable.tsx)
│   ├── utils/           # Helper functions (e.g., date.ts for Jalali conversion)
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout (RTL configuration & metadata)
│   └── page.tsx         # Main dashboard page + data fetching logic
├── next.config.ts       # Next.js configuration
├── package.json
└── tsconfig.json
```

## ⚙️ Configuration & Logic

### Caching Strategy

To ensure efficiency while keeping data fresh:

* **Google Trends:** Revalidated every 1 hour
* **Wikipedia:** Revalidated every 24 hours

### API Integrations

* **Google Trends RSS:** https://trends.google.com/trends/trendingsearches/daily/rss?geo=IR
* **Wikimedia REST API:**
  * Top articles: /metrics/pageviews/top/fa.wikipedia.org
  * Category validation: /page/fa.wikipedia.org/{title}

### Filtering

The application implements an exclusion list for content filtering:

```
FORBIDDEN_CATEGORIES = ['Living people', 'Births', 'Deaths', ...]
```

## 📄 License

This project is licensed under the MIT License.
