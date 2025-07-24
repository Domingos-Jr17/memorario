
import { useState, useCallback } from 'react';
import { validateFiles, MAX_FILE_SIZE_BYTES } from '@/lib/file-validation';
import { toast } from 'sonner';

interface ExistingMedia {
  url: string;
  publicId: string;
}

export interface FileUploadItem {
  id: string; // Unique ID for the file upload item
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  progress: number;
  error?: string;
}

interface FileError {
  file: File;
  errors: string[];
}

interface UseFileUploadReturn {
  existingMedia: ExistingMedia[];
  fileUploads: FileUploadItem[];
  validationErrors: FileError[];
  addFiles: (newFiles: FileList | null, allowedTypes: string[]) => void;
  removeFile: (id: string) => void;
  retryUpload: (id: string) => void; // Add retry function
  removeExistingMedia: (index: number) => void;
  reset: (newMedia?: ExistingMedia[]) => void;
  clearValidationErrors: () => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (id: string, status: FileUploadItem['status'], error?: string) => void;
  filesToUpload: FileUploadItem[];
}

export function useFileUpload(initialMedia: ExistingMedia[] = []): UseFileUploadReturn {
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>(initialMedia);
  const [fileUploads, setFileUploads] = useState<FileUploadItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<FileError[]>([]);

  const addFiles = useCallback((newFiles: FileList | null, allowedTypes: string[]) => {
    if (!newFiles) return;

    const filesArray = Array.from(newFiles);
    const { validFiles, errors } = validateFiles(filesArray, allowedTypes, MAX_FILE_SIZE_BYTES);

    if (errors.length > 0) {
      setValidationErrors(prev => [...prev, ...errors]);
      errors.forEach(error => {
        toast.error(`Erro no arquivo ${error.file.name}: ${error.errors.join(', ')}`);
      });
    }

    const newUploadItems: FileUploadItem[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Simple unique ID
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));

    setFileUploads(prev => [...prev, ...newUploadItems]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFileUploads(prev => {
      const itemToRemove = prev.find(item => item.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const removeExistingMedia = useCallback((index: number) => {
    setExistingMedia(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback((newMedia: ExistingMedia[] = []) => {
    fileUploads.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setFileUploads([]);
    setExistingMedia(newMedia);
    setValidationErrors([]);
  }, [fileUploads]);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  const updateFileProgress = useCallback((id: string, progress: number) => {
    setFileUploads(prev =>
      prev.map(item => (item.id === id ? { ...item, progress } : item))
    );
  }, []);

  const updateFileStatus = useCallback((id: string, status: FileUploadItem['status'], error?: string) => {
    setFileUploads(prev =>
      prev.map(item => (item.id === id ? { ...item, status, error: error || item.error } : item))
    );
  }, []);

  const filesToUpload = fileUploads.filter(item => item.status === 'pending' || item.status === 'failed');

  const retryUpload = useCallback((id: string) => {
    setFileUploads(prev =>
      prev.map(item =>
        item.id === id && item.status === 'failed'
          ? { ...item, status: 'pending', progress: 0, error: undefined }
          : item
      )
    );
  }, []);

  return {
    existingMedia,
    fileUploads,
    validationErrors,
    addFiles,
    removeFile,
    retryUpload, // Expose retry function
    removeExistingMedia,
    reset,
    clearValidationErrors,
    updateFileProgress,
    updateFileStatus,
    filesToUpload,
  };
}
