import type { Meta, StoryObj } from '@storybook/nextjs';
import MemoryForm from './MemoryForm';
import { fn } from 'storybook/test';

const mockEditingMemory = {
  id: '1',
  userId: 'user123',
  title: 'Memória Existente',
  description: '<p>Esta é uma memória que está sendo editada.</p>',
  isPublic: false,
  createdAt: new Date('2023-01-01T12:00:00Z'),
  tags: ['existente', 'edição'],
  images: [],
  videos: [],
  likes: [],
  comments: [],
};

const meta: Meta<typeof MemoryForm> = {
  title: 'Components/MemoryForm',
  component: MemoryForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    editingMemory: { control: 'object' },
    onMemoryAddedOrUpdated: { action: 'memoryAddedOrUpdated' },
    onCancelEdit: { action: 'cancelEdit' },
    isAdmin: { control: 'boolean' },
  },
  args: {
    onMemoryAddedOrUpdated: fn(),
    onCancelEdit: fn(),
  },
} satisfies Meta<typeof MemoryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddNewMemory: Story = {
  args: {
    editingMemory: null,
    isAdmin: false,
  },
};

export const EditExistingMemory: Story = {
  args: {
    editingMemory: mockEditingMemory,
    isAdmin: false,
  },
};

export const AdminMode: Story = {
  args: {
    editingMemory: null,
    isAdmin: true,
  },
};
