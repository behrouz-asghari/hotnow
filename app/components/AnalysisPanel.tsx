type Props = {
  generalReport: string;
  womenSocialReport: string;
  marketReport: string;
};

function ReportSection({
  title,
  content,
  isEmpty
}: {
  title: string;
  content: string;
  isEmpty?: boolean;
}) {
  return (
    <section className={`border rounded-xl p-4 ${isEmpty ? 'bg-gray-100 opacity-60' : 'bg-gray-50'}`}>
      <h3 className="text-base font-bold mb-3 text-gray-800 flex items-center gap-2">
        {title}
        {isEmpty && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded">دیتای منبع موجود نیست</span>}
      </h3>
      <p className="text-sm leading-8 whitespace-pre-wrap text-gray-700">
        {content || "در حال حاضر تحلیلی برای این بخش تولید نشده است."}
      </p>
    </section>
  );
}

export default function AnalysisPanel({
  generalReport,
  womenSocialReport,
  marketReport,
}: Props) {
  const isMarketEmpty = marketReport.includes("داده‌ای از دیجی‌کالا دریافت نشد");
  const isWomenEmpty = womenSocialReport.includes("داده‌ای از نی‌نی‌سایت دریافت نشد");
  return (

    <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
      <h2 className="text-lg text-gray-500 font-bold">🧠 تحلیل AI</h2>

      <ReportSection title="📊 تحلیل کلی ترندها" content={generalReport} />
      <ReportSection title="👩 تحلیل اجتماعی زنان" content={womenSocialReport} isEmpty={isWomenEmpty} />
      <ReportSection title="🛒 تحلیل اقتصا و اجتماعی بازار" content={marketReport} isEmpty={isMarketEmpty} />
    </section>
  );
}
