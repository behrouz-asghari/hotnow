type Props = {
  fear: number;
  excitement: number;
  crisis: number;
  sexualSignal: number;
  politicalTension?: number;
  polarity?: number;
};

export default function StatCards({
  fear = 0,
  excitement = 0,
  crisis = 0,
  sexualSignal = 0,
  politicalTension = 0,
  polarity = 0,
}: Props) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      <Card title="😨 ترس" value={`${Math.round(fear * 100)}%`} />
      <Card title="⚡ هیجان" value={`${Math.round(excitement * 100)}%`} />
      <Card title="🚨 بحران" value={`${Math.round(crisis * 100)}%`} />
      <Card title="🧭 سیگنال جنسی" value={`${Math.round(sexualSignal * 100)}%`} />
      <Card
        title="📈 تنش"
        value={
          politicalTension !== undefined
            ? `${Math.round(politicalTension * 100)}%`
            : "-"
        }
      />
      <Card
        title="🧲 +/- حس جامعه"
        value={polarity !== undefined ? `${Math.round(polarity * 100)}%` : ""}
      />
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-lg text-gray-500 font-bold mt-1">{value}</div>
    </div>
  );
}
