"use client";

import { cn } from "lib/utils";
import type { CommandItemProps } from "../types";

export function CommandItem({ command, onClick, className }: CommandItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 rounded-lg",
        "text-foreground hover:bg-accent hover:text-accent-foreground",
        "transition-colors cursor-pointer",
        "flex items-center gap-3",
        className
      )}
    >
      <span className="flex-1">{command.label}</span>
    </button>
  );
}