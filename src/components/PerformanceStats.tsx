import React from "react";

interface PerformanceStatsProps {
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    partial: number;
    totalMarks: number;
  };
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({
  stats,
}) => {
  const StatItem = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number | string;
    color: string;
  }) => (
    <div className="flex flex-col">
      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
        {label}
      </span>
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className={"w-1.5 h-1.5 rounded-full " + color}></div>
        <span className="text-xs font-black text-slate-700 dark:text-slate-300">
          {value}
        </span>
      </div>
    </div>
  );

  const scoreClass =
    "px-2.5 py-1 rounded-lg text-sm font-black " +
    (stats.totalMarks >= 0
      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
      : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400");

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
        <StatItem
          label="Correct"
          value={stats.correct}
          color="bg-emerald-500"
        />
        <StatItem label="Partial" value={stats.partial} color="bg-amber-400" />
        <StatItem label="Wrong" value={stats.incorrect} color="bg-rose-500" />
        <StatItem
          label="Skipped"
          value={stats.unattempted}
          color="bg-slate-300 dark:bg-slate-600"
        />
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Total Score
        </span>
        <div className={scoreClass}>{stats.totalMarks}</div>
      </div>
    </div>
  );
};
