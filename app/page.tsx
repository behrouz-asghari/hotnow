// app/page.tsx
import HotTable from "./components/HotTable";
import { XMLParser } from 'fast-xml-parser';
import { toShamsi } from "./utils/date";

type Article = {
  article: string;
  views: number;
  rank: number;
};

async function getTrends() {
  try {
    const res = await fetch('https://trends.google.com/trending/rss?geo=IR');
    const text = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const jsonObj = parser.parse(text);

    const items = jsonObj.rss.channel.item || [];
    let filteredCount = 0;

    const data = items.map((item: any) => {
      const title = item.title || '';
      const approxTraffic = item['ht:approx_traffic'] || '';
      const newsItemSource = item['ht:news_item_source'] || 'N/A';
      const link = item['ht:news_item_url'] || item.link;

      if (title.length < 3) {
        filteredCount++;
        return null;
      }

      return { title, approxTraffic, newsItemSource, link };
    }).filter(Boolean);

    return { data, filteredCount, total: items.length };
  } catch (err) {
    console.error("Error fetching trends:", err);
    return { data: [], filteredCount: 0, total: 0 };
  }
}
// --- لیست کامل دسته‌بندی‌های ممنوعه ---
const FORBIDDEN_CATEGORIES = new Set([
  "پوزیشن‌های جنسی", "مخالفان سیاسی جمهوری اسلامی اهل ایران",
  "سیاستمداران مخالف جمهوری اسلامی ایران", "دستگاه تولیدمثل زنانه در انسان",
  "زنان و تمایلات جنسی", "آمیزش جنسی", "تولیدمثل", "خودارضایی", "صنعت سکس",
  "خانواده پهلوی", "دودمان پهلوی", "کارکنان ایران اینترنشنال", "کنش‌های جنسی",
  "آلت مردانه", "وسایل جنسی", "آلت تناسلی نر", "وبگاه‌های پورنوگرافی و شهوانی",
  "سانسور اینترنت در هند", "تمایلات جنسی", "پورنوگرافی", "سکس‌شناسی", "جنسیت‌زدگی",
  "میل جنسی در انسان", "تن‌فروشی", "جرایم جنسی", "جاذبه جنسی", "تمایلات جنسی در فرهنگ عامه",
  "جنسیت‌گرایی و جامعه", "عارضه‌های آلت تناسلی مرد", "گوناگونی بیناجنسی", "زبان عامیانه جنسی",
  "فرج (عضو)", "اعدام‌شدگان اهل ایران در زمان جمهوری اسلامی", "برهنگی", "قوانین رابطه جنسی",
  "پستان", "فتیش جنسی", "ناکارآمدی‌های جنسی", "تمایلات جنسی هم‌جنس‌ها", "ال‌جی‌بی‌تی",
  "مطالعات جنسیت", "همجنس‌گرایی", "گرایش‌های جنسی", "برانگیختگی جنسی", "باروری",
  "واژن", "پزشکی زایمان", "فهرست‌های مربوط به تمایلات جنسی", "فیلم‌ها درباره تمایلات جنسی",
  "دستگاه تولیدمثل ماده در پستانداران",
]);

const USER_AGENT = "hotnow-app/1.2.0 (contact@example.com)";

/**
 * دریافت لیست پربازدید مقالات
 */
