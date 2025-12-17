"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/time";

interface SlotSelectorProps {
  availableSlots: { start: string; end: string }[];
  fieldName?: string;
}

export function SlotSelector({ availableSlots, fieldName = "slots" }: SlotSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const grouped = useMemo(() => {
    const map: Record<string, { start: string; end: string }[]> = {};
    availableSlots.forEach((slot) => {
      const day = new Date(slot.start).toISOString().split("T")[0];
      if (!map[day]) map[day] = [];
      map[day].push(slot);
    });
    return map;
  }, [availableSlots]);

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div className="space-y-3">
      {Object.keys(grouped).length === 0 && <p className="text-sm text-slate-500">선택 가능한 슬롯이 없습니다.</p>}
      <input type="hidden" name={fieldName} value={selected.join(",")} />
      {Object.entries(grouped).map(([day, slots]) => (
        <div key={day} className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">{day}</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {slots.map((slot) => {
              const value = `${slot.start}|${slot.end}`;
              const isSelected = selected.includes(value);
              return (
                <Button
                  key={value}
                  type="button"
                  variant={isSelected ? "primary" : "secondary"}
                  className="w-full justify-start"
                  onClick={() => toggle(value)}
                >
                  <span className="flex flex-col text-left text-xs">
                    <span>{formatDateTime(new Date(slot.start))}</span>
                    <span className="text-slate-500">~ {formatDateTime(new Date(slot.end))}</span>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
