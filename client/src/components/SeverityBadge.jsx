const styles = {
  CRITICAL: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  HIGH: 'bg-red-500/15 text-red-300 border-red-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  LOW: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  INFORMATIONAL: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

export function SeverityBadge({ severity }) {
  return (
    <span className={`rounded-md border px-2 py-1 text-[11px] font-bold ${styles[severity]}`}>
      {severity}
    </span>
  );
}
