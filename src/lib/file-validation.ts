
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

interface FileError {
  file: File;
  errors: string[];
}

export const validateFiles = (
  files: File[],
  allowedTypes: string[],
  maxSize: number
): { validFiles: File[]; errors: FileError[] } => {
  const validFiles: File[] = [];
  const errors: FileError[] = [];

  files.forEach(file => {
    const fileErrors: string[] = [];

    if (!allowedTypes.includes(file.type)) {
      fileErrors.push(`Tipo de arquivo inválido: ${file.type}`);
    }

    if (file.size > maxSize) {
      fileErrors.push(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máx: ${MAX_FILE_SIZE_MB}MB)`);
    }

    if (fileErrors.length > 0) {
      errors.push({ file, errors: fileErrors });
    } else {
      validFiles.push(file);
    }
  });

  return { validFiles, errors };
};
