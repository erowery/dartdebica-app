'use client';

export default function MilestoneBarChart({
  milestones,
}: {
  milestones: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(1, ...milestones.map((m) => m.value));

  return (
    <div className="flex items-end justify-between gap-3 h-28">
      {milestones.map((m) => (
        <div key={m.label} className="flex-1 flex flex-col items-center justify-end h-full">
          <span className="text-sm font-bold text-white mb-1">{m.value}</span>
          <div
            className="w-full max-w-[36px] rounded-t-md"
            style={{
              height: `${Math.max((m.value / max) * 100, m.value > 0 ? 6 : 2)}%`,
              backgroundColor: m.color,
            }}
          />
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-1.5">{m.label}</span>
        </div>
      ))}
    </div>
  );
}
