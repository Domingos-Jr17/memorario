import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, File as FileIcon, Loader2, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import { FileUploadItem } from '@/hooks/useFileUpload';

interface FilePreviewProps {
  fileItem: FileUploadItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  isSubmitting: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FilePreview: React.FC<FilePreviewProps> = ({ fileItem, onRemove, onRetry, isSubmitting }) => {
  const isImage = fileItem.file.type.startsWith('image/');
  const isVideo = fileItem.file.type.startsWith('video/');

  const getStatusColor = () => {
    switch (fileItem.status) {
      case 'uploading':
        return 'text-primary';
      case 'success':
        return 'text-success';
      case 'failed':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (fileItem.status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileIcon className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="relative w-40 h-48 border border-input rounded-lg overflow-hidden shadow-sm flex flex-col bg-background"
    >
      <div className="relative w-full h-2/3 bg-accent flex items-center justify-center">
        {isImage ? (
          <Image src={fileItem.previewUrl} alt={`Preview of ${fileItem.file.name}`} fill style={{ objectFit: 'cover' }} />
        ) : isVideo ? (
          <video src={fileItem.previewUrl} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent">
            <FileIcon className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        {!isSubmitting && fileItem.status !== 'uploading' && (
          <button
            type="button"
            onClick={() => onRemove(fileItem.id)}
            aria-label={`Remove ${fileItem.file.name}`}
            className="absolute top-1 right-1 bg-error text-error-foreground rounded-full p-1.5 hover:bg-error/90 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex-1 p-2 bg-background text-xs flex flex-col justify-between">
        <div>
          <p className="font-semibold text-text truncate" title={fileItem.file.name}>{fileItem.file.name}</p>
          <p className="text-muted-foreground">{formatFileSize(fileItem.file.size)}</p>
          <div className={`flex items-center gap-1 mt-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="capitalize">{fileItem.status}</span>
            {fileItem.status === 'uploading' && <span className="ml-auto">{fileItem.progress}%</span>}
          </div>
          {fileItem.status === 'failed' && fileItem.error && (
            <p className="text-error text-xs mt-1" title={fileItem.error}>Error: {fileItem.error}</p>
          )}
        </div>
        {fileItem.status === 'failed' && (
          <button
            type="button"
            onClick={() => onRetry(fileItem.id)}
            className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 transition-colors"
          >
            <RefreshCcw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(FilePreview);
