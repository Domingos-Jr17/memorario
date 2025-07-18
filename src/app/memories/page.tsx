/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Info } from 'lucide-react';
import dynamic from 'next/dynamic';

import { useAuth } from '@/context/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
// import MemoryForm from '@/components/MemoryForm';
import MemoryCard from '@/components/MemoryCard';
import { getMemories, deleteMemory } from '@/lib/memoryService';
import { Memory } from '@/types/memory';

const DynamicMemoryForm = dynamic(() => import('@/components/MemoryForm'), {
  ssr: false,
  loading: () => <p>Loading form...</p>,
});

export default function MemoriesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const PAGE_SIZE = 10;

  const fetchMemories = useCallback(async (loadMore: boolean = false) => {
    setIsLoadingMemories(true);
    try {
      const { memories: newMemories, lastVisible: newLastVisible } = await getMemories(PAGE_SIZE, loadMore ? lastVisible : null, searchQuery);
      setMemories((prevMemories) => loadMore ? [...prevMemories, ...newMemories] : newMemories);
      setLastVisible(newLastVisible);
      setHasMore(newMemories.length === PAGE_SIZE);
    } catch (err: any) {
      toast.error(`Failed to load memories: ${err.message}`);
    } finally {
      setIsLoadingMemories(false);
    }
  }, [lastVisible, searchQuery]);

  useEffect(() => {
    if (user) {
      fetchMemories(false); // Fetch initial memories
    } else {
      setIsLoadingMemories(false);
    }
  }, [fetchMemories, user]);

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

  const handleDelete = (memory: Memory) => {
    setMemoryToDelete(memory);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!memoryToDelete) return;

    setShowDeleteConfirm(false);
    try {
      await deleteMemory(memoryToDelete.id!, memoryToDelete.images, memoryToDelete.videos);
      toast.success('Memory deleted successfully!');
      setMemoryToDelete(null);
      setMemories([]); // Clear existing memories
      setLastVisible(null); // Reset lastVisible document
      setHasMore(true); // Assume there are more memories to load
      fetchMemories(false); // Fetch memories from the beginning
    } catch (err: any) {
      toast.error(`Failed to delete memory: ${err.message}`);
    }
  };

  const handleMemoryFormSuccess = () => {
    setEditingMemory(null);
    setMemories([]); // Clear existing memories
    setLastVisible(null); // Reset lastVisible document
    setHasMore(true); // Assume there are more memories to load
    setSearchQuery(''); // Reset search query
    fetchMemories(false); // Fetch memories from the beginning
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Memories</h1>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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
          {/* {error && (
            <p className="text-red-500 text-sm text-center mb-4" role="alert">
              {error}
            </p>
          )} */}

          {/* Memory Form */}
          <DynamicMemoryForm
            editingMemory={editingMemory}
            onMemoryAddedOrUpdated={handleMemoryFormSuccess}
            onCancelEdit={handleCancelEdit}
            
          />

          {/* Loader, Empty or List */}
          {isLoadingMemories && memories.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(PAGE_SIZE)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse border border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                  <div className="h-40 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
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

          {hasMore && (
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={() => fetchMemories(true)}
                disabled={isLoadingMemories}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out"
              >
                {isLoadingMemories ? "Loading more..." : "Load More"}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this memory? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
}
