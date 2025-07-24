import type { Meta, StoryObj } from '@storybook/nextjs';
import EmptyState from './EmptyState';
import { Inbox } from 'lucide-react';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    icon: { control: false }, // Icon is a ReactNode, so no direct control
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'No memories yet',
    message: 'Start by adding your first memory using the form above!',
  },
};

export const CustomIcon: Story = {
  args: {
    title: 'No results found',
    message: 'Try adjusting your search or filters.',
    icon: <Inbox size={64} className="text-blue-500" />,
  },
};

export const ShortMessage: Story = {
  args: {
    title: 'Nothing to see here',
    message: 'This section is empty.',
  },
};
