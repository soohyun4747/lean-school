import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>{children}</div>;
}

export function CardHeader({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("flex items-center justify-between border-b px-4 py-3", className)}>{children}</div>;
}

export function CardTitle({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <h3 className={cn("text-base font-semibold text-slate-900", className)}>{children}</h3>;
}

export function CardContent({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("px-4 py-3 text-sm text-slate-700", className)}>{children}</div>;
}
