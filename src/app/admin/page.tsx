/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Info, Trash2 } from 'lucide-react';


import { useAuth } from '@/context/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAllMemoriesForAdmin, deleteMemory, getTotalMemoriesCount } from '@/lib/memoryService';
import { Memory } from '@/types/memory';

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<Memory | null>(null);
  const [totalMemoriesCount, setTotalMemoriesCount] = useState<number | null>(null);

  const PAGE_SIZE = 10;

  const fetchAllMemories = useCallback(async (loadMore: boolean = false) => {
    setIsLoadingMemories(true);
    try {
      const { memories: newMemories, lastVisible: newLastVisible } = await getAllMemoriesForAdmin(PAGE_SIZE, loadMore ? lastVisible : null);
      setMemories((prevMemories) => loadMore ? [...prevMemories, ...newMemories] : newMemories);
      setLastVisible(newLastVisible);
      setHasMore(newMemories.length === PAGE_SIZE);
    } catch (err: any) {
      toast.error(`Failed to load all memories: ${err.message}`);
    } finally {
      setIsLoadingMemories(false);
    }
  }, [lastVisible]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAllMemories(false);
      getTotalMemoriesCount().then(setTotalMemoriesCount).catch(err => toast.error(`Failed to get total memories count: ${err.message}`));
    } else if (!user) {
      setIsLoadingMemories(false);
      router.push('/login'); // Redirect if not logged in
    }
  }, [user, isAdmin, fetchAllMemories, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Logged out successfully.');
      router.push('/login');
    } catch (err: any) {
      toast.error(`Logout failed: ${err.message}`);
    }
  };

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
      fetchAllMemories(false); // Fetch memories from the beginning
    } catch (err: any) {
      toast.error(`Failed to delete memory: ${err.message}`);
    }
  };

  if (!user || !user.emailVerified || !isAdmin) {
    return <p>Access Denied. You are not authorized to view this page.</p>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <motion.button
              onClick={handleLogout}
              className="flex items-center px-6 py-3 bg-error hover:bg-error/90 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out"
              aria-label="Logout from your account"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
            >
              <LogOut className="w-5 h-5 mr-2" aria-hidden="true" />
              Logout
            </motion.button>
          </div>

          {/* Statistics Section (Placeholder) */}
          <div className="bg-background shadow-lg rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistics</h2>
            <p className="text-gray-700">Total Memories: {totalMemoriesCount !== null ? totalMemoriesCount : 'Loading...'}</p>
            {/* TODO: Implement actual total memory count and user count from DB */}
          </div>

          {/* All Memories List */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Memories</h2>
          {isLoadingMemories && memories.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(PAGE_SIZE)].map((_, index) => (
                <div key={index} className="bg-background rounded-xl shadow-lg p-6 animate-pulse">
                  <div className="h-6 bg-primary/90 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-primary/90 rounded w-full mb-2"></div>
                  <div className="h-4 bg-primary/90 rounded w-5/6 mb-6"></div>
                  <div className="h-40 bg-primary/90 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12 px-4 bg-background rounded-lg shadow-md">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
              <p className="text-xl font-semibold text-gray-700 mb-2">No memories found.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <AnimatePresence>
                {memories.map((memory) => (
                  <div key={memory.id} className="relative bg-background shadow-lg rounded-xl p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{memory.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">By: {memory.userId}</p> {/* Displaying userId for now */}
                    <p className="text-gray-700 mb-4 flex-grow text-base leading-relaxed ck-content" dangerouslySetInnerHTML={{ __html: memory.description || '' }} />
                    <div className="flex justify-end mt-auto pt-4 border-t border-gray-100">
                      <motion.button
                        onClick={() => handleDelete(memory)}
                        className="flex items-center px-4 py-2 bg-error hover:bg-error/90 text-error-foreground font-medium rounded-lg shadow-sm transition duration-200 ease-in-out"
                        aria-label={`Delete memory: ${memory.title}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                      >
                        <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" /> Delete
                      </motion.button>
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {hasMore && (
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={() => fetchAllMemories(true)}
                disabled={isLoadingMemories}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md transition duration-200 ease-in-out"
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
            className="fixed inset-0 bg-background/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-background rounded-lg p-6 shadow-xl max-w-sm w-full text-center"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this memory? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 border border-input rounded-md text-text hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-error text-error-foreground rounded-md hover:bg-error/90 transition"
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
