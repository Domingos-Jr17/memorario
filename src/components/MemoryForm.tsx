/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Editor from './Editor';
import { addMemory, updateMemory } from '@/lib/memoryService';
import { Memory } from '@/types/memory';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video as VideoIcon, Trash2 } from 'lucide-react';

// Hook para upload múltiplo de arquivos 
import { useCallback } from 'react';

function useMultiFileInput(initialMedia?: { url: string; publicId: string }[]) {
  const [files, setFiles] = useState<File[]>([]);
  const [media, setMedia] = useState<{ url: string; publicId: string }[]>(initialMedia || []);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const filesArray = Array.from(newFiles);
    setFiles(prev => [...prev, ...filesArray]);
  }, []);

  const removeFileByIndex = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeMediaByIndex = useCallback((index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback((newMedia?: { url: string; publicId: string }[]) => {
    setFiles([]);
    setMedia(newMedia || []);
  }, []);

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
  isAdmin?: boolean; // indicar se o usuário é admin para limitação de uploads
}

const MAX_UPLOADS_FOR_UTENTE = 15;

const MemoryForm: React.FC<MemoryFormProps> = ({
  editingMemory,
  onMemoryAddedOrUpdated,
  onCancelEdit,
  isAdmin = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const imageInput = useMultiFileInput(editingMemory?.images);
  const videoInput = useMultiFileInput(editingMemory?.videos);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualiza estados se estiver editando memória
  useEffect(() => {
    if (editingMemory) {
      setTitle(editingMemory.title);
      setDescription(editingMemory.description || '');
      setIsPublic(editingMemory.isPublic || false);
      setTags(editingMemory.tags || []);
      imageInput.reset(editingMemory.images);
      videoInput.reset(editingMemory.videos);
    } else {
      setTitle('');
      setDescription('');
      setIsPublic(false);
      setTags([]);
      imageInput.reset();
      videoInput.reset();
    }
  }, [editingMemory]);

  // Verifica limite de arquivos permitidos para utentes (não admin)
  const canAddMoreFiles = (type: 'image' | 'video', newFilesCount: number) => {
    if (isAdmin) return true; // admin ilimitado

    // total arquivos atuais
    const currentImagesCount = imageInput.files.length + imageInput.media.length;
    const currentVideosCount = videoInput.files.length + videoInput.media.length;

    if (type === 'image') {
      return (currentImagesCount + newFilesCount) <= MAX_UPLOADS_FOR_UTENTE;
    }
    if (type === 'video') {
      return (currentVideosCount + newFilesCount) <= MAX_UPLOADS_FOR_UTENTE;
    }
    return false;
  };

  // Handler para adicionar imagens
  const handleAddImages = (files: FileList | null) => {
    if (!files) return;
    if (!canAddMoreFiles('image', files.length)) {
      toast.error(`Você pode adicionar até ${MAX_UPLOADS_FOR_UTENTE} imagens no total.`);
      return;
    }
    imageInput.addFiles(files);
  };

  // Handler para adicionar vídeos
  const handleAddVideos = (files: FileList | null) => {
    if (!files) return;
    if (!canAddMoreFiles('video', files.length)) {
      toast.error(`Você pode adicionar até ${MAX_UPLOADS_FOR_UTENTE} vídeos no total.`);
      return;
    }
    videoInput.addFiles(files);
  };

  const handleAddOrUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!title.trim()) {
        toast.error('O título é obrigatório.');
        setIsSubmitting(false);
        return;
      }

      if (editingMemory) {
        await updateMemory(
          editingMemory.id!,
          title,
          description,
          isPublic,
          imageInput.files,
          videoInput.files,
          imageInput.media,
          videoInput.media,
          tags
        );
        toast.success('Memória atualizada com sucesso!');
      } else {
        await addMemory(title, description, isPublic, imageInput.files, videoInput.files, tags);
        toast.success('Memória adicionada com sucesso!');
      }

      onMemoryAddedOrUpdated();
      setTitle('');
      setDescription('');
      imageInput.reset();
      videoInput.reset();
    } catch (err: any) {
      toast.error(`Erro: ${err.message || 'Ocorreu um erro inesperado.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-xl p-8 mb-8 border border-gray-200"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        {editingMemory ? 'Editar Memória' : 'Adicionar Nova Memória'}
      </h2>
      <form onSubmit={handleAddOrUpdateMemory} className="space-y-6" noValidate>
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
          <Editor initialContent={description} onContentChange={setDescription} />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-1">Tags (separadas por vírgula)</label>
          <input
            type="text"
            id="tags"
            value={tags.join(', ')}
            onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''))}
            disabled={isSubmitting}
            className="mt-1 block w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900"
          />
        </div>

        {/* Upload imagens */}
        <div>
          <label htmlFor="images" className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
            <ImageIcon className="inline w-5 h-5 mr-2 text-gray-600" /> Imagens (opcional)
          </label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={e => handleAddImages(e.target.files)}
            disabled={isSubmitting}
          />
          {/* Listagem arquivos imagens */}
          {[...imageInput.media, ...imageInput.files.map(f => ({ url: f.name, publicId: '' }))].map((file, index) => (
            <div key={index} className="flex items-center mt-2 p-2 bg-gray-50 border rounded-md">
              <span className="text-sm text-gray-600">{file.publicId ? 'Existente' : 'Nova'} Imagem {index + 1}</span>
              {file.url && file.publicId && (
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-600 hover:underline">Ver</a>
              )}
              <button
                type="button"
                onClick={() =>
                  file.publicId
                    ? imageInput.removeMediaByIndex(index)
                    : imageInput.removeFileByIndex(index - imageInput.media.length)
                }
                className="ml-auto text-red-600 hover:text-red-800 p-1"
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Upload vídeos */}
        <div>
          <label htmlFor="videos" className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
            <VideoIcon className="inline w-5 h-5 mr-2 text-gray-600" /> Vídeos (opcional)
          </label>
          <input
            type="file"
            id="videos"
            multiple
            accept="video/*"
            onChange={e => handleAddVideos(e.target.files)}
            disabled={isSubmitting}
          />
          {[...videoInput.media, ...videoInput.files.map(f => ({ url: f.name, publicId: '' }))].map((file, index) => (
            <div key={index} className="flex items-center mt-2 p-2 bg-gray-200 border rounded-md">
              <span className="text-sm text-gray-600">{file.publicId ? 'Existente' : 'Novo'} Vídeo {index + 1}</span>
              {file.url && file.publicId && (
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-600 hover:underline">Ver</a>
              )}
              <button
                type="button"
                onClick={() =>
                  file.publicId
                    ? videoInput.removeMediaByIndex(index)
                    : videoInput.removeFileByIndex(index - videoInput.media.length)
                }
                className="ml-auto text-red-600 hover:text-red-800 p-1"
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Toggle público */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            Compartilhar essa memória publicamente
          </label>
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            {isSubmitting ? 'Salvando...' : editingMemory ? 'Atualizar Memória' : 'Adicionar Memória'}
          </motion.button>

          {editingMemory && (
            <motion.button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default MemoryForm;
