/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Loader2, Info } from 'lucide-react';

import { useAuth } from '@/context/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import MemoryForm from '@/components/MemoryForm';
import MemoryCard from '@/components/MemoryCard';
import { getMemories, deleteMemory } from '@/lib/memoryService';
import { Memory } from '@/types/memory';

export default function MemoriesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);

  const fetchMemories = useCallback(async () => {
    setIsLoadingMemories(true);
    try {
      const userMemories = await getMemories();
      setMemories(userMemories);
      setError(null);
    } catch (err: any) {
      toast.error(`Failed to load memories: ${err.message}`);
      setError(err.message);
    } finally {
      setIsLoadingMemories(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMemories();
    } else {
      setIsLoadingMemories(false);
    }
  }, [user, fetchMemories]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Logged out successfully.');
      router.push('/login');
    } catch (err: any) {
      toast.error(`Logout failed: ${err.message}`);
    }
  };

  const handleEdit = (memory: Memory) => setEditingMemory(memory);
  const handleCancelEdit = () => setEditingMemory(null);

  const handleDelete = async (memory: Memory) => {
    const confirmed = window.confirm('Are you sure you want to delete this memory?');
    if (!confirmed) return;

    try {
      await deleteMemory(memory.id!, memory.images, memory.videos);
      toast.success('Memory deleted successfully!');
      fetchMemories();
    } catch (err: any) {
      toast.error(`Failed to delete memory: ${err.message}`);
    }
  };

  const handleMemoryFormSuccess = () => {
    setEditingMemory(null);
    fetchMemories();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Memories</h1>
            <motion.button
              onClick={handleLogout}
              className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out"
              aria-label="Logout from your account"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
            >
              <LogOut className="w-5 h-5 mr-2" aria-hidden="true" />
              Logout
            </motion.button>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-center mb-4" role="alert">
              {error}
            </p>
          )}

          {/* Memory Form */}
          <MemoryForm
            editingMemory={editingMemory}
            onMemoryAddedOrUpdated={handleMemoryFormSuccess}
            onCancelEdit={handleCancelEdit}
            setError={setError}
          />

          {/* Loader, Empty or List */}
          {isLoadingMemories ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-indigo-500 w-10 h-10" aria-label="Loading memories" />
              <p className="ml-3 text-lg text-gray-600">Loading your precious memories...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-lg shadow-md border border-gray-200">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
              <p className="text-xl font-semibold text-gray-700 mb-2">No memories yet.</p>
              <p className="text-gray-500">Start by adding your first memory using the form above!</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <AnimatePresence>
                {memories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
