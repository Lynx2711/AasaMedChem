export default function StatsCard({ title, value, description }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5">
      <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-950 tracking-tight">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      )}
    </div>
  );
}
