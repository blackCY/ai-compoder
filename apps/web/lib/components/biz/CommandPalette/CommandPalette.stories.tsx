import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CommandPalette } from "./index";

const meta: Meta<typeof CommandPalette> = {
  title: "Business/CommandPalette",
  component: CommandPalette,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithInitialOpen: Story = {
  args: {},
  render: () => {
    // For demonstration: CommandPalette is controlled by atom state
    // In actual use, press Cmd/Ctrl + K to open
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground mb-4">
          Press <kbd className="px-2 py-1 bg-muted rounded">Cmd/Ctrl + K</kbd> to open command palette
        </p>
        <CommandPalette />
      </div>
    );
  },
};
