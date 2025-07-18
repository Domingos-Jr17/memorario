/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  UserPlus,
  Loader2,
  LogIn,
  Eye,
  EyeOff,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 1. Definindo o esquema de validação com Zod
const signupSchema = z.object({
  username: z.string().min(1, "Username is required."),
  email: z.string().min(1, "Email is required.").email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(1, "Confirm Password is required."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

// 2. Derivar o tipo TS automaticamente
type SignupFormInputs = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signup, googleSignIn } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Inicializando react-hook-form com zodResolver para validar usando o esquema
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  // 4. Função para lidar com o submit validado
  const onSubmit = async (data: SignupFormInputs) => {
    setIsSubmitting(true);
    try {
      await signup(data.email, data.password, data.username);
      toast.success('Account created! Please verify your email.');
      setTimeout(() => router.push('/verify-email'), 1000); // Atraso de 1s
    } catch (err: any) {
      const message = err?.message ?? 'Signup failed.';
      toast.error(`Signup failed: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);

    try {
      await googleSignIn();
      toast.success('Signed in with Google!');
      setTimeout(() => router.push('/'), 1000); // Atraso de 1s
    } catch (err: any) {
      const message = err?.message ?? 'Google Sign-in failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Username */}
          <div>
            <input
              id="username"
              type="text"
              placeholder="Username"
              className={`w-full px-3 py-2 border ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              {...register("username")}
            />
            {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              className={`w-full pl-10 pr-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className={`w-full pl-10 pr-10 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
            </button>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              className={`w-full pl-10 pr-10 py-2 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
            </button>
            {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Global Error */}
          {/* {error && <p className="text-sm text-red-600 text-center">{error}</p>} */}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className={`w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none transition duration-200 ${
              isSubmitting
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><UserPlus className="h-5 w-5" /> Sign up</>}
          </motion.button>
        </form>

        {/* Separator */}
        <div className="flex items-center justify-center mt-4">
          <div className="border-t w-full border-gray-300" />
          <span className="px-2 text-sm text-gray-500">or</span>
          <div className="border-t w-full border-gray-300" />
        </div>

        {/* Google Sign-in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center mt-4 gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition"
        >
          <FcGoogle className="h-5 w-5" />
          Sign up with Google
        </button>

        {/* Login link */}
        <div className="text-sm text-center mt-4">
          <a href="/login" className="text-indigo-600 hover:underline flex items-center justify-center">
            <LogIn className="h-4 w-4 mr-1" /> Already have an account? Sign in
          </a>
        </div>
      </div>
    </motion.div>
  );
}
