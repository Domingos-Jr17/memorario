"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useUploadProgress } from '@/context/UploadProgressContext';

const GlobalProgressBar: React.FC = () => {
  const { totalProgress, isUploading } = useUploadProgress();

  return (
    <>
      {isUploading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-primary z-50">
          <motion.div
            className="h-full bg-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          />
        </div>
      )}
    </>
  );
};

export default GlobalProgressBar;
