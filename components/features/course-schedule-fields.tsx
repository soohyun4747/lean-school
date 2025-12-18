"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type TimeWindowField = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const days = ["일", "월", "화", "수", "목", "금", "토"];
const weekOptions = [1, 2, 3, 4, 6, 8, 12];

export function CourseScheduleFields() {
  const idPrefix = useId();
  const [isTimeFixed, setIsTimeFixed] = useState(false);
  const [windows, setWindows] = useState<TimeWindowField[]>(() => [
    {
      id: `${idPrefix}-0`,
      day_of_week: 1,
      start_time: "",
      end_time: "",
    },
  ]);

  const windowsPayload = useMemo(
    () =>
      isTimeFixed
        ? JSON.stringify(
            windows.map(({ day_of_week, start_time, end_time }) => ({
              day_of_week,
              start_time,
              end_time,
            }))
          )
        : "",
    [isTimeFixed, windows]
  );

  const addWindow = () => {
    setWindows((prev) => [
      ...prev,
      {
        id: `${idPrefix}-${prev.length}`,
        day_of_week: 1,
        start_time: "",
        end_time: "",
      },
    ]);
  };

  const updateWindow = (id: string, patch: Partial<TimeWindowField>) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  };

  const removeWindow = (id: string) => {
    setWindows((prev) => (prev.length === 1 ? prev : prev.filter((w) => w.id !== id)));
  };

  return (
    <div className="md:col-span-2 space-y-4 rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">수업 일정</p>
          <p className="text-xs text-slate-600">
            시간이 정해진 수업이면 요일과 시간대를 추가하고, 협의형이면 비워두세요.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={isTimeFixed}
            onChange={(e) => setIsTimeFixed(e.target.checked)}
          />
          시간 확정됨
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-700">과정 기간</label>
          <Select name="weeks" defaultValue={weekOptions[0].toString()}>
            {weekOptions.map((week) => (
              <option key={week} value={week}>
                {week}주 과정
              </option>
            ))}
          </Select>
        </div>
        <input type="hidden" name="is_time_fixed" value={isTimeFixed ? "true" : "false"} />
        <input type="hidden" name="time_windows" value={windowsPayload} />
      </div>

      {isTimeFixed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">고정 시간</p>
            <Button type="button" variant="secondary" size="sm" onClick={addWindow}>
              시간 추가
            </Button>
          </div>

          <div className="space-y-2">
            {windows.map((window, index) => (
              <div
                key={window.id}
                className="grid grid-cols-1 gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">요일</label>
                  <Select
                    value={window.day_of_week.toString()}
                    onChange={(e) => updateWindow(window.id, { day_of_week: Number(e.target.value) })}
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
                    value={window.start_time}
                    onChange={(e) => updateWindow(window.id, { start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">종료</label>
                  <Input
                    type="time"
                    value={window.end_time}
                    onChange={(e) => updateWindow(window.id, { end_time: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-end justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-red-600"
                    onClick={() => removeWindow(window.id)}
                    disabled={windows.length === 1 && index === 0}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
