"use client";

import { SearchIcon } from "lucide-react";
import { cn } from "lib/utils";
import type { CommandInputProps } from "../types";

export function CommandInput({
  value,
  onChange,
  placeholder = "Type a command or search...",
  className,
}: CommandInputProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-12 pl-10 pr-4 bg-background border border-border rounded-lg",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500",
          "transition-all",
          className
        )}
        autoFocus
      />
    </div>
  );
}