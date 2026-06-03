export default function StatusBadge({ status }) {
  let colorStyle = '';

  switch (status?.toLowerCase()) {
    case 'pending':
      colorStyle = 'bg-amber-50 text-amber-700 border border-amber-200';
      break;
    case 'confirmed':
      colorStyle = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      break;
    case 'rejected':
      colorStyle = 'bg-rose-50 text-rose-700 border border-rose-200';
      break;
    case 'fulfilled':
      colorStyle = 'bg-sky-50 text-sky-700 border border-sky-200';
      break;
    default:
      colorStyle = 'bg-zinc-50 text-zinc-600 border border-zinc-200';
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${colorStyle}`}>
      {status || 'unknown'}
    </span>
  );
}
