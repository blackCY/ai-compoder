"use client";

import { useRouter } from "next/navigation";
import type { Command, CommandGroup } from "./types";

export function useCommands(): CommandGroup[] {
  const router = useRouter();

  const commands: Command[] = [
    // Navigation Commands
    {
      id: "nav.home",
      label: "Go to Home",
      category: "navigation",
      action: () => router.push("/"),
      keywords: ["home", "dashboard", "main"],
    },
    {
      id: "nav.editor",
      label: "Go to Editor",
      category: "navigation",
      action: () => router.push("/editor"),
      keywords: ["editor", "code", "edit"],
    },
    {
      id: "nav.config",
      label: "Go to Configuration",
      category: "navigation",
      action: () => {
        // Navigate to first available pipeline configuration
        router.push("/configuration/default");
      },
      keywords: ["config", "settings", "pipeline"],
    },

    // Pipeline Commands
    {
      id: "pipeline.create",
      label: "Create New Pipeline",
      category: "pipeline",
      action: () => {
        // TODO: Implement pipeline creation
        console.log("Create pipeline triggered");
      },
      keywords: ["create", "new", "add", "pipeline"],
    },

    // Editor Commands
    {
      id: "editor.format",
      label: "Format Code",
      category: "editor",
      action: () => {
        // TODO: Implement format code
        console.log("Format code triggered");
      },
      keywords: ["format", "pretty", "clean"],
    },
    {
      id: "editor.reset",
      label: "Reset Editor",
      category: "editor",
      action: () => {
        // TODO: Implement reset editor
        console.log("Reset editor triggered");
      },
      keywords: ["reset", "clear", "empty"],
    },

    // View Commands
    {
      id: "view.fullscreen",
      label: "Toggle Fullscreen",
      category: "view",
      action: () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      },
      keywords: ["fullscreen", "full", "screen"],
    },
  ];

  // Group commands by category
  const groupMap = new Map<string, Command>();
  commands.forEach((cmd) => groupMap.set(cmd.id, cmd));

  const groups: CommandGroup[] = [
    {
      category: "navigation",
      label: "Navigation",
      commands: commands.filter((c) => c.category === "navigation"),
    },
    {
      category: "pipeline",
      label: "Pipeline",
      commands: commands.filter((c) => c.category === "pipeline"),
    },
    {
      category: "editor",
      label: "Editor",
      commands: commands.filter((c) => c.category === "editor"),
    },
    {
      category: "view",
      label: "View",
      commands: commands.filter((c) => c.category === "view"),
    },
  ];

  return groups.filter((g) => g.commands.length > 0);
}