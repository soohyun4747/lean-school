"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button, type ButtonProps } from "./button";

interface Props extends Omit<ButtonProps, "type"> {
  message?: string;
  children: ReactNode;
}

export function ConfirmSubmitButton({ message = "정말 삭제하시겠습니까?", children, onClick, ...props }: Props) {
  const handleClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"] = (event) => {
    if (!confirm(message)) return;
    onClick?.(event);
    const form = (event.currentTarget as HTMLButtonElement).form;
    form?.requestSubmit();
  };

  return (
    <Button type="button" onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}
