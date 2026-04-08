// CommandPalette.tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "lib/ui/dialog";
import { useAtom } from "jotai";
import { commandPaletteOpenAtom } from "lib/store/pipeline/atoms";
import { useCommands } from "./commands";
import { CommandInput } from "./components/CommandInput";
import { CommandList } from "./components/CommandList";
import type { CommandGroup } from "./types";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useAtom(commandPaletteOpenAtom);
  const commandGroups = useCommands();
  const [searchQuery, setSearchQuery] = useState("");

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleCommandSelect = async (command: CommandGroup["commands"][number]) => {
    setIsOpen(false);
    setSearchQuery("");
    await command.action();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-xl"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => setIsOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <CommandInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Type a command or search..."
          />
          <div className="max-h-[400px] overflow-y-auto">
            <CommandList
              groups={commandGroups}
              searchQuery={searchQuery}
              onCommandSelect={handleCommandSelect}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
