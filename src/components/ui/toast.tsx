"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastProps = {
  message: string;
  type?: "default" | "destructive";
  onDismiss: () => void;
};

export function Toast({ message, type = "default", onDismiss }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center justify-between rounded-md p-4 shadow-lg",
        type === "destructive"
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      )}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-4 text-current hover:opacity-70"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
