/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { addMemory, updateMemory } from '@/lib/memoryService';
import { Memory } from '@/types/memory';

interface MemoryFormProps {
  editingMemory: Memory | null;
  onMemoryAddedOrUpdated: () => void;
  onCancelEdit: () => void;
  setError: (message: string | null) => void;
}

const MemoryForm: React.FC<MemoryFormProps> = ({
  editingMemory,
  onMemoryAddedOrUpdated,
  onCancelEdit,
  setError,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null | undefined>(undefined); // undefined means no change, null means clear
  const [videoFile, setVideoFile] = useState<File | null | undefined>(undefined); // undefined means no change, null means clear
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingMemory) {
      setTitle(editingMemory.title);
      setDescription(editingMemory.description);
      setCurrentImageUrl(editingMemory.imageUrl);
      setCurrentVideoUrl(editingMemory.videoUrl);
      setImageFile(undefined); // Reset file inputs
      setVideoFile(undefined); // Reset file inputs
    } else {
      setTitle('');
      setDescription('');
      setImageFile(undefined);
      setVideoFile(undefined);
      setCurrentImageUrl(undefined);
      setCurrentVideoUrl(undefined);
    }
  }, [editingMemory]);

  const handleAddOrUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (editingMemory) {
        await updateMemory(
          editingMemory.id!,
          title,
          description,
          imageFile === null ? undefined : imageFile,
          videoFile === null ? undefined : videoFile,
          editingMemory.imageUrl,
          editingMemory.imagePublicId,
          editingMemory.videoUrl,
          editingMemory.videoPublicId
        );
      } else {
        await addMemory(title, description, imageFile === null ? undefined : imageFile, videoFile === null ? undefined : videoFile);
      }
      onMemoryAddedOrUpdated();
      setTitle('');
      setDescription('');
      setImageFile(undefined);
      setVideoFile(undefined);
      setCurrentImageUrl(undefined);
      setCurrentVideoUrl(undefined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          {currentImageUrl && !imageFile && (
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              Current Image: <a href={currentImageUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-indigo-600 hover:underline">View</a>
              <button
                type="button"
                onClick={() => { setImageFile(null); setCurrentImageUrl(undefined); }}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          )}
          {imageFile === null && <p className="mt-1 text-sm text-red-500">Image will be removed.</p>}
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
          {currentVideoUrl && !videoFile && (
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              Current Video: <a href={currentVideoUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-indigo-600 hover:underline">View</a>
              <button
                type="button"
                onClick={() => { setVideoFile(null); setCurrentVideoUrl(undefined); }}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          )}
          {videoFile === null && <p className="mt-1 text-sm text-red-500">Video will be removed.</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-indigo-600 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'} text-white font-bold py-2 px-4 rounded`}
        >
          {isSubmitting ? (editingMemory ? 'Updating...' : 'Adding...') : (editingMemory ? 'Update Memory' : 'Add Memory')}
        </button>
        {editingMemory && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel Edit
          </button>
        )}
      </form>
    </div>
  );
};

export default MemoryForm;