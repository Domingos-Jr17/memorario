import React, { useState, useMemo } from 'react';
import { Memory } from '@/types/memory';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Edit, Trash2, CalendarDays } from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
  onEdit: (memory: Memory) => void;
  onDelete: (memory: Memory) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onEdit, onDelete }) => {
  const createdAtDate = useMemo(() => {
    if (!memory.createdAt) return null;
    return memory.createdAt instanceof Date ? memory.createdAt : new Date(memory.createdAt);
  }, [memory.createdAt]);

  const formattedDate = createdAtDate ? createdAtDate.toLocaleDateString() : 'N/A';

  // Criar array de mídia combinando imagens e vídeos (com tipo para renderizar corretamente)
  type MediaItem = { type: 'image' | 'video'; url: string; };
  const mediaItems: MediaItem[] = [];

  if (memory.images && memory.images.length > 0) {
    memory.images.forEach(image => mediaItems.push({ type: 'image', url: image.url }));
  }
  if (memory.videos && memory.videos.length > 0) {
    memory.videos.forEach(video => mediaItems.push({ type: 'video', url: video.url }));
  }

  // Controle do índice do carousel
  const [currentIndex, setCurrentIndex] = useState(0);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label={`Memory: ${memory.title}`}
      tabIndex={0}
      role="article"
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{memory.title}</h3>

      <p className="text-gray-600 text-sm mb-4 flex items-center">
        <CalendarDays className="w-4 h-4 mr-1 text-gray-500" aria-hidden="true" />
        <time dateTime={createdAtDate?.toISOString() || undefined}>{formattedDate}</time>
      </p>

      <p className="text-gray-700 mb-4 flex-grow text-base leading-relaxed">{memory.description}</p>

      {mediaItems.length > 0 && (
        <div className="relative w-full h-56 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
          {mediaItems[currentIndex].type === 'image' ? (
            <Image
              src={mediaItems[currentIndex].url}
              alt={`Media ${currentIndex + 1} of ${memory.title}`}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <video
              controls
              src={mediaItems[currentIndex].url}
              className="rounded-lg w-full h-full object-cover"
              aria-label={`Video ${currentIndex + 1} of ${memory.title}`}
            />
          )}

          {/* Navegação do carousel */}
          <button
            onClick={goPrev}
            aria-label="Previous media"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded-full hover:bg-opacity-60 transition"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            aria-label="Next media"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded-full hover:bg-opacity-60 transition"
          >
            ›
          </button>

          {/* Indicadores de posição */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {mediaItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to media ${i + 1}`}
                className={`w-3 h-3 rounded-full transition-colors ${i === currentIndex ? 'bg-indigo-600' : 'bg-gray-400'}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-auto pt-4 border-t border-gray-100">
        <motion.button
          onClick={() => onEdit(memory)}
          className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm transition duration-200 ease-in-out"
          aria-label={`Edit memory: ${memory.title}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
        >
          <Edit className="w-4 h-4 mr-2" aria-hidden="true" /> Edit
        </motion.button>

        <motion.button
          onClick={() => onDelete(memory)}
          className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm transition duration-200 ease-in-out"
          aria-label={`Delete memory: ${memory.title}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
        >
          <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" /> Delete
        </motion.button>
      </div>
    </motion.article>
  );
};

export default MemoryCard;
