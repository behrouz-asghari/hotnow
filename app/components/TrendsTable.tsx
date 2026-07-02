type SourceName =
  | "google"
  | "wiki"
  | "ninisite"
  | "karzar"
  | "digikala";

type Item = {
  id: string;
  title: string;
  source: SourceName;
  clusterId: number;
  weight: number;
};

type Props = {
  items: Item[];
  labels: Record<number, string>;
};

const sourceMap: Record<
  SourceName,
  { label: string; className: string }
> = {
  google: {
    label: "گوگل ترندز",
    className: "bg-blue-50 text-blue-700",
  },
  wiki: {
    label: "ویکی‌پدیا",
    className: "bg-gray-100 text-gray-700",
  },
  ninisite: {
    label: "نی‌نی‌سایت",
    className: "bg-pink-50 text-pink-700",
  },
  karzar: {
    label: "کارزار",
    className: "bg-green-50 text-green-700",
  },
  digikala: {
    label: "دیجی‌کالا",
    className: "bg-red-50 text-red-700",
  },
};

export default function TrendsTable({ items, labels }: Props) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b text-sm text-gray-500">
        تعداد آیتم‌ها: {items.length}
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-right">عنوان</th>
            <th className="p-3 text-right">منبع</th>
            <th className="p-3 text-right">خوشه</th>
            <th className="p-3 text-right">وزن</th>
          </tr>
        </thead>

        <tbody>
          {items.slice(0, 100).map((it) => {
            const sourceInfo = sourceMap[it.source];

            return (
              <tr key={it.id} className="border-t">
                <td className="p-3">{it.title}</td>

                <td className="p-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${sourceInfo.className}`}
                  >
                    {sourceInfo.label}
                  </span>
                </td>

                <td className="p-3">
                  {labels[it.clusterId] ?? "در حال تحلیل..."}
                </td>

                <td className="p-3">{it.weight.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
