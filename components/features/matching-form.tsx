"use client";

import { useFormState } from "react-dom";
import { runMatchingAction, type MatchingFormState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  courses: { id: string; title: string }[];
}

export function MatchingForm({ courses }: Props) {
  const initialState: MatchingFormState = {};
  const [state, action] = useFormState<MatchingFormState, FormData>(runMatchingAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-700">수업</label>
          <select name="course_id" className="w-full rounded-md border border-slate-200 px-3 py-2" required>
            <option value="">선택</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">기간 시작</label>
          <Input type="datetime-local" name="from" required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">기간 종료</label>
          <Input type="datetime-local" name="to" required />
        </div>
      </div>
      <Button type="submit">자동 매칭 실행</Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">{state.success}</p>}
    </form>
  );
}
