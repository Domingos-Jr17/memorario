import React from 'react';
import { Memory } from '@/types/memory';
import Image from 'next/image';

interface MemoryCardProps {
  memory: Memory;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string, imageUrl?: string, videoUrl?: string, imagePublicId?: string, videoPublicId?: string) => void;
}

const MemoryCard = ({ memory, onEdit, onDelete }: MemoryCardProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-xl font-semibold mb-2">{memory.title}</h3>
      <p className="text-gray-700 mb-4">{memory.description}</p>
      {memory.imageUrl && (
        <div className="mb-4">
          <Image src={memory.imageUrl} alt={memory.title} width={300} height={200} className="rounded-md" />
        </div>
      )}
      {memory.videoUrl && (
        <div className="mb-4">
          <video controls src={memory.videoUrl} className="rounded-md w-full" data-testid="memory-video" />
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onEdit(memory)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(memory.id!, memory.imageUrl, memory.videoUrl, memory.imagePublicId, memory.videoPublicId)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default MemoryCard;