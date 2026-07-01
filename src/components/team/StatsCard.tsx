/**
 * StatsCard.tsx — Reusable statistics card component (LARGE)
 */
import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function StatsCard({ label, value, icon, color }: StatsCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${color} border rounded-3xl p-8 text-center hover:border-white/20 transition-all`}
    >
      <div className="flex justify-center mb-6">
        {React.cloneElement(icon as React.ReactElement, { size: 40 })}
      </div>
      <div className="text-5xl font-black text-white leading-tight">{value}</div>
      <div className="text-xs text-slate-300 uppercase font-bold mt-3 tracking-normal">{label}</div>
    </div>
  );
}
