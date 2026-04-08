// types.ts

export type CommandCategory =
  | "navigation"
  | "pipeline"
  | "stage"
  | "editor"
  | "view";

export interface Command {
  id: string;
  label: string;
  category: CommandCategory;
  action: () => void | Promise<void>;
  keywords?: string[];
}

export interface CommandGroup {
  category: CommandCategory;
  label: string;
  commands: Command[];
}

export interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface CommandItemProps {
  command: Command;
  onClick: () => void;
  className?: string;
}

export interface CommandListProps {
  groups: CommandGroup[];
  searchQuery: string;
  onCommandSelect: (command: Command) => void;
  className?: string;
}