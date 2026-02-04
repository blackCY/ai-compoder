import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CodeEditor } from './index';

const meta: Meta<typeof CodeEditor> = {
  title: 'Business/CodeEditor',
  component: CodeEditor,
  parameters: {
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCode: Story = {
  args: {
    code: `const greeting = 'Hello, World!';
console.log(greeting);

function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 3);`,
    language: 'javascript',
  },
};

export const TypeScript: Story = {
  args: {
    code: `interface User {
  id: number;
  name: string;
  email: string;
  return this.users.find(user => user.id === id);
  }
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}`,
    language: 'typescript',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: '// Start typing your code here...',
  },
};