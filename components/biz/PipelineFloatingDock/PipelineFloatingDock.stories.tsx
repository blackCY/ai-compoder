import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PipelineFloatingDock } from './index';

const meta: Meta<typeof PipelineFloatingDock> = {
  title: 'Business/PipelineFloatingDock',
  component: PipelineFloatingDock,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full h-screen bg-[#0a0a0a] relative">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    pipelineId: 'business-code-generate',
    placeholder: '例如：创建一个响应式的用户配置文件卡片组件，包含头像、姓名、邮箱和编辑功能...',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    pipelineId: 'business-code-generate',
    placeholder: '输入您的需求描述...',
  },
};

export const WithCustomClass: Story = {
  args: {
    pipelineId: 'business-code-generate',
    placeholder: '例如：创建一个用户登录表单...',
    className: 'bottom-16',
  },
};
