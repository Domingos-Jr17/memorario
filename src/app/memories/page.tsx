import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { addMemory, getMemories, updateMemory, deleteMemory } from '@/lib/memoryService';
import { Memory } from '@/types/memory';
import MemoryCard from '@/components/MemoryCard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MemoriesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user]);

  const fetchMemories = async () => {
    try {
      const userMemories = await getMemories();
      setMemories(userMemories);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddOrUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingMemory) {
        await updateMemory(
          editingMemory.id!,
          title,
          description,
          imageFile || undefined,
          videoFile || undefined,
          editingMemory.imageUrl,
          editingMemory.videoUrl
        );
      } else {
        await addMemory(title, description, imageFile || undefined, videoFile || undefined);
      }
      setTitle('');
      setDescription('');
      setImageFile(null);
      setVideoFile(null);
      setEditingMemory(null);
      fetchMemories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setTitle(memory.title);
    setDescription(memory.description);
    // Image and video files are not pre-filled for security/complexity reasons
    // User will need to re-upload if they want to change them
  };

  const handleDelete = async (id: string, imageUrl?: string, videoUrl?: string) => {
    setError(null);
    try {
      await deleteMemory(id, imageUrl, videoUrl);
      fetchMemories();
    } catch (err: any) {
      setError(err.message);
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

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editingMemory ? 'Edit Memory' : 'Add New Memory'}
          </h2>
          <form onSubmit={handleAddOrUpdateMemory} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Image (optional)
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label htmlFor="video" className="block text-sm font-medium text-gray-700">
                Video (optional)
              </label>
              <input
                type="file"
                id="video"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              {editingMemory ? 'Update Memory' : 'Add Memory'}
            </button>
            {editingMemory && (
              <button
                type="button"
                onClick={() => {
                  setEditingMemory(null);
                  setTitle('');
                  setDescription('');
                  setImageFile(null);
                  setVideoFile(null);
                }}
                className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
