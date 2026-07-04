import type { Item as BaseItem, SourceName } from "@/app/lib/types";

// تعریف ساختار جزئیات فیلم (TrendDetail)
export interface TrendDetail {
  key: string;
  value: string | number;
}

// توسعه تایپ پایه پروژه برای پشتیبانی از فیلد details به همراه جزئیات تایپ‌سیف
export interface Item extends BaseItem {
  details?: TrendDetail[];
}

type Props = {
  items?: Item[];
};

const sourceSections: Array<{
  key: SourceName;
  title: string;
  chipClass: string;
}> = [
  {
    key: "google",
    title: "۱۰ مورد گوگل ترندز",
    chipClass: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    key: "wiki",
    title: "۱۰ مورد ویکی‌پدیا",
    chipClass: "bg-gray-100 text-gray-700 border-gray-200",
  },
  {
    key: "filimo",
    title: "۱۰ فیلم و سریال برتر فیلیمو",
    chipClass: "bg-orange-50 text-orange-700 border-orange-100",
  },
  {
    key: "digikala",
    title: "۱۰ محصول دیجی‌کالا",
    chipClass: "bg-red-50 text-red-700 border-red-100",
  },
  {
    key: "ninisite",
    title: "۱۰ تاپیک نی‌نی‌سایت",
    chipClass: "bg-pink-50 text-pink-700 border-pink-100",
  },
  {
    key: "tgstat",
    title: "۱۰ پست برتر تلگرام",
    chipClass: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    key: "karzar",
    title: "۱۰ کمپین کارزار",
    chipClass: "bg-amber-50 text-amber-700 border-amber-100",
  },
];

export default function TrendsLabelsBoard({ items = [] }: Props) {
  const getTopBySource = (source: SourceName): Item[] => {
    return items
      .filter((it) => it.source === source && it.title?.trim().length > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);
  };

  const getDetailValue = (it: Item, key: string): string | number | null => {
    if (!it.details || !Array.isArray(it.details)) return null;
    const found = it.details.find((d: TrendDetail) => d.key === key);
    return found ? found.value : null;
  };

  return (
    <div className="bg-white border rounded-2xl shadow-sm p-4 space-y-5">
      {sourceSections.map((section) => {
        const topItems = getTopBySource(section.key);

        return (
          <section key={section.key} className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800">{section.title}</h3>

            {topItems.length === 0 ? (
              <p className="text-xs text-gray-400">موردی برای نمایش وجود ندارد.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topItems.map((it) => {
                  if (it.source === "filimo") {
                    const genre = getDetailValue(it, "genre");
                    const director = getDetailValue(it, "director");
                    const year = getDetailValue(it, "year");
                    const description = getDetailValue(it, "description");

                    const metaParts = [
                      year ? `(${year})` : null,
                      director ? `اثر ${director}` : null,
                      genre ? `[${genre}]` : null,
                    ].filter(Boolean);

                    const chipLabel = metaParts.length > 0
                      ? `${it.title} ${metaParts.join(" | ")}`
                      : it.title;

                    const tooltipParts = [
                      `عنوان: ${it.title}`,
                      year ? `سال ساخت: ${year}` : null,
                      director ? `کارگردان: ${director}` : null,
                      genre ? `ژانر: ${genre}` : null,
                      description ? `\nتوضیحات:\n${description}` : null,
                    ].filter(Boolean);

                    const tooltipText = tooltipParts.join("\n");

                    return (
                      <span
                        key={it.id}
                        title={tooltipText}
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium cursor-help transition-colors ${section.chipClass}`}
                      >
                        {chipLabel}
                      </span>
                    );
                  }

                  return (
                    <span
                      key={it.id}
                      title={it.title}
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${section.chipClass}`}
                    >
                      {it.title}
                    </span>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
