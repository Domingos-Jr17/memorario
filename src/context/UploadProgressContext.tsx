"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UploadProgressContextType {
  totalProgress: number;
  isUploading: boolean;
  setUploadProgress: (progress: number) => void;
  setUploadingState: (uploading: boolean) => void;
}

const UploadProgressContext = createContext<UploadProgressContextType | undefined>(undefined);

export const UploadProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [totalProgress, setTotalProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const setUploadProgress = (progress: number) => {
    setTotalProgress(progress);
  };

  const setUploadingState = (uploading: boolean) => {
    setIsUploading(uploading);
  };

  return (
    <UploadProgressContext.Provider value={{ totalProgress, isUploading, setUploadProgress, setUploadingState }}>
      {children}
    </UploadProgressContext.Provider>
  );
};

export const useUploadProgress = () => {
  const context = useContext(UploadProgressContext);
  if (context === undefined) {
    throw new Error('useUploadProgress must be used within an UploadProgressProvider');
  }
  return context;
};