async function fetchTopArticles(): Promise<{ articles: Article[]; dateUsed: string | null }> {
  const attempts = [2, 3, 4];

  for (const days of attempts) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const ds = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/fa.wikipedia.org/all-access/${ds}`;

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const data = await res.json();
        return {
          articles: data.items?.[0]?.articles || [],
          dateUsed: ds
        };
      }
    } catch (e) {
      console.error(`Attempt for ${days} days ago failed.`);
    }
  }

  return { articles: [], dateUsed: null };
}

/**
 * بررسی تک تک مقالات برای forbidden categories
 */async function filterSafeArticles(articles: Article[]): Promise<{ safe: Article[]; removedCount: number }> {
  const safeResults: Article[] = [];
  let removedCount = 0;

  const candidates = articles
    .filter(a => !a.article.includes(":") && a.article !== "صفحهٔ_اصلی")
    .slice(0, 200);

  const BATCH_SIZE = 10;

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (articleObj) => {
      const title = articleObj.article.replace(/_/g, " ").normalize("NFC");
      const url = `https://fa.wikipedia.org/w/api.php?action=query&prop=categories&titles=${encodeURIComponent(title)}&cllimit=50&format=json&origin=*`;
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT },
          next: { revalidate: 86400 }
        });
        const data = await res.json();
        const page = Object.values(data.query?.pages || {})[0] as any;
        const categories = page?.categories || [];

        const isForbidden = categories.some((cat: any) => {
          const catName = (cat.title || "").replace("رده:", "").normalize("NFC");
          return FORBIDDEN_CATEGORIES.has(catName);
        });

        if (!isForbidden) return articleObj;

        removedCount++;
        console.log(`🚫 فیلتر شد: ${articleObj.article}`);
        return null;
      } catch (err) {
        console.error("Error fetching categories for", articleObj.article, err);
        return null;
      }
    });

    const results = await Promise.all(batchPromises);
    safeResults.push(...results.filter(Boolean) as Article[]);
  }

  return { safe: safeResults, removedCount };
}

/**
 * کامپوننت اصلی صفحه
 */
export default async function Page({
  searchParams,
}: {
  readonly searchParams: Promise<{ page?: string }>;
}) {
  const { data, filteredCount, total } = await getTrends();

  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 10;

  const { articles: rawArticles, dateUsed } = await fetchTopArticles();
  const { safe: safeArticles, removedCount } = await filterSafeArticles(rawArticles);

  const start = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = safeArticles.slice(start, start + itemsPerPage);

  if (safeArticles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4" dir="rtl">
        <p className="text-xl font-bold text-gray-600">در حال دریافت و فیلتر کردن اطلاعات...</p>
        <p className="text-sm text-gray-400">اگر طولانی شد، اتصال شبکه خود را بررسی کنید.</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ستون اصلی ویکی‌پدیا */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          <header className="flex flex-col gap-3 mb-8 border-b pb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-gray-900">
                🔥 مقالات داغ ویکی‌پدیا
              </h1>

            </div>

            <p className="text-gray-500 text-sm">
              پربازدیدترین مقالات ویکی‌پدیای فارسی در ۲۴ ساعت گذشته (فیلتر شده)
            </p>
          </header>

          <HotTable
            articles={paginatedArticles}
            currentPage={currentPage}
          />

          <footer className="mt-10 pt-6 border-t text-center text-xs text-gray-400 leading-6">
            <p>
              داده‌ها از Wikimedia REST API دریافت و با رعایت فیلترینگ محتوا نمایش داده می‌شوند.
            </p>
            {removedCount > 0 && dateUsed && (
              <p className="mt-2 text-gray-500">
                تعداد مقالات حذف شده:
                <span className="font-semibold text-gray-700 mx-1">{removedCount}</span>
                از
                <span className="font-semibold text-gray-700 mx-1">
                  {rawArticles.length}
                </span>
                مقاله ({toShamsi(dateUsed)})
              </p>
            )}
          </footer>
        </div>

        {/* ستون Google Trends */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg font-bold text-gray-900 ">
              📈 جستجوهای داغ
            </h3>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right border-collapse">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2">عنوان</th>
                  <th className="py-2">ترافیک</th>
                  <th className="py-2">منبع</th>
                  <th className="py-2">لینک</th>
                </tr>
              </thead>

              <tbody>
                {data && data.length > 0 ? (
                  data.map((item: any, id: number) => (
                    <tr
                      key={id++}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 font-medium text-gray-800">
                        {item.title}
                      </td>

                      <td className="py-3 text-gray-600">
                        {item.approxTraffic}
                      </td>

                      <td className="py-3 text-gray-500 text-xs">
                        {item.newsItemSource}
                      </td>

                      <td className="py-3">
                        <a
                          href={item.link}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          مشاهده
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      در حال دریافت داده‌ها...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

  );
}

