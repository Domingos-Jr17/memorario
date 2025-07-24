import React, { useState, useEffect, useCallback } from 'react';
import Editor from './Editor';
import { addMemory, updateMemory } from '@/lib/memoryService';
import { Memory } from '@/types/memory';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useTagInput } from '@/hooks/useTagInput';
import FilePreview from './FilePreview';
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES } from '@/lib/file-validation';
import { Input } from '@/components/ui/input';
import { useUploadProgress } from '@/context/UploadProgressContext';

interface MemoryFormProps {
  editingMemory: Memory | null;
  onMemoryAddedOrUpdated: () => void;
  onCancelEdit: () => void;
  isAdmin?: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const { tags, inputValue, handleInputChange, handleInputKeyDown, removeTag, resetTags, suggestions, addTagFromSuggestion } = useTagInput(editingMemory?.tags);
  const imageInput = useFileUpload(editingMemory?.images);
  const videoInput = useFileUpload(editingMemory?.videos);
  const { setUploadingState, setUploadProgress } = useUploadProgress();

  useEffect(() => {
    if (editingMemory) {
      setTitle(editingMemory.title);
      setDescription(editingMemory.description || '');
      setIsPublic(editingMemory.isPublic || false);
      resetTags(editingMemory.tags || []);
      imageInput.reset(editingMemory.images);
      videoInput.reset(editingMemory.videos);
    } else {
      setTitle('');
      setDescription('');
      setIsPublic(false);
      resetTags();
      imageInput.reset();
      videoInput.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMemory]);

  const canAddMoreFiles = (type: 'image' | 'video', newFilesCount: number) => {
    if (isAdmin) return true;
    const currentCount = type === 'image'
      ? imageInput.existingMedia.length + imageInput.fileUploads.length
      : videoInput.existingMedia.length + videoInput.fileUploads.length;
    return (currentCount + newFilesCount) <= MAX_UPLOADS_FOR_UTENTE;
  };

  const handleFileChange = (type: 'image' | 'video', files: FileList | null) => {
    if (!files) return;

    if (!canAddMoreFiles(type, files.length)) {
      toast.error(`Você pode adicionar até ${MAX_UPLOADS_FOR_UTENTE} ${type === 'image' ? 'imagens' : 'vídeos'}.`);
      return;
    }

    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    const input = type === 'image' ? imageInput : videoInput;
    input.addFiles(files, allowedTypes);
  };

  const validateForm = useCallback(() => {
    const errors: { [key: string]: string } = {};
    if (!title.trim()) {
      errors.title = 'O título é obrigatório.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title]);

  const handleAddOrUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const onOverallProgress = (progress: number) => {
      setUploadProgress(progress);
    };

    const onUploadStartEnd = (isUploading: boolean) => {
      setUploadingState(isUploading);
    };

    try {
      if (editingMemory) {
        await updateMemory(
          editingMemory.id!,
          title,
          description,
          isPublic,
          imageInput.filesToUpload.map(item => item.file),
          videoInput.filesToUpload.map(item => item.file),
          imageInput.existingMedia,
          videoInput.existingMedia,
          tags,
          onOverallProgress,
          onUploadStartEnd
        );
        toast.success('Memória atualizada com sucesso!');
      } else {
        await addMemory(
          title,
          description,
          isPublic,
          imageInput.filesToUpload.map(item => item.file),
          videoInput.filesToUpload.map(item => item.file),
          tags,
          onOverallProgress,
          onUploadStartEnd
        );
        toast.success('Memória adicionada com sucesso!');
      }

      onMemoryAddedOrUpdated();
      setTitle('');
      setDescription('');
      setIsPublic(false);
      resetTags();
      imageInput.reset();
      videoInput.reset();
    } catch (err: unknown) {
      toast.error(`Erro: ${(err as Error).message || 'Ocorreu um erro inesperado.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background shadow-lg rounded-xl p-8 mb-8 border border-primary"
    >
      <h2 className="text-3xl font-bold text-text mb-6 text-center">
        {editingMemory ? 'Editar Memória' : 'Adicionar Nova Memória'}
      </h2>
      <form onSubmit={handleAddOrUpdateMemory} className="space-y-6" noValidate>
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-text mb-1">Título</label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={`${formErrors.title ? 'border-error' : 'border-primary'}`}
            aria-invalid={!!formErrors.title}
            aria-describedby="title-error"
          />
          {formErrors.title && <p id="title-error" className="text-sm text-error mt-1" aria-live="polite">{formErrors.title}</p>}
        </div>

        <div>
          <label htmlFor='description' className="block text-sm font-semibold text-text mb-1">Descrição</label>
          <Editor initialContent={description} onContentChange={setDescription} />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-semibold text-text mb-1">Tags</label>
          <div className="flex flex-wrap items-center gap-2 p-2 border border-primary rounded-lg bg-background">
            {tags.map(tag => (
              <div key={tag} className="flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium px-2.5 py-0.5 rounded-full">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-white hover:text-primary/90">
                  <X size={14} />
                </button>
              </div>
            ))}
            <Input
              type="text"
              id="tags"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder={tags.length === 0 ? 'Adicione tags (ex: viagem, família)' : ''}
              className="flex-1 bg-transparent outline-none text-base text-text min-w-[150px] border-none focus:ring-0"
            />
          </div>
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map(tag => (
                <motion.button
                  key={tag}
                  type="button"
                  onClick={() => addTagFromSuggestion(tag)}
                  className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm hover:bg-accent/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Upload de Imagens */}
        <div>
          <label htmlFor="images" className="block text-sm font-semibold text-text mb-1 items-center">
            <ImageIcon className="inline w-5 h-5 mr-2 text-text/70" /> Imagens (opcional)
          </label>
          <input
            type="file"
            id="images"
            multiple
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={e => handleFileChange('image', e.target.files)}
            disabled={isSubmitting || imageInput.fileUploads.some(f => f.status === 'uploading') || videoInput.fileUploads.some(f => f.status === 'uploading')}
            className='block w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90'
          />
          <div className="mt-4 flex flex-wrap gap-4">
            <AnimatePresence>
              {imageInput.fileUploads.map((fileItem) => (
                <FilePreview
                  key={fileItem.id}
                  fileItem={fileItem}
                  onRemove={() => imageInput.removeFile(fileItem.id)}
                  onRetry={() => imageInput.retryUpload(fileItem.id)}
                  isSubmitting={isSubmitting || imageInput.fileUploads.some(f => f.status === 'uploading') || videoInput.fileUploads.some(f => f.status === 'uploading')}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Upload de Vídeos */}
        <div>
          <label htmlFor="videos" className="block text-sm font-semibold text-text mb-1 items-center">
            <VideoIcon className="inline w-5 h-5 mr-2 text-text/70" /> Vídeos (opcional)
          </label>
          <input
            type="file"
            id="videos"
            multiple
            accept={ALLOWED_VIDEO_TYPES.join(',')}
            onChange={e => handleFileChange('video', e.target.files)}
            disabled={isSubmitting || imageInput.fileUploads.some(f => f.status === 'uploading') || videoInput.fileUploads.some(f => f.status === 'uploading')}
            className='block w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90'
          />
          <div className="mt-4 flex flex-wrap gap-4">
            <AnimatePresence>
              {videoInput.fileUploads.map((fileItem) => (
                <FilePreview
                  key={fileItem.id}
                  fileItem={fileItem}
                  onRemove={() => videoInput.removeFile(fileItem.id)}
                  onRetry={() => videoInput.retryUpload(fileItem.id)}
                  isSubmitting={isSubmitting || imageInput.fileUploads.some(f => f.status === 'uploading') || videoInput.fileUploads.some(f => f.status === 'uploading')}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            disabled={isSubmitting || imageInput.fileUploads.some(f => f.status === 'uploading') || videoInput.fileUploads.some(f => f.status === 'uploading')}
            className="h-4 w-4 text-primary-DEFAULT focus:ring-primary border-primary rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-text">
            Compartilhar essa memória publicamente
          </label>
        </div>

        <div className="flex gap-4">
          <motion.button
            type="submit"
            disabled={isSubmitting || imageInput.fileUploads.some(f => f.status === 'uploading') || videoInput.fileUploads.some(f => f.status === 'uploading')}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isSubmitting || imageInput.fileUploads.some(f => f.status === 'uploading') || videoInput.fileUploads.some(f => f.status === 'uploading') ? 'saving' : 'save'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {isSubmitting || imageInput.fileUploads.some(f => f.status === 'uploading') || videoInput.fileUploads.some(f => f.status === 'uploading') ? 'Salvando...' : editingMemory ? 'Atualizar Memória' : 'Adicionar Memória'}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {editingMemory && (
            <motion.button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting || imageInput.fileUploads.some(f => f.status === 'uploading') || videoInput.fileUploads.some(f => f.status === 'uploading')}
              className="flex-1 px-6 py-3 bg-background border border-primary text-text font-medium rounded-lg hover:bg-background/90 disabled:bg-background/90 transition-colors"
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

