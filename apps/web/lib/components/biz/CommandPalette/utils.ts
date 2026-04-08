import type { Command } from "./types";

export function matchesSearch(command: Command, query: string): boolean {
  if (!query) return true;

  const searchTerm = query.toLowerCase();
  const labelMatch = command.label.toLowerCase().includes(searchTerm);
  const keywordsMatch = command.keywords?.some((kw) =>
    kw.toLowerCase().includes(searchTerm)
  );

  return labelMatch || keywordsMatch || false;
}

export function filterCommandsBySearch(
  groups: Array<{ category: string; label: string; commands: Command[] }>,
  searchQuery: string
): Array<{ category: string; label: string; commands: Command[] }> {
  return groups
    .map((group) => ({
      ...group,
      commands: group.commands.filter((cmd) => matchesSearch(cmd, searchQuery)),
    }))
    .filter((group) => group.commands.length > 0);
}
