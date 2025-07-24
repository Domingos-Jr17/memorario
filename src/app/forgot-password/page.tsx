/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Mail, Send, LogIn } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      toast.success('Password reset email sent! Please check your inbox.');
      setEmail(''); // Clear the input field
    } catch (err: any) {
      const message = err?.message ?? 'Failed to send reset email.';
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-background px-4"
    >
      <div className="w-full max-w-md space-y-8 p-8 bg-background rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className={`w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none transition duration-200 ${
              isSubmitting
                ? 'bg-primary/70 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isSubmitting ? 'Sending...' : <><Send className="h-5 w-5" /> Send Reset Link</>}
          </motion.button>
        </form>
        
        <div className="text-sm text-center mt-4">
          <a href="/login" className="text-indigo-600 hover:underline flex items-center justify-center">
            <LogIn className="h-4 w-4 mr-1" /> Back to Sign in
          </a>
        </div>
      </div>
    </motion.div>
  );
}
