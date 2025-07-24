import React, { useState, useMemo } from 'react';
import { Memory, Timestamp, MemoryComment } from '@/types/memory';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Edit, Trash2, CalendarDays, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { toggleLike, addComment } from '@/lib/memoryService';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface MemoryCardProps {
  memory: Memory;
  onEdit?: (memory: Memory) => void;
  onDelete?: (memory: Memory) => void;
  onMemoryUpdated?: () => void; // Callback for when a memory is liked/commented
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onEdit, onDelete, onMemoryUpdated }) => {
  const { user } = useAuth();
  const hasLiked = user && memory.likes?.includes(user.uid);
  const [newCommentText, setNewCommentText] = useState('');

  const handleLikeToggle = async () => {
    if (!user) {
      toast.error('You must be logged in to like memories.');
      return;
    }
    try {
      await toggleLike(memory.id!, user.uid);
      if (onMemoryUpdated) onMemoryUpdated();
    } catch (error: unknown) {
      toast.error(`Failed to toggle like: ${(error as Error).message}`);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error('You must be logged in to comment.');
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      const comment: MemoryComment = {
        userId: user.uid,
        username: user.displayName || user.email || 'Anonymous',
        text: newCommentText,
        createdAt: new Date(),
      };
      await addComment(memory.id!, comment);
      setNewCommentText('');
      if (onMemoryUpdated) onMemoryUpdated();
    } catch (error: unknown) {
      toast.error(`Failed to add comment: ${(error as Error).message}`);
    }
  };

  const createdAtDate = useMemo(() => {
    if (!memory.createdAt) return null;
    if (memory.createdAt instanceof Date) {
      return memory.createdAt;
    }
    return (memory.createdAt as Timestamp).toDate();
  }, [memory.createdAt]);

  const formattedDate = createdAtDate ? createdAtDate.toLocaleDateString() : 'N/A';

  // Criar array de mídia combinando imagens e vídeos (com tipo para renderizar corretamente)
  type MediaItem = { type: 'image' | 'video'; url: string; publicId?: string };
  const mediaItems: MediaItem[] = [];

  if (memory.images && memory.images.length > 0) {
    memory.images.forEach(image => mediaItems.push({ type: 'image', url: image.url, publicId: image.publicId }));
  }
  if (memory.videos && memory.videos.length > 0) {
    memory.videos.forEach(video => mediaItems.push({ type: 'video', url: video.url, publicId: video.publicId }));
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
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      className="bg-background text-text shadow-lg rounded-xl p-6 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={`Memory: ${memory.title}`}
      tabIndex={0}
      role="article"
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{memory.title}</h3>

      <p className="text-gray-600 text-sm mb-4 flex items-center">
        <CalendarDays className="w-4 h-4 mr-1 text-gray-500" aria-hidden="true" />
        <time dateTime={createdAtDate?.toISOString() || undefined}>{formattedDate}</time>
      </p>

      <div className="text-gray-700 mb-4 flex-grow text-base leading-relaxed ck-content" dangerouslySetInnerHTML={{ __html: memory.description || '' }} />

      {memory.tags && memory.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {memory.tags.map((tag, index) => (
            <span key={index} className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {mediaItems.length > 0 && (
        <div className="relative w-full h-56 rounded-lg overflow-hidden bg-accent flex items-center justify-center mb-4">
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
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/40 text-text p-1 rounded-full hover:bg-background/60 transition"
          >
            ‹
          </button>
          <motion.button
            onClick={goNext}
            aria-label="Next media"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/40 text-text p-1 rounded-full hover:bg-background/60 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ›
          </motion.button>

          {/* Indicadores de posição */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {mediaItems.map((_, i) => (
              <motion.button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to media ${i + 1}`}
            className={`w-3 h-3 rounded-full transition-colors ${i === currentIndex ? 'bg-primary' : 'bg-muted-foreground'}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          />
            ))}
          </div>
        </div>
      )}

      {/* Likes and Comments Section */}
      <div className="flex items-center gap-4 mb-4">
        <motion.button
          onClick={handleLikeToggle}
          className={`flex items-center gap-1 text-sm font-medium ${hasLiked ? 'text-error' : 'text-text hover:text-error'}`}
          aria-label={hasLiked ? 'Unlike memory' : 'Like memory'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart className="w-5 h-5 fill-current" />
          <span>{memory.likes?.length || 0} Likes</span>
        </motion.button>
        <div className="flex items-center gap-1 text-sm font-medium text-text">
          <MessageCircle className="w-5 h-5" />
          <span>{memory.comments?.length || 0} Comments</span>
        </div>
      </div>

      {/* Comments Display */}
      {memory.comments && memory.comments.length > 0 && (
        <div className="pt-4 mt-4">
          <h4 className="text-lg font-semibold text-text mb-3">Comments</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {memory.comments.map((comment, index) => (
              <div key={index} className="bg-background/90 p-3 rounded-lg">
                <p className="text-sm font-semibold text-text">{comment.username} <span className="text-text/70 text-xs font-normal">({(comment.createdAt instanceof Date ? comment.createdAt : (comment.createdAt as Timestamp).toDate()).toLocaleDateString()})</span></p>
                <p className="text-text text-sm mt-1">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Comment Input */}
      <div className="mt-4">
        <Textarea
          className="w-full p-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text"
          rows={2}
          placeholder="Add a comment..."
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
        />
        <motion.button
          onClick={handleAddComment}
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 text-sm"
          disabled={!newCommentText.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Post Comment
        </motion.button>
      </div>

      <motion.div 
        className="flex justify-end space-x-3 mt-auto pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => onEdit && onEdit(memory)}
          disabled={!onEdit}
          className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Edit memory: ${memory.title}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
        >
          <Edit className="w-4 h-4 mr-2" aria-hidden="true" /> Edit
        </motion.button>

        <motion.button
          onClick={() => onDelete && onDelete(memory)}
          disabled={!onDelete}
          className="flex items-center px-4 py-2 bg-error hover:bg-error/90 text-error-foreground font-medium rounded-lg shadow-sm transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Delete memory: ${memory.title}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
        >
          <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" /> Delete
        </motion.button>
      </motion.div>
    </motion.article>
  );
};

export default MemoryCard;
