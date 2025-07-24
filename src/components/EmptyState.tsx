import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center p-8 bg-background rounded-lg shadow-md border border-primary"
    >
      <div className="mx-auto mb-4 text-primary">
        {icon || <Inbox size={48} />}
      </div>
      <h3 className="text-xl font-semibold text-text">{title}</h3>
      <p className="text-text/70 mt-2">{message}</p>
    </motion.div>
  );
};

export default EmptyState;