import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PreviewPanel } from './index';

const meta: Meta<typeof PreviewPanel> = {
  title: 'Business/PreviewPanel',
  component: PreviewPanel,
  parameters: {
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithContent: Story = {
  args: {
    children: (
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Preview Content</h3>
        <p className="text-sm">This is custom preview content</p>
      </div>
    ),
  },
};

export const CustomClassName: Story = {
  args: {
    className: 'w-96 h-64',
    children: 'Custom sized preview panel',
  },
};