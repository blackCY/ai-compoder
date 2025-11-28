import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { ChatInterface } from './index';

const meta = {
  title: 'Business/ChatInterface',
  component: ChatInterface,
  parameters: {
    docs: {
      description: {
        component: 'AI聊天界面组件，支持实时代码生成、流式显示和交互式输入。'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
    showExamples: { control: 'boolean' }
  },
  args: { onGenerate: fn() }
} satisfies Meta<typeof ChatInterface>;

export default meta;
type Story = StoryObj<typeof meta>;

// Decorator to apply dark theme
const DarkThemeDecorator = (Story: any) => (
  <div className="dark">
    <div className="min-h-screen bg-background text-foreground p-4">
      <Story />
    </div>
  </div>
);

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  decorators: [DarkThemeDecorator],
  args: {
    showExamples: true
  }
};

export const WithoutExamples: Story = {
  decorators: [DarkThemeDecorator],
  args: {
    showExamples: false
  }
};

export const WithCustomClass: Story = {
  decorators: [DarkThemeDecorator],
  args: {
    className: 'max-w-3xl',
    showExamples: true
  }
};

export const Large: Story = {
  decorators: [DarkThemeDecorator],
  args: {
    className: 'max-w-6xl',
    showExamples: true
  }
};

export const Small: Story = {
  decorators: [DarkThemeDecorator],
  args: {
    className: 'max-w-md',
    showExamples: false
  }
};