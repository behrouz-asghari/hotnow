// components/HotTable.tsx
import Link from "next/link"

type Article = {
  article: string
  views: number
  rank: number
}

export default function HotTable({
  articles,
  currentPage,
}: {
  readonly articles: Article[]
  readonly currentPage: number
}) {
  return (
    <div className="space-y-6">

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-right font-semibold">رتبه</th>
                <th className="px-4 py-3 text-right font-semibold">عنوان</th>
                <th className="px-4 py-3 text-right font-semibold">بازدید</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {articles.map((a) => (
                <tr
                  key={a.article}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-500">
                    #{a.rank}
                  </td>

                  <td className="px-4 py-3 text-gray-800 font-semibold">
                    {decodeURIComponent(a.article.replaceAll("_", " "))}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {a.views.toLocaleString("fa-IR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">

        <Link
          href={`/?page=${currentPage + 1}`}
          className="px-5 py-2 rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 transition text-sm font-medium"
        >
         → بعدی
        </Link>
             {currentPage > 1 ? (
          <Link
            href={`/?page=${currentPage - 1}`}
            className="px-5 py-2 rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 transition text-sm font-medium"
          >
             قبلی ←
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}