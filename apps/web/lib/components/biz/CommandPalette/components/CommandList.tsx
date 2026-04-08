"use client";

import { cn } from "lib/utils";
import type { Command, CommandGroup, CommandListProps } from "../types";
import { CommandItem } from "./CommandItem";
import { filterCommandsBySearch } from "../utils";

export function CommandList({
  groups,
  searchQuery,
  onCommandSelect,
  className,
}: CommandListProps) {
  const filteredGroups = filterCommandsBySearch(groups, searchQuery);

  if (filteredGroups.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No commands found
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {filteredGroups.map((group) => (
        <div key={group.category} className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4">
            {group.label}
          </h3>
          <div className="flex flex-col gap-1">
            {group.commands.map((command) => (
              <CommandItem
                key={command.id}
                command={command}
                onClick={() => onCommandSelect(command)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}