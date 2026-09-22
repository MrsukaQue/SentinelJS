export function ScoreGauge({ score = 0 }) {
  const color = score >= 80 ? '#35e0a1' : score >= 60 ? '#f6c85f' : '#ff6577';
  return (
    <div
      className="relative grid size-44 place-items-center rounded-full"
      style={{ background: `conic-gradient(${color} ${score}%, #172235 0)` }}
    >
      <div className="grid size-36 place-items-center rounded-full bg-[#0c131f] text-center">
        <div>
          <span className="text-5xl font-semibold" style={{ color }}>
            {score}
          </span>
          <span className="text-slate-500"> / 100</span>
          <p className="m-0 mt-1 text-xs text-slate-400">SECURITY SCORE</p>
        </div>
      </div>
    </div>
  );
}
