"use client";

import Icon from "@/components/ui/Icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps {
  label?: string;
  icon?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export default function FilterSelect({
  label,
  icon,
  value,
  onChange,
  options,
  className = "",
}: FilterSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="min-w-40">
          {icon && (
            <Icon
              name={icon}
              className="text-on-surface-variant shrink-0"
              size={16}
            />
          )}
          <SelectValue>{selectedOption?.label ?? "Pilih..."}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
