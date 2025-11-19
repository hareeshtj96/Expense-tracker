export default function ProgressBar({ percent = 0, over = false }) {
  const parsed = Number(percent);
  const safeNum = Number.isFinite(parsed) ? parsed : 0;
  const pct = Math.max(0, Math.min(100, safeNum));

  const bgClass = over ? "bg-red-500" : "bg-green-500";

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className={`${bgClass} h-3 transition-all duration-300`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
}
