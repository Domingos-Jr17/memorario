/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { addMemory, updateMemory } from '@/lib/memoryService';
import { Memory } from '@/types/memory';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video as VideoIcon, Trash2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

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
}

interface EditorToolbarProps {
  editor: any;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-gray-300 bg-gray-50">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        Strike
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        Code
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Clear marks
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive('paragraph') ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        Paragraph
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        Ordered List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        Code Block
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active px-3 py-1 rounded bg-indigo-500 text-white' : 'px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300'}
      >
        Blockquote
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Horizontal Rule
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Hard Break
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Redo
      </button>
    </div>
  );
};

const MemoryForm: React.FC<MemoryFormProps> = ({
  editingMemory,
  onMemoryAddedOrUpdated,
  onCancelEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const imageInput = useMultiFileInput(editingMemory?.images);
  const videoInput = useMultiFileInput(editingMemory?.videos);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: description,
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none',
      },
    },
  }, [description]);

  useEffect(() => {
    if (editingMemory) {
      setTitle(editingMemory.title);
      setDescription(editingMemory.description || '');
      setIsPublic(editingMemory.isPublic || false);
      imageInput.reset(editingMemory.images);
      videoInput.reset(editingMemory.videos);
      // Only set editor content if editor is ready and description has changed
      if (editor && editor.getHTML() !== (editingMemory.description || '')) {
        editor.commands.setContent(editingMemory.description || '');
      }
    } else {
      setTitle('');
      setDescription('');
      setIsPublic(false);
      imageInput.reset();
      videoInput.reset();
      // Only clear editor content if editor is ready and not already empty
      if (editor && editor.getHTML() !== '') {
        editor.commands.clearContent();
      }
    }
  }, [editingMemory]); // Removed editor, imageInput, videoInput from dependencies

  const handleAddOrUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingMemory) {
        await updateMemory(
          editingMemory.id!,
          title,
          description,
          isPublic,
          imageInput.files,
          videoInput.files,
          imageInput.media,
          videoInput.media
        );
        toast.success('Memory updated successfully!');
      } else {
        await addMemory(title, description, isPublic, imageInput.files, videoInput.files);
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
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[150px]" />
          </div>
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

        

        {/* Public Toggle */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            Share this memory publicly
          </label>
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
