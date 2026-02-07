import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FloatingDock } from './index';

const meta: Meta<typeof FloatingDock> = {
  title: 'Business/FloatingDock',
  component: FloatingDock,
  parameters: {
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full h-screen bg-gray-900 relative">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCallback: Story = {
  args: {
    onGenerate: (input: string) => {
      console.log('Command executed:', input);
    },
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'mb-10',
  },
};