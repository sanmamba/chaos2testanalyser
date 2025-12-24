import React from "react";

interface ScoreCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  label,
  value,
  icon,
  colorClass,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};
