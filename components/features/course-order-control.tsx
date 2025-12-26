"use client";

import { useActionState, useState } from "react";
import { updateCourseOrder } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { success: false, error: undefined as string | undefined };

type Props = {
  courseId: string;
  initialOrder: number;
};

export function CourseOrderControl({ courseId, initialOrder }: Props) {
  const [order, setOrder] = useState(initialOrder ?? 0);
  const [state, formAction, isPending] = useActionState(
    (prevState: typeof initialState, formData: FormData) => {
      formData.set("sort_order", order.toString());
      return updateCourseOrder(courseId, prevState, formData);
    },
    initialState
  );

  const handleStep = (delta: number) => {
    setOrder((prev) => Math.max(0, prev + delta));
  };

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="sort_order" value={order} readOnly />
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <span className="text-xs font-semibold text-slate-600">순서</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => handleStep(-1)}
            aria-label="순서 내리기"
          >
            -
          </Button>
          <Input
            type="number"
            className="w-20 text-center"
            value={order}
            min={0}
            onChange={(event) => {
              const next = Number(event.target.value);
              setOrder(Number.isNaN(next) ? 0 : next);
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => handleStep(1)}
            aria-label="순서 올리기"
          >
            +
          </Button>
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "저장 중..." : "순서 저장"}
        </Button>
      </div>
      {state?.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      {state?.success && !isPending && (
        <p className="text-xs text-[var(--primary)]">저장되었습니다.</p>
      )}
    </form>
  );
}
