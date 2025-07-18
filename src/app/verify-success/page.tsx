"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifySuccessPage() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100"
        >
          <CheckCircle className="h-10 w-10 text-green-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mt-6">Email Verified!</h1>
        <p className="text-gray-700 mt-3 mb-8">
          Your account has been successfully activated. You can now log in.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRedirect}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Continue to Login
        </motion.button>
      </motion.div>
    </div>
  );
}
