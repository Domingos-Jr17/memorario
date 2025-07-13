/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Loader2, UserPlus } from "lucide-react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 1. Definindo o esquema de validação com Zod
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// 2. Derivar o tipo TS automaticamente
type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  // 3. Inicializando react-hook-form com zodResolver para validar usando o esquema
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // 4. Função para lidar com o submit validado
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login(data.email, data.password);
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (err: any) {
      if (
        err.message &&
        err.message.toLowerCase().includes("confirme seu email")
      ) {
        toast.warning("Confirme seu email antes de fazer login.");
        router.push("/verify-email");
      } else {
        toast.error(`Login failed: ${err.message}`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
            Sign in to your account
          </h2>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email-address"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none rounded-t-md relative block w-full pl-10 pr-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Email address"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby="email-error"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p
                  id="email-error"
                  className="mt-1 text-xs text-red-600"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`appearance-none rounded-b-md relative block w-full pl-10 pr-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Password"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby="password-error"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-1 text-xs text-red-600"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out`}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2
                  className="animate-spin h-5 w-5 text-white"
                  aria-hidden="true"
                />
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" aria-hidden="true" /> Sign in
                </>
              )}
            </motion.button>
          </div>
        </form>

        {/* Separator */}
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              or continue with
            </span>
          </div>
        </div>

        {/* Google Login */}
        <GoogleLoginButton />

        {/* Signup Link */}
        <div className="text-sm text-center mt-6">
          <a
            href="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center"
          >
            <UserPlus className="h-4 w-4 mr-1" aria-hidden="true" /> Don&apos;t
            have an account? Sign up
          </a>
        </div>
      </div>
    </motion.div>
  );
}
