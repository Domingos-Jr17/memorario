"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/useAuth';
import { useRouter } from 'next/navigation';
import { getMemories, deleteMemory } from '@/lib/memoryService';
import { Memory } from '@/types/memory';
import MemoryCard from '@/components/MemoryCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import MemoryForm from '@/components/MemoryForm';

export default function MemoriesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);

  const fetchMemories = useCallback(async () => {
    setIsLoadingMemories(true);
    try {
      const userMemories = await getMemories();
      setMemories(userMemories);
    } catch (err: any) {
      setError((err as Error).message);
    } finally {
      setIsLoadingMemories(false);
    }
  }, [setMemories]);

  useEffect(() => {
    if (user) {
      fetchMemories();
    } else {
      setIsLoadingMemories(false); // No user, so no memories to load
    }
  }, [user, fetchMemories]);

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory);
  };

  const handleDelete = async (id: string, imageUrl?: string, videoUrl?: string, imagePublicId?: string, videoPublicId?: string) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      setError(null);
      try {
        await deleteMemory(id, imageUrl, videoUrl, imagePublicId, videoPublicId);
        fetchMemories();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMemoryFormSuccess = () => {
    setEditingMemory(null);
    fetchMemories();
  };

  const handleCancelEdit = () => {
    setEditingMemory(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Memories</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <MemoryForm
          editingMemory={editingMemory}
          onMemoryAddedOrUpdated={handleMemoryFormSuccess}
          onCancelEdit={handleCancelEdit}
          setError={setError}
        />

        {isLoadingMemories ? (
          <p className="text-center text-gray-600">Loading memories...</p>
        ) : memories.length === 0 ? (
          <p className="text-center text-gray-600">No memories yet. Add your first memory!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}