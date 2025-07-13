import React, { useState, useEffect } from 'react';
import { addMemory, updateMemory } from '@/lib/memoryService';
import { Memory } from '@/types/memory';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video as VideoIcon, Trash2 } from 'lucide-react';

function useMultiFileInput(initialMedia?: { url: string; publicId: string }[]) {
  const [files, setFiles] = useState<File[]>([]);
  const [media, setMedia] = useState<{ url: string; publicId: string }[]>(initialMedia || []);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const filesArray = Array.from(newFiles);
    setFiles((prev) => [...prev, ...filesArray]);
  };

  const removeFileByIndex = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeMediaByIndex = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = (newMedia?: { url: string; publicId: string }[]) => {
    setFiles([]);
    setMedia(newMedia || []);
  };

  return {
    files,
    media,
    addFiles,
    removeFileByIndex,
    removeMediaByIndex,
    reset,
  };
}

interface MemoryFormProps {
  editingMemory: Memory | null;
  onMemoryAddedOrUpdated: () => void;
  onCancelEdit: () => void;
  setError?: (message: string | null) => void;
}

const MemoryForm: React.FC<MemoryFormProps> = ({
  editingMemory,
  onMemoryAddedOrUpdated,
  onCancelEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const imageInput = useMultiFileInput(editingMemory?.images);
  const videoInput = useMultiFileInput(editingMemory?.videos);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingMemory) {
      setTitle(editingMemory.title);
      setDescription(editingMemory.description || '');
      imageInput.reset(editingMemory.images);
      videoInput.reset(editingMemory.videos);
    } else {
      setTitle('');
      setDescription('');
      imageInput.reset();
      videoInput.reset();
    }
  }, [editingMemory]);

  const handleAddOrUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingMemory) {
        await updateMemory(
          editingMemory.id!,
          title,
          description,
          imageInput.files,
          videoInput.files,
          imageInput.media,
          videoInput.media
        );
        toast.success('Memory updated successfully!');
      } else {
        await addMemory(title, description, imageInput.files, videoInput.files);
        toast.success('Memory added successfully!');
      }
      onMemoryAddedOrUpdated();
      setTitle('');
      setDescription('');
      imageInput.reset();
      videoInput.reset();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`Error: ${err.message}`);
      } else {
        toast.error('Unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white shadow-lg rounded-xl p-8 mb-8 border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        {editingMemory ? 'Edit Memory' : 'Add New Memory'}
      </h2>
      <form onSubmit={handleAddOrUpdateMemory} className="space-y-6" noValidate>
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
            className="mt-1 block w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            disabled={isSubmitting}
            className="mt-1 block w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
          ></textarea>
        </div>

        {/* Images */}
        <div>
          <label htmlFor="images" className="block text-sm font-semibold text-gray-700 mb-1">
            <ImageIcon className="inline w-5 h-5 mr-2 text-gray-600" /> Images (optional)
          </label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={(e) => imageInput.addFiles(e.target.files)}
            disabled={isSubmitting}
          />
          {[...imageInput.media, ...imageInput.files.map((f) => ({ url: f.name, publicId: '' }))].map((file, index) => (
            <div key={index} className="flex items-center mt-2 p-2 bg-gray-50 border rounded-md">
              <span className="text-sm text-gray-600">{file.publicId ? 'Existing' : 'New'} Image {index + 1}</span>
              {file.url && file.publicId && (
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-600 hover:underline">View</a>
              )}
              <motion.button
                type="button"
                onClick={() => file.publicId ? imageInput.removeMediaByIndex(index) : imageInput.removeFileByIndex(index - imageInput.media.length)}
                className="ml-auto text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          ))}
        </div>

        {/* Videos */}
        <div>
          <label htmlFor="videos" className="block text-sm font-semibold text-gray-700 mb-1">
            <VideoIcon className="inline w-5 h-5 mr-2 text-gray-600" /> Videos (optional)
          </label>
          <input
            type="file"
            id="videos"
            multiple
            accept="video/*"
            onChange={(e) => videoInput.addFiles(e.target.files)}
            disabled={isSubmitting}
          />
          {[...videoInput.media, ...videoInput.files.map((f) => ({ url: f.name, publicId: '' }))].map((file, index) => (
            <div key={index} className="flex items-center mt-2 p-2 bg-gray-200 border rounded-md">
              <span className="text-sm text-gray-600">{file.publicId ? 'Existing' : 'New'} Video {index + 1}</span>
              {file.url && file.publicId && (
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-600 hover:underline">View</a>
              )}
              <motion.button
                type="button"
                onClick={() => file.publicId ? videoInput.removeMediaByIndex(index) : videoInput.removeFileByIndex(index - videoInput.media.length)}
                className="ml-auto text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            {isSubmitting ? 'Saving...' : editingMemory ? 'Update Memory' : 'Add Memory'}
          </motion.button>
          {editingMemory && (
            <motion.button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default MemoryForm;
