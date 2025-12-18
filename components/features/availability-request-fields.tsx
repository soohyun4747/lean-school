"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type AvailabilityField = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const days = ["일", "월", "화", "수", "목", "금", "토"];

interface Props {
  fieldName?: string;
}

export function AvailabilityRequestFields({ fieldName = "availability_json" }: Props) {
  const idPrefix = useId();
  const [rows, setRows] = useState<AvailabilityField[]>(() => [
    {
      id: `${idPrefix}-0`,
      day_of_week: 1,
      start_time: "",
      end_time: "",
    },
  ]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `${idPrefix}-${prev.length}`,
        day_of_week: 1,
        start_time: "",
        end_time: "",
      },
    ]);
  };

  const updateRow = (id: string, patch: Partial<AvailabilityField>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  };

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name={fieldName}
        value={JSON.stringify(rows.map(({ day_of_week, start_time, end_time }) => ({
          day_of_week,
          start_time,
          end_time,
        })))}
      />

      {rows.map((row, index) => (
        <div
          key={row.id}
          className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <div className="space-y-1">
            <label className="text-xs text-slate-600">요일</label>
            <Select
              value={row.day_of_week.toString()}
              onChange={(e) => updateRow(row.id, { day_of_week: Number(e.target.value) })}
            >
              {days.map((label, idx) => (
                <option key={label} value={idx}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-600">시작</label>
            <Input
              type="time"
              required
              value={row.start_time}
              onChange={(e) => updateRow(row.id, { start_time: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-600">종료</label>
            <Input
              type="time"
              required
              value={row.end_time}
              onChange={(e) => updateRow(row.id, { end_time: e.target.value })}
            />
          </div>
          <div className="flex items-end justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-sm text-red-600"
              onClick={() => removeRow(row.id)}
              disabled={rows.length === 1 && index === 0}
            >
              삭제
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={addRow}>
        가능 시간 추가
      </Button>
    </div>
  );
}
