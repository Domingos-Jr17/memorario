/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

import { getPublicMemories } from '@/lib/memoryService';
import MemoryCard from '@/components/MemoryCard';
import { Memory } from '@/types/memory';

export default function PublicMemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 10;

  const fetchPublicMemories = useCallback(async (loadMore: boolean = false) => {
    setIsLoadingMemories(true);
    try {
      const { memories: newMemories, lastVisible: newLastVisible } = await getPublicMemories(PAGE_SIZE, loadMore ? lastVisible : null);
      setMemories((prevMemories) => loadMore ? [...prevMemories, ...newMemories] : newMemories);
      setLastVisible(newLastVisible);
      setHasMore(newMemories.length === PAGE_SIZE);
    } catch (err: any) {
      toast.error(`Failed to load public memories: ${err.message}`);
    } finally {
      setIsLoadingMemories(false);
    }
  }, [lastVisible]);

  useEffect(() => {
    fetchPublicMemories(false);
  }, [fetchPublicMemories]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8 text-center">Public Memories</h1>

        {/* {error && (
          <p className="text-red-500 text-sm text-center mb-4" role="alert">
            {error}
          </p>
        )} */}

        {isLoadingMemories && memories.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[...Array(PAGE_SIZE)].map((_, index) => (
              <div key={index} className="bg-background rounded-xl shadow-lg p-6 animate-pulse border border-primary">
                <div className="h-6 bg-primary/90 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-primary/90 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary/90 rounded w-5/6 mb-6"></div>
                <div className="h-40 bg-primary/90 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-12 px-4 bg-background rounded-lg shadow-md border border-primary">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-xl font-semibold text-gray-700 mb-2">No public memories available yet.</p>
            <p className="text-gray-500">Check back later or share your own!</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <AnimatePresence>
              {memories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-8">
            <motion.button
              onClick={() => fetchPublicMemories(true)}
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
  );
}
