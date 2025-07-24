import type { Meta, StoryObj } from '@storybook/nextjs';
import MemoryCard from './MemoryCard';

const mockMemory = {
  id: '1',
  userId: 'user123',
  title: 'Minhas Férias na Praia',
  description: '<p>Foi uma viagem incrível para a praia, com muito sol e mar!</p>',
  isPublic: true,
  createdAt: new Date('2023-07-20T10:00:00Z'),
  tags: ['viagem', 'praia', 'férias'],
  images: [
    { url: 'https://via.placeholder.com/400x300?text=Praia1', publicId: 'praia1' },
    { url: 'https://via.placeholder.com/400x300?text=Praia2', publicId: 'praia2' },
  ],
  videos: [
    { url: 'https://www.w3schools.com/html/mov_bbb.mp4', publicId: 'video1' },
  ],
  likes: ['user456', 'user789'],
  comments: [
    { userId: 'user456', username: 'Alice', text: 'Que legal! Saudades da praia.', createdAt: new Date('2023-07-20T11:00:00Z') },
  ],
};

const meta: Meta<typeof MemoryCard> = {
  title: 'Components/MemoryCard',
  component: MemoryCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    memory: { control: 'object' },
    onEdit: { action: 'edited' },
    onDelete: { action: 'deleted' },
    onMemoryUpdated: { action: 'memoryUpdated' },
  },
} satisfies Meta<typeof MemoryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    memory: mockMemory,
  },
};

export const NoMedia: Story = {
  args: {
    memory: { ...mockMemory, images: [], videos: [] },
  },
};

export const NoTags: Story = {
  args: {
    memory: { ...mockMemory, tags: [] },
  },
};

export const NoComments: Story = {
  args: {
    memory: { ...mockMemory, comments: [] },
  },
};

export const LongDescription: Story = {
  args: {
    memory: { ...mockMemory, description: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>' },
  },
};
