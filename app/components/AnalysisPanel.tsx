type Props = {
  generalReport: string;
  womenSocialReport: string;
  marketReport: string;
};

function ReportSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section className="border rounded-xl p-4 bg-gray-50">
      <h3 className="text-base font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-sm leading-8 whitespace-pre-wrap text-gray-700">
        {content}
      </p>
    </section>
  );
}

export default function AnalysisPanel({
  generalReport,
  womenSocialReport,
  marketReport,
}: Props) {
  return (
    <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
      <h2 className="text-lg text-gray-500 font-bold">🧠 تحلیل AI</h2>

      <ReportSection title="📊 تحلیل کلی ترندها" content={generalReport} />
    <ReportSection title="👩 تحلیل اجتماعی زنان" content={womenSocialReport} />
      <ReportSection title="🛒 تحلیل اقتصا و اجتماعی بازار" content={marketReport} />
    </section>
  );
}
