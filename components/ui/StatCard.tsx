import React from "react";
import Icon from "@/components/ui/Icon";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  iconBgClass?: string;
  iconTextClass?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  iconBgClass = "bg-primary-fixed",
  iconTextClass = "text-primary",
}: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient ghost-border group hover:bg-surface-container-high transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 ${iconBgClass} rounded-xl flex items-center justify-center`}
        >
          <Icon name={icon} className={iconTextClass} />
        </div>
        {trend && (
          <span
            className={`font-label text-xs font-semibold px-2 py-1 rounded-full ${
              trendUp
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <p className="font-label text-sm text-on-surface-variant mb-1">
        {label}
      </p>
      <p className="font-headline text-2xl font-bold text-on-background">
        {value}
      </p>
    </div>
  );
}
